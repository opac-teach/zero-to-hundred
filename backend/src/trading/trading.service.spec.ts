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
import { BuyMemecoinDto, SellMemecoinDto } from './dto';
import { calculatePrice } from './bonding-curve';

// Mock data
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
  totalSupply: '1000000',
  currentPrice: '0.1',
  marketCap: '100000',
  volume24h: '10000',
  creator: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
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

  describe('buyMemecoin', () => {
    it('should throw BadRequestException if amount is not positive', async () => {
      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '0';
      buyDto.requestPrice = '0.1';

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1';

      await expect(
        service.buyMemecoin('non-existent-user', buyDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if wallet is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(null);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1';

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if memecoin is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(null);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'non-existent-memecoin';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1';

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if wallet balance is insufficient', async () => {
      const lowBalanceWallet = { ...mockWallet, zthBalance: '5' };
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(lowBalanceWallet);
      memecoinRepository.findOne.mockResolvedValue(mockMemecoin);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1';

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully buy a memecoin', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      walletHoldingRepository.findOne.mockResolvedValue({
        ...mockWalletHolding,
      });

      // Mock transaction creation
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance -= '10';
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply += '100';
          entity.currentPrice = '0.1'; // Keep price consistent
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount += '100';
        }
        return Promise.resolve(entity);
      });

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1';
      buyDto.slippageTolerance = '100'; // Set high tolerance to avoid slippage error

      const result = await service.buyMemecoin('user-id-1', buyDto);

      // Check that repositories were called correctly
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { ownerId: 'user-id-1' },
      });
      expect(memecoinRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'memecoin-id-1' },
      });
      expect(walletHoldingRepository.findOne).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalled();

      // Check that the query runner was used correctly
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();

      // Check the response properties
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('type', TransactionType.BUY);
      expect(result).toHaveProperty('memecoinId', 'memecoin-id-1');
      expect(result).toHaveProperty('memecoinSymbol', 'TEST');
    });

    it('should create a new wallet holding if one does not exist', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      walletHoldingRepository.findOne.mockResolvedValue(null);

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
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance -= '10';
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply += '100';
          entity.currentPrice = '0.1'; // Keep price consistent
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount = '100';
        }
        return Promise.resolve(entity);
      });

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1';
      buyDto.slippageTolerance = '100'; // Set high tolerance to avoid slippage error

      const result = await service.buyMemecoin('user-id-1', buyDto);

      expect(walletHoldingRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('newHoldingAmount');
      expect(queryRunner.manager.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if price slippage exceeds tolerance', async () => {
      // Mock a scenario where price changes dramatically
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });

      // Create a memecoin with a different price than the request price
      const memecoinWithDifferentPrice = {
        ...mockMemecoin,
        totalSupply: '1000',
        currentPrice: '0.2', // Price is double the request price
      };
      memecoinRepository.findOne.mockResolvedValue(memecoinWithDifferentPrice);

      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10';
      buyDto.requestPrice = '0.1'; // Request price is 0.1
      buyDto.slippageTolerance = '1'; // 1% tolerance

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if transaction would result in negative balance', async () => {
      // Mock a scenario where the transaction would result in negative balance
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        zthBalance: '5',
      }); // Set balance to 5
      memecoinRepository.findOne.mockResolvedValue({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price

      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Mock the query runner
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn(),
          remove: jest.fn(),
        },
      };
      jest
        .spyOn(service['dataSource'], 'createQueryRunner')
        .mockReturnValue(mockQueryRunner as any);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = '10'; // Amount greater than balance
      buyDto.requestPrice = '0.1';
      buyDto.slippageTolerance = '100'; // Set high tolerance to avoid slippage error

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });
  });

  describe('sellMemecoin', () => {
    it('should throw BadRequestException if amount is not positive', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '0';
      sellDto.requestPrice = '0.1';

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';

      await expect(
        service.sellMemecoin('non-existent-user', sellDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if wallet is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if memecoin is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'non-existent-memecoin';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if wallet holding is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(mockMemecoin);
      walletHoldingRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if holding amount is insufficient', async () => {
      const lowAmountHolding = { ...mockWalletHolding, amount: '5' };
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(mockMemecoin);
      walletHoldingRepository.findOne.mockResolvedValue(lowAmountHolding);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully sell a memecoin', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      walletHoldingRepository.findOne.mockResolvedValue({
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
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance += '1'; // Increase balance when selling
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply -= '10';
          entity.currentPrice = '0.1'; // Keep price consistent
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount -= '10';
        }
        return Promise.resolve(entity);
      });

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';
      sellDto.slippageTolerance = '100'; // Set high tolerance to avoid slippage error

      const result = await service.sellMemecoin('user-id-1', sellDto);

      // Check that repositories were called correctly
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { ownerId: 'user-id-1' },
      });
      expect(memecoinRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'memecoin-id-1' },
      });
      expect(walletHoldingRepository.findOne).toHaveBeenCalled();
      expect(transactionRepository.create).toHaveBeenCalled();

      // Check that the query runner was used correctly
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();

      // Check the response properties
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('type', TransactionType.SELL);
      expect(result).toHaveProperty('memecoinId', 'memecoin-id-1');
      expect(result).toHaveProperty('memecoinSymbol', 'TEST');
    });

    it('should remove the wallet holding if amount is exactly the holding amount', async () => {
      // Mock all necessary repository methods
      const exactAmountHolding = { ...mockWalletHolding, amount: '10' };
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({
        ...mockMemecoin,
        currentPrice: '0.1',
      }); // Match request price
      walletHoldingRepository.findOne.mockResolvedValue(exactAmountHolding);

      // Mock transaction creation
      const mockCreatedTransaction = {
        ...mockTransaction,
        type: TransactionType.SELL,
      };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      // Set up the query runner manager
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance += '1'; // Increase balance when selling
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply -= '10';
          entity.currentPrice = '0.1'; // Keep price consistent
        }
        return Promise.resolve(entity);
      });

      queryRunner.manager.remove.mockResolvedValue(exactAmountHolding);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1';
      sellDto.slippageTolerance = '100'; // Set high tolerance to avoid slippage error

      const result = await service.sellMemecoin('user-id-1', sellDto);

      expect(queryRunner.manager.remove).toHaveBeenCalled();
      expect(result).toHaveProperty('newHoldingAmount', '0');
    });

    it('should throw BadRequestException if price slippage exceeds tolerance', async () => {
      // Mock a scenario where price changes dramatically
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });

      // Create a memecoin with a different price than the request price
      const memecoinWithDifferentPrice = {
        ...mockMemecoin,
        totalSupply: '1000',
        currentPrice: '0.05', // Price is half the request price
      };
      memecoinRepository.findOne.mockResolvedValue(memecoinWithDifferentPrice);
      walletHoldingRepository.findOne.mockResolvedValue({
        ...mockWalletHolding,
      });

      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = '10';
      sellDto.requestPrice = '0.1'; // Request price is 0.1
      sellDto.slippageTolerance = '1'; // 1% tolerance

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price based on bonding curve formula', () => {
      expect(calculatePrice(0)).toBe(1); // Base price for new memecoins
      expect(calculatePrice(100)).toBe(1.01);
      expect(calculatePrice(200)).toBe(1.02);
    });
  });
});
