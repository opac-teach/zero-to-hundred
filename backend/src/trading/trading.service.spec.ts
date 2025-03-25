import { Test, TestingModule } from '@nestjs/testing';
import { TradingService } from './trading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TradeMemecoinDto } from './dto';
import { calculateSellPrice, defaultCurveConfig } from './bonding-curve';

// Mock data
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
  wallet: {
    id: 'wallet-id-1',
    ownerId: 'user-id-1',
    zthBalance: '1000',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: null,
    holdings: [],
  } as Wallet,
};

const mockWallet = {
  id: 'wallet-id-1',
  ownerId: 'user-id-1',
  zthBalance: '1000',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: null,
  holdings: [],
} as Wallet;

const mockMemecoin = {
  id: 'memecoin-id-1',
  name: 'Test Coin',
  symbol: 'TEST',
  description: 'Test memecoin',
  logoUrl: 'https://example.com/logo.png',
  creatorId: 'creator-id-1',
  totalSupply: '10',
  currentPrice: '0.1',
  volume24h: '10000',
  transactions: [],
  holdings: [],
  creator: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  curveConfig: defaultCurveConfig,
} as Memecoin;

const mockWalletHolding = {
  id: 'holding-id-1',
  walletId: 'wallet-id-1',
  memecoinId: 'memecoin-id-1',
  amount: '100',
  wallet: mockWallet,
  memecoin: mockMemecoin,
  createdAt: new Date(),
  updatedAt: new Date(),
} as WalletHolding;

const mockTransaction = {
  id: 'transaction-id-1',
  type: TransactionType.BUY,
  memeCoinAmount: '100',
  zthAmount: '10',
  price: '0.1',
  userId: 'user-id-1',
  memecoinId: 'memecoin-id-1',
  user: mockUser,
  memecoin: mockMemecoin,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Transaction;

describe('TradingService', () => {
  let service: TradingService;
  let memecoinRepository;
  let userRepository;
  let walletRepository;
  let walletHoldingRepository;
  let transactionRepository;
  let queryRunner;
  let dataSource: DataSource;

  beforeEach(async () => {
    // Create mock query runner with manager
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        remove: jest
          .fn()
          .mockImplementation((entity) => Promise.resolve(entity)),
      },
    };

    // Create mock repositories
    memecoinRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    walletRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    walletHoldingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    transactionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingService,
        {
          provide: getRepositoryToken(Memecoin),
          useValue: memecoinRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: walletRepository,
        },
        {
          provide: getRepositoryToken(WalletHolding),
          useValue: walletHoldingRepository,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: transactionRepository,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<TradingService>(TradingService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('tradeMemecoin - Buy', () => {
    it('should throw BadRequestException if amount is not positive', async () => {
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '0';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'buy';
      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'buy';
      await expect(
        service.tradeMemecoin('non-existent-user', tradeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if wallet is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(null);
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'buy';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if memecoin is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockWallet);
      queryRunner.manager.findOne.mockResolvedValueOnce(null);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'non-existent-memecoin';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'buy';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if wallet balance is insufficient', async () => {
      const lowBalanceWallet = { ...mockWallet, zthBalance: '5' };
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(lowBalanceWallet);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockMemecoin);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '10';
      tradeDto.tradeType = 'buy';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully buy a memecoin', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockWallet });
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockWalletHolding,
      });

      // Mock transaction creation
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.zthBalance !== undefined) {
          // This is the wallet
          entity.zthBalance = (parseFloat(entity.zthBalance) - 10).toString();
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply = (
            parseFloat(entity.totalSupply) + 100
          ).toString();
          entity.currentPrice = '0.1'; // Keep price consistent
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount = (parseFloat(entity.amount) + 100).toString();
        }
        return Promise.resolve(entity);
      });

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '11';
      tradeDto.tradeType = 'buy';
      tradeDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.tradeMemecoin('user-id-1', tradeDto);

      // Check that repositories were called correctly
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(queryRunner.manager.findOne).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalled();

      // Check that the query runner was used correctly
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();

      // Check the response properties
      expect(result).toHaveProperty('transaction');
      expect(result.transaction).toHaveProperty('type', TransactionType.BUY);
      expect(result).toHaveProperty('memecoin');
      expect(result.memecoin).toHaveProperty('id', 'memecoin-id-1');
    });

    it('should create a new wallet holding if one does not exist', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockWallet });
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      queryRunner.manager.findOne.mockResolvedValueOnce(null); // No existing holding

      // Mock wallet holding creation
      const newHolding = {
        id: 'new-holding-id',
        walletId: 'wallet-id-1',
        memecoinId: 'memecoin-id-1',
        amount: '0',
      };
      walletHoldingRepository.create.mockReturnValue(newHolding);

      // Mock transaction creation
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.zthBalance !== undefined) {
          // This is the wallet
          entity.zthBalance = (parseFloat(entity.zthBalance) - 10).toString();
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply = (
            parseFloat(entity.totalSupply) + 100
          ).toString();
          entity.currentPrice = '0.1'; // Keep price consistent
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount = '100';
        }
        return Promise.resolve(entity);
      });

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '10';
      tradeDto.tradeType = 'buy';
      tradeDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.tradeMemecoin('user-id-1', tradeDto);

      expect(walletHoldingRepository.create).toHaveBeenCalled();
      expect(result.walletHolding).toHaveProperty('amount');
      expect(queryRunner.manager.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if price slippage exceeds tolerance', async () => {
      // Mock a scenario where price changes dramatically
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockWallet });

      // Create a memecoin with a different price than the request price
      const memecoinWithDifferentPrice = {
        ...mockMemecoin,
        totalSupply: '1000',
        currentPrice: '0.2', // Price is double the request price
      };
      queryRunner.manager.findOne.mockResolvedValueOnce(
        memecoinWithDifferentPrice,
      );

      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1'; // Request price is 0.1
      tradeDto.tradeType = 'buy';
      tradeDto.slippageTolerance = 1; // 1% tolerance

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('tradeMemecoin - Sell', () => {
    it('should throw BadRequestException if amount is not positive', async () => {
      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '0';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'sell';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'sell';

      await expect(
        service.tradeMemecoin('non-existent-user', tradeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if wallet is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(null);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'sell';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if memecoin is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockWallet);
      queryRunner.manager.findOne.mockResolvedValueOnce(null);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'non-existent-memecoin';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'sell';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if wallet holding is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockWallet);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockMemecoin);
      queryRunner.manager.findOne.mockResolvedValueOnce(null);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = '0.1';
      tradeDto.tradeType = 'sell';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if holding amount is insufficient', async () => {
      const lowAmountHolding = { ...mockWalletHolding, amount: '5' };
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockWallet);
      queryRunner.manager.findOne.mockResolvedValueOnce(mockMemecoin);
      queryRunner.manager.findOne.mockResolvedValueOnce(lowAmountHolding);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = calculateSellPrice('10', mockMemecoin.totalSupply);
      tradeDto.tradeType = 'sell';

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully sell a memecoin', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockWallet });
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockWalletHolding,
      });

      // Mock transaction creation
      const mockCreatedTransaction = {
        ...mockTransaction,
        type: TransactionType.SELL,
      };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.zthBalance !== undefined) {
          // This is the wallet
          entity.zthBalance = (parseFloat(entity.zthBalance) + 1).toString(); // Increase balance when selling
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply = (parseFloat(entity.totalSupply) - 10).toString();
          entity.currentPrice = '0.1'; // Keep price consistent
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount = (parseFloat(entity.amount) - 10).toString();
        }
        return Promise.resolve(entity);
      });

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = calculateSellPrice('10', mockMemecoin.totalSupply);
      tradeDto.tradeType = 'sell';
      tradeDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.tradeMemecoin('user-id-1', tradeDto);

      // Check that repositories were called correctly
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(queryRunner.manager.findOne).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalled();

      // Check that the query runner was used correctly
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();

      // Check the response properties
      expect(result).toHaveProperty('transaction');
      expect(result.transaction).toHaveProperty('type', TransactionType.SELL);
      expect(result).toHaveProperty('memecoin');
      expect(result.memecoin).toHaveProperty('id', 'memecoin-id-1');
    });

    it('should remove the wallet holding if amount is exactly the holding amount', async () => {
      // Mock all necessary repository methods
      const exactAmountHolding = { ...mockWalletHolding, amount: '10' };
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockWallet });
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      queryRunner.manager.findOne.mockResolvedValueOnce(exactAmountHolding);

      // Mock transaction creation
      const mockCreatedTransaction = {
        ...mockTransaction,
        type: TransactionType.SELL,
      };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Set up the query runner manager
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.zthBalance !== undefined) {
          // This is the wallet
          entity.zthBalance = (parseFloat(entity.zthBalance) + 1).toString(); // Increase balance when selling
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply = (parseFloat(entity.totalSupply) - 10).toString();
          entity.currentPrice = '0.1'; // Keep price consistent
        }
        return Promise.resolve(entity);
      });

      queryRunner.manager.remove.mockResolvedValue(exactAmountHolding);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = calculateSellPrice('10', mockMemecoin.totalSupply);
      tradeDto.tradeType = 'sell';
      tradeDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.tradeMemecoin('user-id-1', tradeDto);

      expect(queryRunner.manager.remove).toHaveBeenCalled();
      expect(result.walletHolding).toBeNull();
    });

    it('should throw BadRequestException if price slippage exceeds tolerance', async () => {
      // Mock a scenario where price changes dramatically
      userRepository.findOne.mockResolvedValue(mockUser);
      queryRunner.manager.findOne.mockResolvedValueOnce({ ...mockWallet });

      // Create a memecoin with a different price than the request price
      const memecoinWithDifferentPrice = {
        ...mockMemecoin,
        totalSupply: '1000',
        currentPrice: '0.05', // Price is half the request price
      };
      queryRunner.manager.findOne.mockResolvedValueOnce(
        memecoinWithDifferentPrice,
      );
      queryRunner.manager.findOne.mockResolvedValueOnce({
        ...mockWalletHolding,
      });

      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      const tradeDto = new TradeMemecoinDto();
      tradeDto.memecoinId = 'memecoin-id-1';
      tradeDto.amount = '10';
      tradeDto.requestCost = calculateSellPrice('10', mockMemecoin.totalSupply);
      tradeDto.tradeType = 'sell';
      tradeDto.slippageTolerance = 1; // 1% tolerance

      await expect(
        service.tradeMemecoin('user-id-1', tradeDto),
      ).rejects.toThrow(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
