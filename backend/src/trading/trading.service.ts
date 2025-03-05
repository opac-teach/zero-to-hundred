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
import { BuyMemecoinDto, SellMemecoinDto, TradeResponseDto } from './dto';
import { calculatePrice } from './bonding-curve';
import BigNumber from 'bignumber.js';

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

  async buyMemecoin(
    userId: string,
    buyDto: BuyMemecoinDto,
  ): Promise<TradeResponseDto> {
    const { memecoinId, amount, requestPrice, slippageTolerance = 1 } = buyDto;

    if (new BigNumber(amount).isLessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Find user and wallet
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.walletRepository.findOne({
      where: { ownerId: userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Check if user has enough balance
    if (new BigNumber(wallet.zthBalance).isLessThan(amount)) {
      throw new BadRequestException('Insufficient ZTH balance');
    }

    // Find memecoin
    const memecoin = await this.memecoinRepository.findOne({
      where: { id: memecoinId },
    });
    if (!memecoin) {
      throw new NotFoundException('Memecoin not found');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for price slippage between request time and execution time
      const priceChange = new BigNumber(memecoin.currentPrice)
        .minus(requestPrice)
        .div(requestPrice)
        .abs()
        .times(100);

      if (priceChange.isGreaterThan(slippageTolerance)) {
        throw new BadRequestException(
          `Price slippage exceeds tolerance: ${priceChange.toFixed(2)}%`,
        );
      }

      // Calculate how many tokens the user will receive
      const tokensToReceive = new BigNumber(amount).div(memecoin.currentPrice);

      // Calculate new price after purchase
      const newSupply = new BigNumber(memecoin.totalSupply).plus(
        tokensToReceive,
      );
      const newPrice = calculatePrice(newSupply.toString());

      // Update wallet balance
      wallet.zthBalance = new BigNumber(wallet.zthBalance)
        .minus(amount)
        .toString();
      if (new BigNumber(wallet.zthBalance).isLessThan(0)) {
        throw new BadRequestException(
          'Transaction would result in negative balance',
        );
      }
      await queryRunner.manager.save(wallet);

      // Update memecoin supply
      memecoin.totalSupply = newSupply.toString();
      memecoin.currentPrice = newPrice;
      await queryRunner.manager.save(memecoin);

      // Update or create wallet holding
      let holding = await this.walletHoldingRepository.findOne({
        where: { walletId: wallet.id, memecoinId },
      });

      if (holding) {
        holding.amount = new BigNumber(holding.amount)
          .plus(tokensToReceive)
          .toString();
        holding = await queryRunner.manager.save(holding);
      } else {
        holding = this.walletHoldingRepository.create({
          walletId: wallet.id,
          memecoinId,
          amount: tokensToReceive.toString(),
        });
        holding = await queryRunner.manager.save(holding);
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        userId,
        memecoinId,
        type: TransactionType.BUY,
        amount: tokensToReceive.toString(),
        price: memecoin.currentPrice,
        totalValue: amount.toString(),
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return response
      return new TradeResponseDto({
        transactionId: savedTransaction.id,
        type: savedTransaction.type,
        memecoinId: memecoin.id,
        memecoinSymbol: memecoin.symbol,
        newHoldingAmount: new BigNumber(holding.amount).toNumber(),
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sellMemecoin(
    userId: string,
    sellDto: SellMemecoinDto,
  ): Promise<TradeResponseDto> {
    const { memecoinId, amount, requestPrice, slippageTolerance = 1 } = sellDto;

    if (new BigNumber(amount).isLessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Find user and wallet
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.walletRepository.findOne({
      where: { ownerId: userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Find memecoin
    const memecoin = await this.memecoinRepository.findOne({
      where: { id: memecoinId },
    });
    if (!memecoin) {
      throw new NotFoundException('Memecoin not found');
    }

    // Find wallet holding
    const holding = await this.walletHoldingRepository.findOne({
      where: { walletId: wallet.id, memecoinId },
    });

    if (!holding || new BigNumber(holding.amount).isLessThan(amount)) {
      throw new BadRequestException('Insufficient memecoin balance');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for price slippage between request time and execution time
      const priceChange = new BigNumber(memecoin.currentPrice)
        .minus(requestPrice)
        .div(requestPrice)
        .abs()
        .times(100);

      if (priceChange.isGreaterThan(slippageTolerance)) {
        throw new BadRequestException(
          `Price slippage exceeds tolerance: ${priceChange.toFixed(2)}%`,
        );
      }

      // Calculate how many ZTH the user will receive
      const zthToReceive = new BigNumber(amount).times(memecoin.currentPrice);

      // Calculate new price after sale
      const newSupply = new BigNumber(memecoin.totalSupply).minus(amount);
      const newPrice = calculatePrice(newSupply.toString());

      // Update wallet balance
      wallet.zthBalance = new BigNumber(wallet.zthBalance)
        .plus(zthToReceive)
        .toString();
      await queryRunner.manager.save(wallet);

      // Update memecoin supply
      memecoin.totalSupply = newSupply.toString();
      memecoin.currentPrice = newPrice;
      await queryRunner.manager.save(memecoin);

      // Update wallet holding
      holding.amount = new BigNumber(holding.amount).minus(amount).toString();
      if (new BigNumber(holding.amount).isEqualTo(0)) {
        await queryRunner.manager.remove(holding);
      } else {
        await queryRunner.manager.save(holding);
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        userId,
        memecoinId,
        type: TransactionType.SELL,
        amount: amount.toString(),
        price: memecoin.currentPrice,
        totalValue: zthToReceive.toString(),
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return response
      return new TradeResponseDto({
        transactionId: savedTransaction.id,
        type: savedTransaction.type,
        memecoinId: memecoin.id,
        memecoinSymbol: memecoin.symbol,
        newHoldingAmount: new BigNumber(holding.amount).toNumber(),
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
