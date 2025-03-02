import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { CreateMemecoinDto, MemecoinResponseDto, MemecoinPriceDto } from './dto';
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
    order: 'ASC' | 'DESC' = 'DESC'
  ): Promise<MemecoinResponseDto[]> {
    // Validate sortBy field to prevent SQL injection
    const allowedSortFields = ['createdAt', 'name', 'symbol', 'totalSupply'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    const memecoins = await this.memecoinRepository.find({
      relations: ['creator'],
      order: {
        [sortField]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return memecoins.map(memecoin => new MemecoinResponseDto(memecoin));
  }

  async findOne(id: string): Promise<MemecoinResponseDto> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    
    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }
    
    return new MemecoinResponseDto(memecoin);
  }

  async findBySymbol(symbol: string): Promise<MemecoinResponseDto> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { symbol },
      relations: ['creator'],
    });
    
    if (!memecoin) {
      throw new NotFoundException(`Memecoin with symbol ${symbol} not found`);
    }
    
    return new MemecoinResponseDto(memecoin);
  }

  async create(userId: string, createMemecoinDto: CreateMemecoinDto): Promise<MemecoinResponseDto> {
    const { name, symbol, description, logoUrl } = createMemecoinDto;
    
    // Check if memecoin with the same name or symbol already exists
    const existingMemecoin = await this.memecoinRepository.findOne({
      where: [{ name }, { symbol }],
    });
    
    if (existingMemecoin) {
      throw new ConflictException('Memecoin with this name or symbol already exists');
    }
    
    // Get the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Get the user's wallet
    const wallet = await this.walletRepository.findOne({ where: { ownerId: userId } });
    
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    
    // Check if the user has enough ZTH to create a memecoin (1 ZTH)
    if (wallet.balance < 1) {
      throw new BadRequestException('Insufficient balance to create a memecoin');
    }
    
    // Use a transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Deduct 1 ZTH from the user's wallet
      wallet.balance -= 1;
      await queryRunner.manager.save(wallet);
      
      // Create the memecoin
      const memecoin = this.memecoinRepository.create({
        name,
        symbol,
        description,
        logoUrl,
        creator: user,
        creatorId: userId,
        totalSupply: 0,
        currentPrice: 0,
        marketCap: 0,
        volume24h: 0,
      });
      
      const savedMemecoin = await queryRunner.manager.save(memecoin);
      
      // Create a transaction record
      const transaction = this.transactionRepository.create({
        type: TransactionType.CREATE,
        amount: 0,
        price: 0,
        totalValue: 1, // Cost to create a memecoin
        user,
        userId,
        memecoin: savedMemecoin,
        memecoinId: savedMemecoin.id,
      });
      
      await queryRunner.manager.save(transaction);
      
      await queryRunner.commitTransaction();
      
      return new MemecoinResponseDto(savedMemecoin);
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
    const price = this.calculatePrice(memecoin.totalSupply);
    
    // Get market sentiment
    const marketSentiment = await this.statisticsService.getMarketSentiment(id);

    return {
      price,
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
