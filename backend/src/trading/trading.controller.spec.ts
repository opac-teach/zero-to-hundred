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
    zthBalance: 1000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Wallet;

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

  const mockWalletHolding = {
    id: 'holding-id-1',
    walletId: mockWallet.id,
    memecoinId: 'memecoin-id-1',
    amount: 100,
  };

  const mockTransaction: Transaction = {
    id: 'transaction-id-1',
    userId: mockUser.id,
    memecoinId: 'memecoin-id-1',
    amount: 100,
    price: 0.1,
    totalValue: 10,
    type: TransactionType.BUY,
    createdAt: new Date(),
    user: mockUser,
    memecoin: null, // Will be set in mockMemecoin
  };

  const mockMemecoin: Memecoin = {
    id: 'memecoin-id-1',
    name: 'Test Coin',
    symbol: 'TEST',
    description: 'A test memecoin',
    logoUrl: 'https://example.com/logo.png',
    totalSupply: 1000000,
    currentPrice: 0.1,
    marketCap: 100000,
    volume24h: 10000,
    creatorId: mockUser.id,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: mockUser,
  };

  // Set the memecoin relation in the transaction
  mockTransaction.memecoin = mockMemecoin;

  const mockTradeResponse: TradeResponseDto = {
    transactionId: mockTransaction.id,
    type: mockTransaction.type,
    memecoinId: mockMemecoin.id,
    memecoinSymbol: mockMemecoin.symbol,
    newHoldingAmount: 90,
  };

  const mockTradingService = {
    buyMemecoin: jest.fn().mockResolvedValue(mockTradeResponse),
    sellMemecoin: jest.fn().mockResolvedValue({
      ...mockTradeResponse,
      type: TransactionType.SELL,
    }),
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
      buyDto.amount = 10;

      const req = { user: mockUser, wallet: mockWallet };

      await controller.buyMemecoin(req, buyDto);

      expect(tradingService.buyMemecoin).toHaveBeenCalledWith(
        mockUser.id,
        buyDto,
      );
    });

    it('should return the trade response from the service', async () => {
      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;

      const req = { user: mockUser, wallet: mockWallet };

      const result = await controller.buyMemecoin(req, buyDto);

      expect(result).toEqual(mockTradeResponse);
    });
  });

  describe('sellMemecoin', () => {
    it('should call tradingService.sellMemecoin with correct parameters', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;

      const req = { user: mockUser, wallet: mockWallet };

      await controller.sellMemecoin(req, sellDto);

      expect(tradingService.sellMemecoin).toHaveBeenCalledWith(
        mockUser.id,
        sellDto,
      );
    });

    it('should return the trade response from the service', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;

      const req = { user: mockUser, wallet: mockWallet };

      const result = await controller.sellMemecoin(req, sellDto);

      expect(result).toEqual({
        ...mockTradeResponse,
        type: TransactionType.SELL,
      });
    });
  });
});
