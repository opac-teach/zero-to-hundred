import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import {
  CreateMemecoinDto,
  MemecoinResponseDto,
  MemecoinPriceDto,
} from './dto';
import { StatisticsService } from '../statistics/statistics.service';

@Injectable()
export class MemecoinService {
  constructor(
    @InjectRepository(Memecoin)
    private readonly memecoinRepository: Repository<Memecoin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
    private readonly statisticsService: StatisticsService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
  ): Promise<MemecoinResponseDto[]> {
    // Validate sortBy field to prevent SQL injection
    const allowedSortFields = ['createdAt', 'name', 'symbol', 'totalSupply'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const memecoins = await this.memecoinRepository.find({
      relations: ['creator', 'creator.wallet'],
      order: {
        [sortField]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return memecoins.map((memecoin) => {
      const creatorWithBalance = {
        ...memecoin.creator,
        zthBalance: Number(memecoin.creator.wallet?.zthBalance || 0),
      };
      const currentPrice = this.calculatePrice(Number(memecoin.totalSupply));
      return new MemecoinResponseDto({
        ...memecoin,
        totalSupply: Number(memecoin.totalSupply),
        currentPrice: Number(memecoin.currentPrice),
        marketCap: Number(memecoin.marketCap),
        volume24h: Number(memecoin.volume24h),
        creator: creatorWithBalance,
      });
    });
  }

  async findOne(id: string): Promise<MemecoinResponseDto> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { id },
      relations: ['creator', 'creator.wallet'],
    });

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }

    const creatorWithBalance = {
      ...memecoin.creator,
      zthBalance: Number(memecoin.creator.wallet?.zthBalance || 0),
    };
    const currentPrice = this.calculatePrice(Number(memecoin.totalSupply));
    return new MemecoinResponseDto({
      ...memecoin,
      totalSupply: Number(memecoin.totalSupply),
      currentPrice: Number(memecoin.currentPrice),
      marketCap: Number(memecoin.marketCap),
      volume24h: Number(memecoin.volume24h),
      creator: creatorWithBalance,
    });
  }

  async findBySymbol(symbol: string): Promise<MemecoinResponseDto> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { symbol },
      relations: ['creator', 'creator.wallet'],
    });

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with symbol ${symbol} not found`);
    }

    const creatorWithBalance = {
      ...memecoin.creator,
      zthBalance: Number(memecoin.creator.wallet?.zthBalance || 0),
    };
    const currentPrice = this.calculatePrice(Number(memecoin.totalSupply));
    return new MemecoinResponseDto({
      ...memecoin,
      totalSupply: Number(memecoin.totalSupply),
      currentPrice: Number(memecoin.currentPrice),
      marketCap: Number(memecoin.marketCap),
      volume24h: Number(memecoin.volume24h),
      creator: creatorWithBalance,
    });
  }

  async create(
    userId: string,
    createMemecoinDto: CreateMemecoinDto,
  ): Promise<MemecoinResponseDto> {
    const { name, symbol, description, logoUrl } = createMemecoinDto;

    // Check if memecoin with the same name or symbol already exists
    const existingMemecoin = await this.memecoinRepository.findOne({
      where: [{ name }, { symbol }],
    });

    if (existingMemecoin) {
      throw new ConflictException(
        'Memecoin with this name or symbol already exists',
      );
    }

    // Get the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['wallet'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get the user's wallet
    const wallet = await this.walletRepository.findOne({
      where: { ownerId: userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Check if the user has enough ZTH to create a memecoin (1 ZTH)
    if (Number(wallet.zthBalance) < 1) {
      throw new BadRequestException(
        'Insufficient ZTH balance to create a memecoin',
      );
    }

    // Use a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Deduct 1 ZTH from the user's wallet
      wallet.zthBalance = String(Number(wallet.zthBalance) - 1);
      await queryRunner.manager.save(wallet);

      // Create the memecoin
      const memecoin = new Memecoin();
      memecoin.name = name;
      memecoin.symbol = symbol;
      memecoin.description = description;
      memecoin.logoUrl = logoUrl;
      memecoin.creator = user;
      memecoin.creatorId = userId;
      memecoin.totalSupply = '0';
      memecoin.currentPrice = '0';
      memecoin.marketCap = '0';
      memecoin.volume24h = '0';

      const savedMemecoin = await queryRunner.manager.save(memecoin);

      // Create a transaction record
      const transaction = new Transaction();
      transaction.type = TransactionType.CREATE;
      transaction.amount = '0';
      transaction.price = '0';
      transaction.totalValue = '1'; // Cost to create a memecoin
      transaction.user = user;
      transaction.userId = userId;
      transaction.memecoin = savedMemecoin;
      transaction.memecoinId = savedMemecoin.id;

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      const creatorWithBalance = {
        ...savedMemecoin.creator,
        zthBalance: Number(savedMemecoin.creator.wallet?.zthBalance || 0),
      };
      const currentPrice = this.calculatePrice(
        Number(savedMemecoin.totalSupply),
      );
      return new MemecoinResponseDto({
        ...savedMemecoin,
        totalSupply: Number(savedMemecoin.totalSupply),
        currentPrice: Number(savedMemecoin.currentPrice),
        marketCap: Number(savedMemecoin.marketCap),
        volume24h: Number(savedMemecoin.volume24h),
        creator: creatorWithBalance,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPrice(id: string): Promise<MemecoinPriceDto> {
    const memecoin = await this.memecoinRepository.findOne({ where: { id } });
    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }

    // Calculate current price using bonding curve
    const price = this.calculatePrice(Number(memecoin.totalSupply));

    // Get market sentiment
    const marketSentiment = await this.statisticsService.getMarketSentiment(id);

    return {
      price: String(price),
      supply: memecoin.totalSupply,
      marketSentiment,
    };
  }

  async getTransactions(id: string): Promise<Transaction[]> {
    const memecoin = await this.memecoinRepository.findOne({ where: { id } });

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }

    return this.transactionRepository.find({
      where: { memecoinId: id },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Helper method to calculate price based on bonding curve
  calculatePrice(supply: number): number {
    // Price = (Supply)²/10000
    return (supply * supply) / 10000;
  }
}
