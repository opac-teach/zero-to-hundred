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
import Decimal from 'decimal.js';
import { TradeMemecoinDto } from './dto/trade-memecoin.dto';
import { TradeEstimationResponseDto } from './dto/estimate-trade-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async estimateTradeMemecoin(
    tradeDto: TradeMemecoinDto,
  ): Promise<TradeEstimationResponseDto> {
    const { memecoinId, amount, tradeType } = tradeDto;

    const memecoin = await this.memecoinRepository.findOne({
      where: { id: memecoinId },
    });

    if (!memecoin) {
      throw new NotFoundException('Memecoin not found');
    }

    try {
      let cost = '0';
      if (tradeType === 'buy') {
        cost = calculateBuyPrice(
          amount,
          memecoin.totalSupply,
          memecoin.curveConfig,
        );
      } else {
        cost = calculateSellPrice(
          amount,
          memecoin.totalSupply,
          memecoin.curveConfig,
        );
      }
      return new TradeEstimationResponseDto({
        cost,
        amount,
        memecoin,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

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

    if (new Decimal(amount).lessThanOrEqualTo(0)) {
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
        cost = calculateBuyPrice(
          amount,
          memecoin.totalSupply,
          memecoin.curveConfig,
        );
      } else {
        cost = calculateSellPrice(
          amount,
          memecoin.totalSupply,
          memecoin.curveConfig,
        );
      }

      let holding = await queryRunner.manager.findOne(WalletHolding, {
        where: { walletId: wallet.id, memecoinId },
      });

      if (
        tradeType === 'buy' &&
        new Decimal(wallet.zthBalance).lessThan(cost)
      ) {
        throw new BadRequestException('Insufficient ZTH balance');
      } else if (
        tradeType === 'sell' &&
        (!holding || new Decimal(holding.amount).lessThan(amount))
      ) {
        throw new BadRequestException('Insufficient memecoin balance');
      }

      const costChange = new Decimal(cost)
        .minus(requestCost)
        .div(requestCost)
        .abs()
        .times(100);
      if (costChange.greaterThan(slippageTolerance)) {
        throw new BadRequestException({
          message: `Cost slippage exceeds tolerance`,
          details: {
            slippage: costChange,
            requestCost,
            cost,
          },
        });
      }

      let walletZTHBalance = new Decimal(wallet.zthBalance);
      if (tradeType === 'buy') {
        walletZTHBalance = walletZTHBalance.minus(cost);
      } else {
        walletZTHBalance = walletZTHBalance.plus(cost);
      }
      wallet.zthBalance = walletZTHBalance.toString();
      await queryRunner.manager.save(wallet);

      let newSupply = new Decimal(memecoin.totalSupply);
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
          holding.amount = new Decimal(holding.amount).plus(amount).toString();
        } else {
          holding = this.walletHoldingRepository.create({
            walletId: wallet.id,
            memecoinId,
            amount: amount.toString(),
          });
        }
        holding = await queryRunner.manager.save(holding);
      } else {
        holding.amount = new Decimal(holding.amount).minus(amount).toString();
        if (new Decimal(holding.amount).eq(0)) {
          await queryRunner.manager.remove(holding);
          holding = null;
        } else {
          await queryRunner.manager.save(holding);
        }
      }

      const transaction = this.transactionRepository.create({
        userId,
        memecoinId,
        type: tradeType === 'buy' ? TransactionType.BUY : TransactionType.SELL,
        memeCoinAmount: amount.toString(),
        zthAmount: cost.toString(),
        price: new Decimal(cost).div(amount).toString(),
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      const transactionResponse = new TradeResponseDto({
        transaction: savedTransaction,
        memecoin: memecoin,
        walletHolding: holding,
        wallet: wallet,
      });

      this.eventEmitter.emit('trade', transactionResponse);

      return transactionResponse;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
