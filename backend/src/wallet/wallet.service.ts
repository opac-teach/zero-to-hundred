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
      throw new NotFoundException(`Wallet for user with ID ${userId} not found`);
    }

    // Get wallet holdings
    const holdings = await this.walletHoldingRepository.find({
      where: { walletId: wallet.id },
      relations: ['memecoin'],
    });

    return new WalletResponseDto({
      ...wallet,
      holdings,
    });
  }

  async getTransactionsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { userId },
      relations: ['memecoin'],
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return transactions.map(transaction => new TransactionResponseDto(transaction));
  }
}
