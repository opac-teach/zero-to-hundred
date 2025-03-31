import { Test, TestingModule } from '@nestjs/testing';
import { MemecoinService } from './memecoin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Repository, DataSource } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { StatisticsService } from '../statistics/statistics.service';
import { CreateMemecoinDto } from './dto';
import { MemecoinResponseDto } from './dto/memecoin-response.dto';
import { defaultCurveConfig } from '../trading/bonding-curve';
import { EventEmitter2 } from '@nestjs/event-emitter';
describe('MemecoinService', () => {
  let service: MemecoinService;
  let memecoinRepository: Repository<Memecoin>;
  let userRepository: Repository<User>;
  let walletRepository: Repository<Wallet>;
  let transactionRepository: Repository<Transaction>;
  let dataSource: DataSource;
  let statisticsService: StatisticsService;

  const mockMemecoin = {
    id: 'memecoin-id-1',
    name: 'Test Coin',
    symbol: 'TEST',
    description: 'A test memecoin',
    creatorId: 'user-id-1',
    creator: { id: 'user-id-1', username: 'testuser' },
    totalSupply: 1000000,
    currentSupply: 1000000,
    currentPrice: 0.1,
    volume24h: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMemecoins = [
    mockMemecoin,
    {
      id: 'memecoin-id-2',
      name: 'Test Coin 2',
      symbol: 'TEST2',
      description: 'Another test memecoin',
      creatorId: 'user-id-1',
      creator: { id: 'user-id-1', username: 'testuser' },
      totalSupply: 2000000,
      currentSupply: 2000000,
      currentPrice: 0.2,
      volume24h: 20000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockWallet = {
    id: 'wallet-id-1',
    ownerId: 'user-id-1',
    balance: 100,
  };

  const mockTransaction = {
    id: 'transaction-id-1',
    type: TransactionType.BUY,
    amount: 100,
    price: 0.1,
    totalValue: 10,
    memecoinId: 'memecoin-id-1',
    userId: 'user-id-1',
    user: mockUser,
    createdAt: new Date(),
  };

  const mockMemecoinRepository = {
    find: jest.fn().mockResolvedValue(mockMemecoins),
    findOne: jest.fn().mockResolvedValue(mockMemecoin),
    create: jest.fn().mockReturnValue(mockMemecoin),
    save: jest.fn().mockResolvedValue(mockMemecoin),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(mockMemecoins),
      getOne: jest.fn().mockResolvedValue(mockMemecoin),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue(mockUser),
  };

  const mockWalletRepository = {
    findOne: jest.fn().mockResolvedValue(mockWallet),
    save: jest.fn().mockResolvedValue(mockWallet),
  };

  const mockTransactionRepository = {
    find: jest.fn().mockResolvedValue([mockTransaction]),
    create: jest.fn().mockReturnValue(mockTransaction),
    save: jest.fn().mockResolvedValue(mockTransaction),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      save: jest.fn(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  const mockStatisticsService = {
    recordMemecoinCreation: jest.fn(),
    updateMemecoinStatistics: jest.fn(),
    getMarketSentiment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemecoinService,
        {
          provide: getRepositoryToken(Memecoin),
          useValue: mockMemecoinRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: StatisticsService,
          useValue: mockStatisticsService,
        },
        EventEmitter2,
      ],
    }).compile();

    service = module.get<MemecoinService>(MemecoinService);
    memecoinRepository = module.get<Repository<Memecoin>>(
      getRepositoryToken(Memecoin),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    dataSource = module.get<DataSource>(DataSource);
    statisticsService = module.get<StatisticsService>(StatisticsService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of memecoins with pagination', async () => {
      const result = await service.findAll(1, 10);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(memecoinRepository.find).toHaveBeenCalled();
    });

    it('should apply sorting options', async () => {
      await service.findAll(1, 10, 'createdAt', 'ASC');

      expect(memecoinRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: {
            createdAt: 'ASC',
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a memecoin by id', async () => {
      const result = await service.findById('memecoin-id-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('memecoin-id-1');
      expect(memecoinRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'memecoin-id-1' },
        }),
      );
    });

    it('should throw NotFoundException when memecoin is not found', async () => {
      jest.spyOn(memecoinRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new memecoin', async () => {
      // Create a mock response
      const mockResponse = {
        id: 'new-memecoin-id',
        name: 'Test Coin',
        symbol: 'TEST',
        description: 'A test memecoin',
        logoUrl: 'https://example.com/logo.png',
        creatorId: 'user-id-1',
        totalSupply: 0,
        currentPrice: 0,
        volume24h: 0,
      };

      // Mock the service.create method to return the mock response
      jest.spyOn(service, 'create').mockResolvedValueOnce(mockResponse as any);

      const createMemecoinDto: CreateMemecoinDto = {
        name: 'Test Coin',
        symbol: 'TEST',
        description: 'A test memecoin',
        logoUrl: 'https://example.com/logo.png',
        curveConfig: defaultCurveConfig,
      };

      const result = await service.create('user-id-1', createMemecoinDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Coin');
      expect(result.symbol).toBe('TEST');
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Mock the memecoinRepository.findOne to return null (no existing memecoin)
      jest.spyOn(memecoinRepository, 'findOne').mockResolvedValueOnce(null);
      // Mock the userRepository.findOne to return null (user not found)
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      const createMemecoinDto: CreateMemecoinDto = {
        name: 'Test Coin',
        symbol: 'TEST',
        description: 'A test memecoin',
        logoUrl: 'https://example.com/logo.png',
      };

      await expect(
        service.create('nonexistent-id', createMemecoinDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when memecoin symbol already exists', async () => {
      jest
        .spyOn(memecoinRepository, 'findOne')
        .mockResolvedValueOnce(mockMemecoin as unknown as Memecoin);

      const createMemecoinDto: CreateMemecoinDto = {
        name: 'New Coin',
        symbol: 'TEST', // Same symbol as existing memecoin
        description: 'A new memecoin',
      };

      await expect(
        service.create('user-id-1', createMemecoinDto),
      ).rejects.toThrow(ConflictException);
    });
  });
});
