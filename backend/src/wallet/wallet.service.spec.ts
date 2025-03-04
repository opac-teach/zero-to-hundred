import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  WalletResponseDto,
  WalletHoldingResponseDto,
  TransactionResponseDto,
} from './dto';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: Repository<Wallet>;
  let walletHoldingRepository: Repository<WalletHolding>;
  let transactionRepository: Repository<Transaction>;

  const mockWallet = {
    id: 'wallet-id-1',
    address: 'wallet-address',
    balance: 100,
    ownerId: 'user-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatorWallet = {
    id: 'wallet-id-2',
    address: 'creator-wallet-address',
    balance: 200,
    ownerId: 'creator-id-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreator = {
    id: 'creator-id-1',
    username: 'creator',
    wallet: mockCreatorWallet,
  };

  const mockUser = {
    id: 'user-id-1',
    username: 'user',
    wallet: mockWallet,
  };

  const mockWalletHolding = {
    id: 'holding-id-1',
    walletId: 'wallet-id-1',
    memecoinId: 'memecoin-id-1',
    amount: 10,
    memecoin: {
      id: 'memecoin-id-1',
      symbol: 'TEST',
      name: 'Test Coin',
      creator: mockCreator,
    },
  };

  const mockTransaction = {
    id: 'transaction-id-1',
    type: TransactionType.BUY,
    amount: 10,
    price: 1,
    totalValue: 10,
    memecoinId: 'memecoin-id-1',
    walletId: 'wallet-id-1',
    userId: 'user-id-1',
    createdAt: new Date(),
    memecoin: {
      id: 'memecoin-id-1',
      symbol: 'TEST',
      name: 'Test Coin',
      creator: mockCreator,
    },
    user: mockUser,
  };

  const mockWalletRepository = {
    findOne: jest.fn().mockResolvedValue(mockWallet),
  };

  const mockWalletHoldingRepository = {
    find: jest.fn().mockResolvedValue([mockWalletHolding]),
    findOne: jest.fn().mockResolvedValue(mockWalletHolding),
  };

  const mockTransactionRepository = {
    find: jest.fn().mockResolvedValue([mockTransaction]),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockTransaction]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(WalletHolding),
          useValue: mockWalletHoldingRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    walletHoldingRepository = module.get<Repository<WalletHolding>>(
      getRepositoryToken(WalletHolding),
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletByUserId', () => {
    it('should return a wallet by user id', async () => {
      const result = await service.getWalletByUserId('user-id-1');

      expect(result).toBeDefined();
      expect(result.ownerId).toBe('user-id-1');
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { ownerId: 'user-id-1' },
      });
    });

    it('should throw NotFoundException when wallet is not found', async () => {
      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.getWalletByUserId('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactionsByUserId', () => {
    it('should return user transactions with default pagination', async () => {
      const result = await service.getTransactionsByUserId('user-id-1');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        relations: [
          'memecoin',
          'memecoin.creator',
          'memecoin.creator.wallet',
          'user',
          'user.wallet',
        ],
        order: {
          createdAt: 'DESC',
        },
        skip: 0,
        take: 20,
      });
    });

    it('should return user transactions with custom pagination', async () => {
      const result = await service.getTransactionsByUserId('user-id-1', 2, 10);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-id-1' },
        relations: [
          'memecoin',
          'memecoin.creator',
          'memecoin.creator.wallet',
          'user',
          'user.wallet',
        ],
        order: {
          createdAt: 'DESC',
        },
        skip: 10,
        take: 10,
      });
    });

    it('should return empty array when no transactions are found', async () => {
      jest.spyOn(transactionRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getTransactionsByUserId('user-id-1');

      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });
});
