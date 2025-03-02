import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { BuyMemecoinDto, SellMemecoinDto, TradeResponseDto } from './dto';

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

  async buyMemecoin(userId: string, buyDto: BuyMemecoinDto): Promise<TradeResponseDto> {
    const { memecoinId, amount, slippageTolerance = 1 } = buyDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Find user and wallet
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.walletRepository.findOne({ where: { ownerId: userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Check if user has enough balance
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Find memecoin
    const memecoin = await this.memecoinRepository.findOne({ where: { id: memecoinId } });
    if (!memecoin) {
      throw new NotFoundException('Memecoin not found');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate current price using bonding curve
      const currentPrice = this.calculatePrice(memecoin.totalSupply);
      
      // Calculate how many tokens the user will receive
      const tokensToReceive = amount / currentPrice;
      
      // Calculate new price after purchase
      const newSupply = memecoin.totalSupply + tokensToReceive;
      const newPrice = this.calculatePrice(newSupply);
      
      // Check for price slippage
      const priceChange = ((newPrice - currentPrice) / currentPrice) * 100;
      if (priceChange > slippageTolerance) {
        throw new BadRequestException(`Price slippage exceeds tolerance: ${priceChange.toFixed(2)}%`);
      }

      // Update wallet balance
      wallet.balance -= amount;
      await queryRunner.manager.save(wallet);

      // Update memecoin supply
      memecoin.totalSupply += tokensToReceive;
      memecoin.currentPrice = newPrice;
      await queryRunner.manager.save(memecoin);

      // Update or create wallet holding
      let holding = await this.walletHoldingRepository.findOne({
        where: { walletId: wallet.id, memecoinId },
      });

      if (holding) {
        holding.amount += tokensToReceive;
      } else {
        holding = this.walletHoldingRepository.create({
          walletId: wallet.id,
          memecoinId,
          amount: tokensToReceive,
        });
      }
      await queryRunner.manager.save(holding);

      // Create transaction record
      const transaction = this.transactionRepository.create({
        userId: userId,
        type: TransactionType.BUY,
        memecoinId,
        amount: tokensToReceive,
        price: currentPrice,
        totalValue: amount,
      });
      await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return trade response
      return new TradeResponseDto({
        transactionId: transaction.id,
        type: TransactionType.BUY,
        memecoinId,
        memecoinSymbol: memecoin.symbol,
        amount: tokensToReceive,
        price: currentPrice,
        totalValue: amount,
        newBalance: wallet.balance,
        newHoldingAmount: holding.amount,
        executedAt: transaction.createdAt,
      });
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async sellMemecoin(userId: string, sellDto: SellMemecoinDto): Promise<TradeResponseDto> {
    const { memecoinId, amount, slippageTolerance = 1 } = sellDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Find user and wallet
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const wallet = await this.walletRepository.findOne({ where: { ownerId: userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Find memecoin
    const memecoin = await this.memecoinRepository.findOne({ where: { id: memecoinId } });
    if (!memecoin) {
      throw new NotFoundException('Memecoin not found');
    }

    // Check if user has enough of the memecoin
    const holding = await this.walletHoldingRepository.findOne({
      where: { walletId: wallet.id, memecoinId },
    });

    if (!holding || holding.amount < amount) {
      throw new BadRequestException('Insufficient memecoin balance');
    }

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate current price using bonding curve
      const currentPrice = this.calculatePrice(memecoin.totalSupply);
      
      // Calculate how much ZTH the user will receive
      const zthToReceive = amount * currentPrice;
      
      // Calculate new price after sale
      const newSupply = memecoin.totalSupply - amount;
      const newPrice = this.calculatePrice(newSupply);
      
      // Check for price slippage
      const priceChange = ((currentPrice - newPrice) / currentPrice) * 100;
      if (priceChange > slippageTolerance) {
        throw new BadRequestException(`Price slippage exceeds tolerance: ${priceChange.toFixed(2)}%`);
      }

      // Update wallet balance
      wallet.balance += zthToReceive;
      await queryRunner.manager.save(wallet);

      // Update memecoin supply
      memecoin.totalSupply -= amount;
      memecoin.currentPrice = newPrice;
      await queryRunner.manager.save(memecoin);

      // Update wallet holding
      holding.amount -= amount;
      
      if (holding.amount > 0) {
        await queryRunner.manager.save(holding);
      } else {
        await queryRunner.manager.remove(holding);
      }

      // Create transaction record
      const transaction = this.transactionRepository.create({
        userId: userId,
        type: TransactionType.SELL,
        memecoinId,
        amount,
        price: currentPrice,
        totalValue: zthToReceive,
      });
      await queryRunner.manager.save(transaction);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return trade response
      return new TradeResponseDto({
        transactionId: transaction.id,
        type: TransactionType.SELL,
        memecoinId,
        memecoinSymbol: memecoin.symbol,
        amount,
        price: currentPrice,
        totalValue: zthToReceive,
        newBalance: wallet.balance,
        newHoldingAmount: holding.amount > 0 ? holding.amount : 0,
        executedAt: transaction.createdAt,
      });
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Calculate price based on bonding curve formula: Price = (Supply)²/10000
   */
  private calculatePrice(supply: number): number {
    return (supply * supply) / 10000;
  }
}
