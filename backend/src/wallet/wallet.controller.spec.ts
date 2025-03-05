import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletResponseDto } from './dto/wallet-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { MemecoinResponseDto } from '../memecoin/dto/memecoin-response.dto';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: WalletService;

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

  const mockUserResponse: UserResponseDto = new UserResponseDto({
    ...mockUser,
    zthBalance: 1000,
    rank: 1,
  });

  const mockMemecoin: Memecoin = {
    id: 'memecoin-id-1',
    name: 'Test Coin',
    symbol: 'TEST',
    description: 'Test memecoin',
    logoUrl: 'https://example.com/logo.png',
    creatorId: 'creator-id-1',
    totalSupply: '1000000',
    currentPrice: '0.1',
    marketCap: '100000',
    volume24h: '10000',
    creator: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Memecoin;

  const mockMemecoinResponse: MemecoinResponseDto = new MemecoinResponseDto({
    ...mockMemecoin,
    totalSupply: parseFloat(mockMemecoin.totalSupply),
    currentPrice: parseFloat(mockMemecoin.currentPrice),
    marketCap: parseFloat(mockMemecoin.marketCap),
    volume24h: parseFloat(mockMemecoin.volume24h),
    creator: mockUserResponse,
  });

  const mockWalletHolding: WalletHolding = {
    id: 'holding-id-1',
    walletId: 'wallet-id-1',
    memecoinId: 'memecoin-id-1',
    amount: '100',
    wallet: mockWallet,
    memecoin: mockMemecoin,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as WalletHolding;

  const mockTransaction: Transaction = {
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

  const mockWalletResponse: WalletResponseDto = new WalletResponseDto({
    ...mockWallet,
    holdings: [
      {
        ...mockWalletHolding,
        memecoin: mockMemecoinResponse,
      },
    ],
  });

  const mockTransactionResponse: TransactionResponseDto = new TransactionResponseDto({
    ...mockTransaction,
    user: mockUserResponse,
    memecoin: mockMemecoinResponse,
  });

  const mockWalletService = {
    getWalletByUserId: jest.fn().mockResolvedValue(mockWalletResponse),
    getTransactionsByUserId: jest.fn().mockResolvedValue([mockTransactionResponse]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get<WalletService>(WalletService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getWallet', () => {
    it('should return the user wallet', async () => {
      const req = { user: mockUser };

      const result = await controller.getWallet(req);

      expect(result).toEqual(mockWalletResponse);
      expect(walletService.getWalletByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getTransactions', () => {
    it('should return the user transactions with default pagination', async () => {
      const req = { user: mockUser };

      const result = await controller.getTransactions(req, 1, 20);

      expect(result).toEqual([mockTransactionResponse]);
      expect(walletService.getTransactionsByUserId).toHaveBeenCalledWith(
        mockUser.id,
        1,
        20,
      );
    });

    it('should return the user transactions with custom pagination', async () => {
      const req = { user: mockUser };

      const result = await controller.getTransactions(req, 2, 10);

      expect(result).toEqual([mockTransactionResponse]);
      expect(walletService.getTransactionsByUserId).toHaveBeenCalledWith(
        mockUser.id,
        2,
        10,
      );
    });
  });
});
