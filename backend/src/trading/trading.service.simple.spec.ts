import { Test, TestingModule } from '@nestjs/testing';
import { TradingService } from './trading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Memecoin } from '../entities/memecoin.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction } from '../entities/transaction.entity';

describe('TradingService', () => {
  let service: TradingService;

  // Simple mock repositories
  const mockRepositories = {
    memecoin: { findOne: jest.fn(), save: jest.fn() },
    user: { findOne: jest.fn() },
    wallet: { findOne: jest.fn(), save: jest.fn() },
    walletHolding: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() },
    transaction: { create: jest.fn(), save: jest.fn() },
  };

  // Mock query runner
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingService,
        {
          provide: getRepositoryToken(Memecoin),
          useValue: mockRepositories.memecoin,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositories.user,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockRepositories.wallet,
        },
        {
          provide: getRepositoryToken(WalletHolding),
          useValue: mockRepositories.walletHolding,
        },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepositories.transaction,
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<TradingService>(TradingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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