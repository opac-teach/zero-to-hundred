import { Test, TestingModule } from '@nestjs/testing';
import { MemecoinController } from './memecoin.controller';
import { MemecoinService } from './memecoin.service';
import {
  MemecoinResponseDto,
  MemecoinPriceDto,
  CreateMemecoinDto,
} from './dto';

describe('MemecoinController', () => {
  let controller: MemecoinController;
  let memecoinService: MemecoinService;

  const mockMemecoinResponse = {
    id: 'memecoin-id-1',
    name: 'Test Coin',
    symbol: 'TEST',
    description: 'A test memecoin',
    creatorId: 'user-id-1',
    initialSupply: 1000000,
    currentSupply: 1000000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMemecoinPriceDto = {
    id: 'memecoin-id-1',
    symbol: 'TEST',
    price: 0.1,
    priceChange24h: 0.01,
    volume24h: 1000,
    marketSentiment: 'POSITIVE',
  };

  const mockTransactions = [
    {
      id: 'transaction-id-1',
      type: 'BUY',
      amount: 100,
      price: 0.1,
      totalValue: 10,
      memecoinId: 'memecoin-id-1',
      walletId: 'wallet-id-1',
      userId: 'user-id-1',
      createdAt: new Date(),
    },
  ];

  const mockMemecoinService = {
    findAll: jest.fn().mockResolvedValue([mockMemecoinResponse]),
    findOne: jest.fn().mockResolvedValue(mockMemecoinResponse),
    findBySymbol: jest.fn().mockResolvedValue(mockMemecoinResponse),
    create: jest.fn().mockResolvedValue(mockMemecoinResponse),
    getPrice: jest.fn().mockResolvedValue(mockMemecoinPriceDto),
    getTransactions: jest.fn().mockResolvedValue(mockTransactions),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemecoinController],
      providers: [
        {
          provide: MemecoinService,
          useValue: mockMemecoinService,
        },
      ],
    }).compile();

    controller = module.get<MemecoinController>(MemecoinController);
    memecoinService = module.get<MemecoinService>(MemecoinService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of memecoins with default pagination', async () => {
      const result = await controller.findAll(1, 20);

      expect(result).toEqual([mockMemecoinResponse]);
      expect(memecoinService.findAll).toHaveBeenCalledWith(
        1,
        20,
        'createdAt',
        'DESC',
      );
    });

    it('should return an array of memecoins with custom pagination and sorting', async () => {
      const result = await controller.findAll(2, 10, 'name', 'ASC');

      expect(result).toEqual([mockMemecoinResponse]);
      expect(memecoinService.findAll).toHaveBeenCalledWith(
        2,
        10,
        'name',
        'ASC',
      );
    });
  });

  describe('findBySymbol', () => {
    it('should return a memecoin by symbol', async () => {
      const result = await controller.findBySymbol('TEST');

      expect(result).toEqual(mockMemecoinResponse);
      expect(memecoinService.findBySymbol).toHaveBeenCalledWith('TEST');
    });
  });

  describe('create', () => {
    it('should create a new memecoin', async () => {
      const req = { user: { id: 'user-id-1' } };
      const createMemecoinDto: CreateMemecoinDto = {
        name: 'New Coin',
        symbol: 'NEW',
        description: 'A new memecoin',
        logoUrl: 'https://example.com/logo.png',
      };

      const result = await controller.create(req, createMemecoinDto);

      expect(result).toEqual(mockMemecoinResponse);
      expect(memecoinService.create).toHaveBeenCalledWith(
        'user-id-1',
        createMemecoinDto,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return memecoin transactions', async () => {
      const result = await controller.getTransactions('memecoin-id-1');

      expect(result).toEqual(mockTransactions);
      expect(memecoinService.getTransactions).toHaveBeenCalledWith(
        'memecoin-id-1',
      );
    });
  });
});
