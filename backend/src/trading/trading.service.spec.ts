import { Test, TestingModule } from '@nestjs/testing';
import { TradingService } from './trading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BuyMemecoinDto, SellMemecoinDto } from './dto';

// Mock data
const mockUser = {
  id: 'user-id-1',
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
};

const mockWallet = {
  id: 'wallet-id-1',
  ownerId: 'user-id-1',
  address: '0x123456789',
  balance: 100,
};

const mockMemecoin = {
  id: 'memecoin-id-1',
  name: 'Test Coin',
  symbol: 'TEST',
  totalSupply: 1000,
  currentPrice: 0.1,
  creatorId: 'user-id-1',
};

const mockWalletHolding = {
  id: 'holding-id-1',
  walletId: 'wallet-id-1',
  memecoinId: 'memecoin-id-1',
  amount: 50,
};

const mockTransaction = {
  id: 'transaction-id-1',
  userId: 'user-id-1',
  type: TransactionType.BUY,
  memecoinId: 'memecoin-id-1',
  amount: 10,
  price: 0.1,
  totalValue: 1,
  createdAt: new Date(),
};

describe('TradingService', () => {
  let service: TradingService;
  let memecoinRepository;
  let userRepository;
  let walletRepository;
  let walletHoldingRepository;
  let transactionRepository;
  let dataSource: DataSource;
  let queryRunner;

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
        remove: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
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
      buyDto.amount = 0;

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;

      await expect(service.buyMemecoin('non-existent-user', buyDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if wallet is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(null);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if memecoin is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(null);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'non-existent-memecoin';
      buyDto.amount = 10;

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if wallet balance is insufficient', async () => {
      const lowBalanceWallet = { ...mockWallet, balance: 5 };
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(lowBalanceWallet);
      memecoinRepository.findOne.mockResolvedValue(mockMemecoin);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully buy a memecoin', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({ ...mockMemecoin });
      walletHoldingRepository.findOne.mockResolvedValue({ ...mockWalletHolding });
      
      // Mock transaction creation
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);
      
      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance -= 10;
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply += 100;
          entity.currentPrice = 0.2;
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount += 100;
        }
        return Promise.resolve(entity);
      });

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;
      buyDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.buyMemecoin('user-id-1', buyDto);

      // Check that repositories were called correctly
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
      expect(walletRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 'user-id-1' } });
      expect(memecoinRepository.findOne).toHaveBeenCalledWith({ where: { id: 'memecoin-id-1' } });
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
      memecoinRepository.findOne.mockResolvedValue({ ...mockMemecoin });
      walletHoldingRepository.findOne.mockResolvedValue(null);
      
      // Mock wallet holding creation
      const newHolding = {
        id: 'new-holding-id',
        walletId: 'wallet-id-1',
        memecoinId: 'memecoin-id-1',
        amount: 0,
      };
      walletHoldingRepository.create.mockReturnValue(newHolding);
      
      // Mock transaction creation
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);
      
      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance -= 10;
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply += 100;
          entity.currentPrice = 0.2;
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount = 100;
        }
        return Promise.resolve(entity);
      });

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;
      buyDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.buyMemecoin('user-id-1', buyDto);

      expect(walletHoldingRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('newHoldingAmount');
      expect(queryRunner.manager.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if price slippage exceeds tolerance', async () => {
      // Mock a scenario where price changes dramatically
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      
      // Create a memecoin with very low supply to trigger high slippage
      const highSlippageMemecoin = { 
        ...mockMemecoin, 
        totalSupply: 10,  // Low supply will cause high price impact
        currentPrice: 0.01
      };
      memecoinRepository.findOne.mockResolvedValue(highSlippageMemecoin);
      
      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      const buyDto = new BuyMemecoinDto();
      buyDto.memecoinId = 'memecoin-id-1';
      buyDto.amount = 10;
      buyDto.slippageTolerance = 0.1; // Very low tolerance

      await expect(service.buyMemecoin('user-id-1', buyDto)).rejects.toThrow(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('sellMemecoin', () => {
    it('should throw BadRequestException if amount is not positive', async () => {
      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 0;

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;

      await expect(service.sellMemecoin('non-existent-user', sellDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if wallet is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if memecoin is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'non-existent-memecoin';
      sellDto.amount = 10;

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if wallet holding is not found', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(mockMemecoin);
      walletHoldingRepository.findOne.mockResolvedValue(null);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if holding amount is insufficient', async () => {
      const lowAmountHolding = { ...mockWalletHolding, amount: 5 };
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue(mockWallet);
      memecoinRepository.findOne.mockResolvedValue(mockMemecoin);
      walletHoldingRepository.findOne.mockResolvedValue(lowAmountHolding);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully sell a memecoin', async () => {
      // Mock all necessary repository methods
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({ ...mockMemecoin });
      walletHoldingRepository.findOne.mockResolvedValue({ ...mockWalletHolding });
      
      // Mock transaction creation
      const mockCreatedTransaction = { 
        ...mockTransaction,
        type: TransactionType.SELL
      };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);
      
      // Set up the query runner manager to return the updated entities
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance += 1; // Increase balance when selling
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply -= 10;
          entity.currentPrice = 0.09;
        } else if (entity.amount !== undefined && entity.walletId) {
          // This is the wallet holding
          entity.amount -= 10;
        }
        return Promise.resolve(entity);
      });

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;
      sellDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.sellMemecoin('user-id-1', sellDto);

      // Check that repositories were called correctly
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-id-1' } });
      expect(walletRepository.findOne).toHaveBeenCalledWith({ where: { ownerId: 'user-id-1' } });
      expect(memecoinRepository.findOne).toHaveBeenCalledWith({ where: { id: 'memecoin-id-1' } });
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
      const exactAmountHolding = { ...mockWalletHolding, amount: 10 };
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      memecoinRepository.findOne.mockResolvedValue({ ...mockMemecoin });
      walletHoldingRepository.findOne.mockResolvedValue(exactAmountHolding);
      
      // Mock transaction creation
      const mockCreatedTransaction = { 
        ...mockTransaction,
        type: TransactionType.SELL
      };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);
      
      // Set up the query runner manager
      queryRunner.manager.save.mockImplementation((entity) => {
        if (entity.balance !== undefined) {
          // This is the wallet
          entity.balance += 1; // Increase balance when selling
        } else if (entity.totalSupply !== undefined) {
          // This is the memecoin
          entity.totalSupply -= 10;
          entity.currentPrice = 0.09;
        }
        return Promise.resolve(entity);
      });
      
      queryRunner.manager.remove.mockResolvedValue(exactAmountHolding);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;
      sellDto.slippageTolerance = 100; // Set high tolerance to avoid slippage error

      const result = await service.sellMemecoin('user-id-1', sellDto);

      expect(queryRunner.manager.remove).toHaveBeenCalled();
      expect(result).toHaveProperty('newHoldingAmount', 0);
    });

    it('should throw BadRequestException if price slippage exceeds tolerance', async () => {
      // Mock a scenario where price changes dramatically
      userRepository.findOne.mockResolvedValue(mockUser);
      walletRepository.findOne.mockResolvedValue({ ...mockWallet });
      
      // Create a memecoin with very low supply to trigger high slippage
      const highSlippageMemecoin = { 
        ...mockMemecoin, 
        totalSupply: 100,  // Low supply will cause high price impact
        currentPrice: 0.01
      };
      memecoinRepository.findOne.mockResolvedValue(highSlippageMemecoin);
      walletHoldingRepository.findOne.mockResolvedValue({ ...mockWalletHolding });
      
      // Mock transaction creation to avoid null reference
      const mockCreatedTransaction = { ...mockTransaction };
      transactionRepository.create.mockReturnValue(mockCreatedTransaction);

      const sellDto = new SellMemecoinDto();
      sellDto.memecoinId = 'memecoin-id-1';
      sellDto.amount = 10;
      sellDto.slippageTolerance = 0.1; // Very low tolerance

      await expect(service.sellMemecoin('user-id-1', sellDto)).rejects.toThrow(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price based on bonding curve formula', () => {
      // Using the private method through any type assertion
      const calculatePrice = (service as any).calculatePrice.bind(service);
      
      expect(calculatePrice(0)).toBe(0);
      expect(calculatePrice(100)).toBe(1);
      expect(calculatePrice(200)).toBe(4);
      expect(calculatePrice(1000)).toBe(100);
    });
  });
});
