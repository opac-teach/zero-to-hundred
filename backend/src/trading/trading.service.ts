import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { TradeResponseDto } from './dto';
import {
  calculateBuyPrice,
  calculatePrice,
  calculateSellPrice,
} from './bonding-curve';
import BigNumber from 'bignumber.js';
import { TradeMemecoinDto } from './dto/trade-memecoin.dto';

@Injectable()
export class TradingService {
  constructor(
    @InjectRepository(Memecoin)
    private readonly memecoinRepository: Repository<Memecoin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletHolding)
    private readonly walletHoldingRepository: Repository<WalletHolding>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async tradeMemecoin(
    userId: string,
    tradeDto: TradeMemecoinDto,
  ): Promise<TradeResponseDto> {
    const {
      memecoinId,
      amount,
      requestCost,
      slippageTolerance = 1,
      tradeType,
    } = tradeDto;

    if (new BigNumber(amount).isLessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Find user and wallet
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(Wallet, {
        where: { ownerId: userId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const memecoin = await queryRunner.manager.findOne(Memecoin, {
        where: { id: memecoinId },
      });
      if (!memecoin) {
        throw new NotFoundException('Memecoin not found');
      }
      let cost = '0';
      if (tradeType === 'buy') {
        cost = calculateBuyPrice(amount, memecoin.totalSupply);
      } else {
        cost = calculateSellPrice(amount, memecoin.totalSupply);
      }

      let holding = await queryRunner.manager.findOne(WalletHolding, {
        where: { walletId: wallet.id, memecoinId },
      });

      if (
        tradeType === 'buy' &&
        new BigNumber(wallet.zthBalance).isLessThan(cost)
      ) {
        throw new BadRequestException('Insufficient ZTH balance');
      } else if (tradeType === 'sell') {
        if (!holding || new BigNumber(holding.amount).isLessThan(amount)) {
          throw new BadRequestException('Insufficient memecoin balance');
        }
      }

      const costChange = new BigNumber(cost)
        .minus(requestCost)
        .div(requestCost)
        .abs()
        .times(100);
      if (costChange.isGreaterThan(slippageTolerance)) {
        throw new BadRequestException(
          `Cost slippage exceeds tolerance: ${costChange.toFixed(2)}%`,
        );
      }

      let walletZTHBalance = new BigNumber(wallet.zthBalance);
      if (tradeType === 'buy') {
        walletZTHBalance = walletZTHBalance.minus(cost);
      } else {
        walletZTHBalance = walletZTHBalance.plus(cost);
      }
      wallet.zthBalance = walletZTHBalance.toString();
      await queryRunner.manager.save(wallet);

      let newSupply = new BigNumber(memecoin.totalSupply);
      if (tradeType === 'buy') {
        newSupply = newSupply.plus(amount);
      } else {
        newSupply = newSupply.minus(amount);
      }
      const newPrice = calculatePrice(newSupply.toString());

      memecoin.totalSupply = newSupply.toString();
      memecoin.currentPrice = newPrice;
      await queryRunner.manager.save(memecoin);

      if (tradeType === 'buy') {
        if (holding) {
          holding.amount = new BigNumber(holding.amount)
            .plus(amount)
            .toString();
        } else {
          holding = this.walletHoldingRepository.create({
            walletId: wallet.id,
            memecoinId,
            amount: amount.toString(),
          });
        }
        holding = await queryRunner.manager.save(holding);
      } else {
        holding.amount = new BigNumber(holding.amount).minus(amount).toString();
        if (new BigNumber(holding.amount).isEqualTo(0)) {
          await queryRunner.manager.remove(holding);
        } else {
          await queryRunner.manager.save(holding);
        }
      }

      const transaction = this.transactionRepository.create({
        userId,
        memecoinId,
        type: tradeType === 'buy' ? TransactionType.BUY : TransactionType.SELL,
        memeCoinAmount: amount.toString(),
        zthAmount: amount.toString(),
        price: memecoin.currentPrice,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return response
      return new TradeResponseDto({
        transaction: savedTransaction,
        memecoin: memecoin,
        walletHolding: holding,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
