import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { TradingVolumeDto, MemecoinVolumeDto } from './dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Memecoin)
    private readonly memecoinRepository: Repository<Memecoin>,
  ) {}

  /**
   * Get trading volume statistics for a specific timeframe
   * @param timeframe The timeframe for the statistics (24h, 7d, 30d)
   * @param memecoinId Optional memecoin ID to filter by
   */
  async getTradingVolume(timeframe: string = '24h', memecoinId?: string): Promise<TradingVolumeDto> {
    // Calculate the start date based on the timeframe
    const startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default: // 24h
        startDate.setDate(startDate.getDate() - 1);
        break;
    }

    // Build the query
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.createdAt >= :startDate', { startDate })
      .andWhere('transaction.type IN (:...types)', { types: [TransactionType.BUY, TransactionType.SELL] });

    // Add memecoin filter if provided
    if (memecoinId) {
      queryBuilder.andWhere('transaction.memecoinId = :memecoinId', { memecoinId });
    }

    // Get all transactions for the period
    const transactions = await queryBuilder.getMany();

    // Calculate total volume
    let totalVolume = 0;
    let buyVolume = 0;
    let sellVolume = 0;

    // Group transactions by memecoin
    const memecoinVolumes = new Map<string, { id: string; ticker: string; volume: number }>();

    for (const transaction of transactions) {
      totalVolume += transaction.totalValue;
      
      if (transaction.type === TransactionType.BUY) {
        buyVolume += transaction.totalValue;
      } else if (transaction.type === TransactionType.SELL) {
        sellVolume += transaction.totalValue;
      }

      // Update memecoin volume
      if (!memecoinVolumes.has(transaction.memecoinId)) {
        const memecoin = await this.memecoinRepository.findOne({ where: { id: transaction.memecoinId } });
        memecoinVolumes.set(transaction.memecoinId, {
          id: transaction.memecoinId,
          ticker: memecoin ? memecoin.symbol : 'UNKNOWN',
          volume: transaction.totalValue,
        });
      } else {
        const memecoinVolume = memecoinVolumes.get(transaction.memecoinId);
        memecoinVolume.volume += transaction.totalValue;
        memecoinVolumes.set(transaction.memecoinId, memecoinVolume);
      }
    }

    // Convert Map to array for response
    const memecoins: MemecoinVolumeDto[] = Array.from(memecoinVolumes.values())
      .sort((a, b) => b.volume - a.volume); // Sort by volume, highest first

    return new TradingVolumeDto({
      totalVolume,
      buyVolume,
      sellVolume,
      timeframe,
      memecoins,
    });
  }

  /**
   * Calculate market sentiment for a memecoin based on recent trading activity
   * @param memecoinId The ID of the memecoin
   * @returns 'POSITIVE', 'NEUTRAL', or 'NEGATIVE'
   */
  async getMarketSentiment(memecoinId: string): Promise<string> {
    // Get transactions from the last 24 hours
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    const transactions = await this.transactionRepository.find({
      where: {
        memecoinId,
        createdAt: Between(startDate, new Date()),
        type: In([TransactionType.BUY, TransactionType.SELL]),
      },
    });

    // Count buys and sells
    let buyCount = 0;
    let sellCount = 0;

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.BUY) {
        buyCount++;
      } else if (transaction.type === TransactionType.SELL) {
        sellCount++;
      }
    }

    // Determine sentiment
    if (buyCount > sellCount * 1.2) { // 20% more buys than sells
      return 'POSITIVE';
    } else if (sellCount > buyCount * 1.2) { // 20% more sells than buys
      return 'NEGATIVE';
    } else {
      return 'NEUTRAL';
    }
  }
} 