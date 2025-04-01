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
import { CreateMemecoinDto, MemecoinResponseDto } from './dto';
import Decimal from 'decimal.js';
import { calculatePrice, defaultCurveConfig } from '../trading/bonding-curve';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    private readonly eventEmitter: EventEmitter2,
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

    return memecoins.map((memecoin) => new MemecoinResponseDto(memecoin));
  }

  async findById(id: string): Promise<MemecoinResponseDto> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { id },
      relations: ['creator', 'creator.wallet'],
    });

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with ID ${id} not found`);
    }

    return new MemecoinResponseDto(memecoin);
  }

  async findBySymbol(symbol: string): Promise<MemecoinResponseDto> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { symbol },
      relations: ['creator', 'creator.wallet'],
    });

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with symbol ${symbol} not found`);
    }

    return new MemecoinResponseDto(memecoin);
  }

  async create(
    userId: string,
    createMemecoinDto: CreateMemecoinDto,
  ): Promise<MemecoinResponseDto> {
    const {
      name,
      symbol,
      description,
      logoUrl,
      curveConfig = defaultCurveConfig,
    } = createMemecoinDto;

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

    // Use a transaction to ensure data consistency
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

      // Check if the user has enough ZTH to create a memecoin (1 ZTH)
      if (Decimal(wallet.zthBalance).lt(1)) {
        throw new BadRequestException(
          'Insufficient ZTH balance to create a memecoin',
        );
      }
      // Deduct 1 ZTH from the user's wallet
      wallet.zthBalance = String(Decimal(wallet.zthBalance).minus(1));
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
      memecoin.currentPrice = calculatePrice(0);
      memecoin.volume24h = '0';
      memecoin.curveConfig = curveConfig;
      const savedMemecoin = await queryRunner.manager.save(memecoin);

      // Create a transaction record
      const transaction = new Transaction();
      transaction.type = TransactionType.CREATE;
      transaction.memecoinAmount = '0';
      transaction.zthAmount = '1'; // Cost to create a memecoin
      transaction.price = '0';
      transaction.user = user;
      transaction.userId = userId;
      transaction.memecoin = savedMemecoin;
      transaction.memecoinId = savedMemecoin.id;

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('memecoin.created', savedMemecoin);

      return new MemecoinResponseDto(savedMemecoin);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(symbol: string): Promise<Transaction[]> {
    const memecoin = await this.memecoinRepository.findOne({
      where: { symbol },
    });

    if (!memecoin) {
      throw new NotFoundException(`Memecoin with symbol ${symbol} not found`);
    }

    return this.transactionRepository.find({
      where: { memecoinId: memecoin.id },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
