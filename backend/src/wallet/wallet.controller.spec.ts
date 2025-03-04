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

  const mockUserResponse: UserResponseDto = new UserResponseDto({
    ...mockUser,
    zthBalance: 1000,
    rank: 1,
  });

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

  const mockMemecoinResponse: MemecoinResponseDto = new MemecoinResponseDto({
    ...mockMemecoin,
    creator: mockUserResponse,
  });

  const mockWalletHolding: WalletHolding = {
    id: 'holding-id-1',
    walletId: mockWallet.id,
    memecoinId: mockMemecoin.id,
    amount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    wallet: mockWallet,
    memecoin: mockMemecoin,
  };

  const mockTransaction: Transaction = {
    id: 'transaction-id-1',
    userId: mockUser.id,
    memecoinId: mockMemecoin.id,
    amount: 100,
    price: 0.1,
    totalValue: 10,
    type: TransactionType.BUY,
    createdAt: new Date(),
    user: mockUser,
    memecoin: mockMemecoin,
  };

  const mockWalletResponse: WalletResponseDto = new WalletResponseDto({
    ...mockWallet,
    holdings: [
      {
        ...mockWalletHolding,
        memecoin: {
          ...mockMemecoin,
          creator: mockUserResponse,
        },
      },
    ],
  });

  const mockTransactionResponse: TransactionResponseDto =
    new TransactionResponseDto({
      ...mockTransaction,
      user: mockUserResponse,
      memecoin: mockMemecoinResponse,
    });

  const mockWalletService = {
    getWalletByUserId: jest.fn().mockResolvedValue(mockWalletResponse),
    getTransactionsByUserId: jest
      .fn()
      .mockResolvedValue([mockTransactionResponse]),
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
