import { Test, TestingModule } from '@nestjs/testing';
import { TradingController } from './trading.controller';
import { TradingService } from './trading.service';
import { TradeMemecoinDto } from './dto/trade-memecoin.dto';
import { TradeResponseDto } from './dto/trade-response.dto';
import { TransactionType } from '../entities/transaction.entity';
import { Transaction } from '../entities/transaction.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';

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
  } as unknown as Wallet;

  const mockUser = {
    id: 'user-id-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    userTitle: 'Test User',
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
  } as unknown as Transaction;

  const mockWalletHolding = {
    id: 'wallet-holding-id-1',
    walletId: 'wallet-id-1',
    memecoinId: 'memecoin-id-1',
    amount: '100',
    createdAt: new Date(),
    updatedAt: new Date(),
    wallet: mockWallet,
    memecoin: mockMemecoin,
  } as WalletHolding;

  const mockTradeResponse = new TradeResponseDto({
    transaction: mockTransaction,
    memecoin: mockMemecoin,
    walletHolding: mockWalletHolding,
  });

  const mockTradingService = {
    tradeMemecoin: jest.fn().mockResolvedValue(mockTradeResponse),
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
    it('should call tradingService.tradeMemeCoin with correct parameters', async () => {
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '100';
      tradeDto.requestCost = '0.5';
      tradeDto.tradeType = 'buy';

      const req = { user: mockUser, wallet: mockWallet };

      await controller.tradeMemecoin(req, tradeDto);

      expect(tradingService.tradeMemecoin).toHaveBeenCalledWith(
        mockUser.id,
        tradeDto,
      );
    });

    it('should buy memecoin successfully', async () => {
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '100';
      tradeDto.requestCost = '0.5';
      tradeDto.tradeType = 'buy';

      const req = { user: mockUser, wallet: mockWallet };

      const result = await controller.tradeMemecoin(req, tradeDto);

      expect(result).toEqual(mockTradeResponse);
    });
  });

  describe('sellMemecoin', () => {
    it('should call tradingService.sellMemecoin with correct parameters', async () => {
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '50';
      tradeDto.requestCost = '0.5';
      tradeDto.tradeType = 'sell';
      const req = { user: mockUser, wallet: mockWallet };

      await controller.tradeMemecoin(req, tradeDto);

      expect(tradingService.tradeMemecoin).toHaveBeenCalledWith(
        mockUser.id,
        tradeDto,
      );
    });

    it('should sell memecoin successfully', async () => {
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '50';
      tradeDto.requestCost = '0.5';

      const req = { user: mockUser, wallet: mockWallet };

      const result = await controller.tradeMemecoin(req, tradeDto);

      expect(result).toEqual(
        new TradeResponseDto({
          ...mockTradeResponse,
          transaction: {
            ...mockTransaction,
            type: TransactionType.SELL,
          },
        }),
      );
    });
  });
});
