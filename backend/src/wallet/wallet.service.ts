import { Injectable, NotFoundException } from '@nestjs/common';
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
      relations: [
        'holdings',
        'holdings.memecoin',
        'holdings.memecoin.creator',
        'holdings.memecoin.creator.wallet',
      ],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return new WalletResponseDto(wallet);
  }

  async getTransactionsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: [
        'user',
        'memecoin',
        'memecoin.creator',
        'memecoin.creator.wallet',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return transactions.map(
      (transaction) => new TransactionResponseDto(transaction),
    );
  }
}
