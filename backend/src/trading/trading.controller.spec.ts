import { Test, TestingModule } from '@nestjs/testing';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { BuyMemecoinDto } from './dto/buy-memecoin.dto';
import { SellMemecoinDto } from './dto/sell-memecoin.dto';
import { TradeResponseDto } from './dto/trade-response.dto';
import { TransactionType } from '../entities/transaction.entity';
import { Transaction } from '../entities/transaction.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';

describe('TradingController', () => {
  let controller: TradingController;
  let tradingService: TradingService;

  const mockWallet = {
    id: 'wallet-id-1',
    ownerId: 'user-id-1',
    zthBalance: '1000',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: null,
    address: '0x123456789',
  } as unknown as Wallet;

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'user',
    profilePictureUrl: 'https://example.com/pic.jpg',
    bannerUrl: 'https://example.com/banner.jpg',
    description: 'Test user description',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    wallet: mockWallet,
  } as User;

  mockWallet.owner = mockUser;

  const mockMemecoin = {
    id: 'memecoin-id-1',
    name: 'Dogecoin',
    symbol: 'DOGE',
    description: 'A fun cryptocurrency',
    logoUrl: 'https://example.com/doge.png',
    creatorId: 'creator-id-1',
    totalSupply: '1000000',
    currentPrice: '0.5',
    marketCap: '1000000',
    volume24h: '500000',
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: null,
    transactions: [],
    holdings: [],
  } as Memecoin;

  const mockTransaction = {
    id: 'transaction-id-1',
    type: TransactionType.BUY,
    amount: '100',
    price: '0.1',
    totalValue: '10',
    userId: 'user-id-1',
    memecoinId: 'memecoin-id-1',
    user: mockUser,
    memecoin: mockMemecoin,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction;

  const mockTradeResponse = new TradeResponseDto({
    transactionId: 'transaction-id-1',
    type: TransactionType.BUY,
    memecoinId: 'memecoin-id-1',
    memecoinSymbol: 'DOGE',
    newHoldingAmount: 100,
    memecoin: {
      id: 'memecoin-id-1',
      name: 'Dogecoin',
      symbol: 'DOGE',
      description: 'A fun cryptocurrency',
      logoUrl: 'https://example.com/doge.png',
      creatorId: 'creator-id-1',
      totalSupply: 1000000,
      currentPrice: 0.5,
      marketCap: 1000000,
      volume24h: 500000,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: null,
    },
  });

  const mockTradingService = {
    buyMemecoin: jest.fn().mockResolvedValue(mockTradeResponse),
    sellMemecoin: jest.fn().mockResolvedValue(new TradeResponseDto({
      ...mockTradeResponse,
      type: TransactionType.SELL,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradingController],
      providers: [
        {
          provide: TradingService,
          useValue: mockTradingService,
        },
      ],
    }).compile();

    controller = module.get<TradingController>(TradingController);
    tradingService = module.get<TradingService>(TradingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('buyMemecoin', () => {
    it('should call tradingService.buyMemecoin with correct parameters', async () => {
      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '100';
      buyDto.requestPrice = '0.5';

      const req = { user: mockUser, wallet: mockWallet };

      await controller.buyMemecoin(req, buyDto);

      expect(tradingService.buyMemecoin).toHaveBeenCalledWith(
        mockUser.id,
        buyDto,
      );
    });

    it('should buy memecoin successfully', async () => {
      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '100';
      buyDto.requestPrice = '0.5';

      const req = { user: mockUser, wallet: mockWallet };

      const result = await controller.buyMemecoin(req, buyDto);

      expect(result).toEqual(mockTradeResponse);
    });
  });

  describe('sellMemecoin', () => {
    it('should call tradingService.sellMemecoin with correct parameters', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '50';
      sellDto.requestPrice = '0.5';

      const req = { user: mockUser, wallet: mockWallet };

      await controller.sellMemecoin(req, sellDto);

      expect(tradingService.sellMemecoin).toHaveBeenCalledWith(
        mockUser.id,
        sellDto,
      );
    });

    it('should sell memecoin successfully', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '50';
      sellDto.requestPrice = '0.5';

      const req = { user: mockUser, wallet: mockWallet };

      const result = await controller.sellMemecoin(req, sellDto);

      expect(result).toEqual(new TradeResponseDto({
        ...mockTradeResponse,
        type: TransactionType.SELL,
      }));
    });
  });
});
