import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { TradingVolumeDto } from './dto';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let transactionRepository: Repository<Transaction>;
  let memecoinRepository: Repository<Memecoin>;

  const mockTransactions = [
    {
      id: '1',
      type: TransactionType.BUY,
      amount: 100,
      price: 10,
      totalValue: 1000,
      memecoinId: '1',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: '1', username: 'user1' },
      memecoin: { id: '1', symbol: 'TEST1', name: 'Test Coin 1' },
    } as unknown as Transaction,
    {
      id: '2',
      type: TransactionType.SELL,
      amount: 50,
      price: 12,
      totalValue: 600,
      memecoinId: '1',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: '1', username: 'user1' },
      memecoin: { id: '1', symbol: 'TEST1', name: 'Test Coin 1' },
    } as unknown as Transaction,
  ];

  const mockMemecoin = {
    id: '1',
    symbol: 'TEST1',
    name: 'Test Coin 1',
    currentPrice: 10,
  };

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getMany: jest.fn().mockResolvedValue(mockTransactions),
  };

  const mockTransactionRepository = {
    find: jest.fn().mockResolvedValue(mockTransactions),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockMemecoinRepository = {
    findOne: jest.fn().mockResolvedValue(mockMemecoin),
    find: jest.fn().mockResolvedValue([mockMemecoin]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Memecoin),
          useValue: mockMemecoinRepository,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    memecoinRepository = module.get<Repository<Memecoin>>(getRepositoryToken(Memecoin));

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTradingVolume', () => {
    it('should return trading volume for 24h timeframe', async () => {
      const result = await service.getTradingVolume('24h');
      
      expect(result).toBeDefined();
      expect(result.totalVolume).toBeGreaterThan(0);
      expect(result.timeframe).toBe('24h');
      expect(result.buyVolume).toBe(1000);
      expect(result.sellVolume).toBe(600);
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should return trading volume for 7d timeframe', async () => {
      const result = await service.getTradingVolume('7d');
      
      expect(result).toBeDefined();
      expect(result.timeframe).toBe('7d');
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return trading volume for 30d timeframe', async () => {
      const result = await service.getTradingVolume('30d');
      
      expect(result).toBeDefined();
      expect(result.timeframe).toBe('30d');
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return trading volume for a specific memecoin', async () => {
      const result = await service.getTradingVolume('24h', '1');
      
      expect(result).toBeDefined();
      expect(result.totalVolume).toBeGreaterThan(0);
      expect(transactionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.memecoinId = :memecoinId',
        { memecoinId: '1' }
      );
    });

    it('should include memecoin details in the response', async () => {
      const result = await service.getTradingVolume('24h');
      
      expect(result.memecoins).toBeDefined();
      expect(result.memecoins.length).toBeGreaterThan(0);
      expect(result.memecoins[0].id).toBe('1');
      expect(result.memecoins[0].ticker).toBe('TEST1');
      expect(result.memecoins[0].volume).toBeGreaterThan(0);
    });
  });

  describe('getMarketSentiment', () => {
    it('should return POSITIVE sentiment when buys exceed sells by more than 20%', async () => {
      // Mock transactions with more buys than sells
      const positiveSentimentTransactions = [
        { id: '1', type: TransactionType.BUY, memecoinId: '1' },
        { id: '2', type: TransactionType.BUY, memecoinId: '1' },
        { id: '3', type: TransactionType.BUY, memecoinId: '1' },
        { id: '4', type: TransactionType.SELL, memecoinId: '1' },
        { id: '5', type: TransactionType.SELL, memecoinId: '1' },
      ] as unknown as Transaction[];

      jest.spyOn(transactionRepository, 'find').mockResolvedValueOnce(positiveSentimentTransactions);

      const result = await service.getMarketSentiment('1');
      
      expect(result).toBe('POSITIVE');
      expect(transactionRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          memecoinId: '1'
        })
      }));
    });

    it('should return NEGATIVE sentiment when sells exceed buys by more than 20%', async () => {
      // Mock transactions with more sells than buys
      const negativeSentimentTransactions = [
        { id: '1', type: TransactionType.SELL, memecoinId: '1' },
        { id: '2', type: TransactionType.SELL, memecoinId: '1' },
        { id: '3', type: TransactionType.SELL, memecoinId: '1' },
        { id: '4', type: TransactionType.BUY, memecoinId: '1' },
        { id: '5', type: TransactionType.BUY, memecoinId: '1' },
      ] as unknown as Transaction[];

      jest.spyOn(transactionRepository, 'find').mockResolvedValueOnce(negativeSentimentTransactions);

      const result = await service.getMarketSentiment('1');
      
      expect(result).toBe('NEGATIVE');
    });

    it('should return NEUTRAL sentiment when buys and sells are roughly equal', async () => {
      // Mock transactions with equal buys and sells
      const neutralSentimentTransactions = [
        { id: '1', type: TransactionType.BUY, memecoinId: '1' },
        { id: '2', type: TransactionType.BUY, memecoinId: '1' },
        { id: '3', type: TransactionType.SELL, memecoinId: '1' },
        { id: '4', type: TransactionType.SELL, memecoinId: '1' },
      ] as unknown as Transaction[];

      jest.spyOn(transactionRepository, 'find').mockResolvedValueOnce(neutralSentimentTransactions);

      const result = await service.getMarketSentiment('1');
      
      expect(result).toBe('NEUTRAL');
    });

    it('should handle empty transaction list', async () => {
      jest.spyOn(transactionRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getMarketSentiment('1');
      
      expect(result).toBe('NEUTRAL');
    });
  });
}); 