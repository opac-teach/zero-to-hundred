import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction } from '../entities/transaction.entity';
import { WalletResponseDto, TransactionResponseDto } from './dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletHolding)
    private walletHoldingRepository: Repository<WalletHolding>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getWalletByUserId(userId: string): Promise<WalletResponseDto> {
    const wallet = await this.walletRepository.findOne({
      where: { ownerId: userId },
    });

    if (!wallet) {
      throw new NotFoundException(
        `Wallet for user with ID ${userId} not found`,
      );
    }

    // Get wallet holdings
    const holdings = await this.walletHoldingRepository.find({
      where: { walletId: wallet.id },
      relations: ['memecoin', 'memecoin.creator', 'memecoin.creator.wallet'],
    });

    const holdingsWithUserBalance = holdings.map((holding) => {
      const creatorWithBalance = {
        ...holding.memecoin.creator,
        zthBalance: holding.memecoin.creator.wallet?.zthBalance || 0,
      };
      return {
        ...holding,
        memecoin: {
          ...holding.memecoin,
          creator: creatorWithBalance,
        },
      };
    });

    return new WalletResponseDto({
      ...wallet,
      holdings: holdingsWithUserBalance,
    });
  }

  async getTransactionsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: [
        'memecoin',
        'memecoin.creator',
        'memecoin.creator.wallet',
        'user',
        'user.wallet',
      ],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return transactions.map((transaction) => {
      const userWithBalance = {
        ...transaction.user,
        zthBalance: transaction.user.wallet?.zthBalance || 0,
      };
      const creatorWithBalance = {
        ...transaction.memecoin.creator,
        zthBalance: transaction.memecoin.creator.wallet?.zthBalance || 0,
      };
      return new TransactionResponseDto({
        ...transaction,
        user: userWithBalance,
        memecoin: {
          ...transaction.memecoin,
          creator: creatorWithBalance,
        },
      });
    });
  }
}
