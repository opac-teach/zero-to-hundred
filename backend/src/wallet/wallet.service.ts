import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction } from '../entities/transaction.entity';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { BigNumber } from 'bignumber.js';

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
      relations: ['holdings', 'holdings.memecoin', 'holdings.memecoin.creator', 'holdings.memecoin.creator.wallet'],
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const holdingsWithUserBalance = wallet.holdings.map((holding) => {
      const creatorWithBalance = {
        ...holding.memecoin.creator,
        zthBalance: new BigNumber(holding.memecoin.creator.wallet?.zthBalance || '0').toNumber(),
        rank: 0, // TODO: Calculate actual rank
      };
      return {
        ...holding,
        amount: new BigNumber(holding.amount).toNumber(),
        memecoin: {
          ...holding.memecoin,
          totalSupply: new BigNumber(holding.memecoin.totalSupply).toNumber(),
          currentPrice: new BigNumber(holding.memecoin.currentPrice).toNumber(),
          marketCap: new BigNumber(holding.memecoin.marketCap).toNumber(),
          volume24h: new BigNumber(holding.memecoin.volume24h).toNumber(),
          creator: creatorWithBalance,
        },
      };
    });

    return new WalletResponseDto({
      ...wallet,
      zthBalance: new BigNumber(wallet.zthBalance).toNumber(),
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
      relations: ['user', 'memecoin', 'memecoin.creator', 'memecoin.creator.wallet'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return transactions.map((transaction) => {
      const userWithBalance = {
        ...transaction.user,
        zthBalance: new BigNumber(transaction.user.wallet?.zthBalance || '0').toNumber(),
        rank: 0, // TODO: Calculate actual rank
      };
      const creatorWithBalance = {
        ...transaction.memecoin.creator,
        zthBalance: new BigNumber(transaction.memecoin.creator.wallet?.zthBalance || '0').toNumber(),
        rank: 0, // TODO: Calculate actual rank
      };

      return new TransactionResponseDto({
        ...transaction,
        amount: new BigNumber(transaction.amount).toNumber(),
        price: new BigNumber(transaction.price).toNumber(),
        totalValue: new BigNumber(transaction.totalValue).toNumber(),
        user: userWithBalance,
        memecoin: {
          ...transaction.memecoin,
          totalSupply: new BigNumber(transaction.memecoin.totalSupply).toNumber(),
          currentPrice: new BigNumber(transaction.memecoin.currentPrice).toNumber(),
          marketCap: new BigNumber(transaction.memecoin.marketCap).toNumber(),
          volume24h: new BigNumber(transaction.memecoin.volume24h).toNumber(),
          creator: creatorWithBalance,
        },
      });
    });
  }
}
