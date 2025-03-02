import { Test, TestingModule } from '@nestjs/testing';
import { TradingService } from './trading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Memecoin } from '../entities/memecoin.entity';
import { WalletHolding } from '../entities/wallet-holding.entity';
import { Transaction } from '../entities/transaction.entity';
import { DataSource } from 'typeorm';

// Mock repositories
const mockRepositories = {
  userRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  memecoinRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  walletRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  walletHoldingRepository: {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  },
  transactionRepository: {
    create: jest.fn(),
    save: jest.fn(),
  },
};

// Mock DataSource
const mockDataSource = {
  createQueryRunner: jest.fn(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
      remove: jest.fn(),
    },
  })),
};

describe('Bonding Curve Algorithm', () => {
  let service: TradingService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingService,
        { provide: getRepositoryToken(User), useValue: mockRepositories.userRepository },
        { provide: getRepositoryToken(Wallet), useValue: mockRepositories.walletRepository },
        { provide: getRepositoryToken(Memecoin), useValue: mockRepositories.memecoinRepository },
        { provide: getRepositoryToken(WalletHolding), useValue: mockRepositories.walletHoldingRepository },
        { provide: getRepositoryToken(Transaction), useValue: mockRepositories.transactionRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<TradingService>(TradingService);
  });

  // Helper function to access the private calculatePrice method
  const calculatePrice = (supply: number) => {
    return (service as any).calculatePrice(supply);
  };

  describe('Price Calculation', () => {
    it('should calculate price as (supply)²/10000', () => {
      // Test with various supply values
      expect(calculatePrice(0)).toBe(0);
      expect(calculatePrice(100)).toBe(1);
      expect(calculatePrice(200)).toBe(4);
      expect(calculatePrice(500)).toBe(25);
      expect(calculatePrice(1000)).toBe(100);
    });

    it('should handle decimal supply values', () => {
      expect(calculatePrice(10.5)).toBe(0.011025);
      expect(calculatePrice(33.33)).toBe(0.11108889);
      expect(calculatePrice(150.75)).toBe(2.27255625);
    });

    it('should handle large supply values', () => {
      expect(calculatePrice(10000)).toBe(10000);
      expect(calculatePrice(100000)).toBe(1000000);
    });
  });

  describe('Buy Simulation', () => {
    it('should simulate price impact for buying tokens', () => {
      // Initial state
      const initialSupply = 1000;
      const initialPrice = calculatePrice(initialSupply); // 100
      
      // Buy simulation - small purchase
      const smallPurchaseAmount = 10; // ZTH
      const smallTokensReceived = smallPurchaseAmount / initialPrice; // 0.1 tokens
      const newSupplyAfterSmall = initialSupply + smallTokensReceived;
      const newPriceAfterSmall = calculatePrice(newSupplyAfterSmall);
      
      // Price should increase slightly
      expect(newPriceAfterSmall).toBeGreaterThan(initialPrice);
      expect(newPriceAfterSmall - initialPrice).toBeLessThan(1); // Small impact
      
      // Buy simulation - large purchase
      const largePurchaseAmount = 1000; // ZTH
      const largeTokensReceived = largePurchaseAmount / initialPrice; // 10 tokens
      const newSupplyAfterLarge = initialSupply + largeTokensReceived;
      const newPriceAfterLarge = calculatePrice(newSupplyAfterLarge);
      
      // Price should increase significantly
      expect(newPriceAfterLarge).toBeGreaterThan(initialPrice);
      expect(newPriceAfterLarge - initialPrice).toBeGreaterThan(1); // Larger impact
    });
  });

  describe('Sell Simulation', () => {
    it('should simulate price impact for selling tokens', () => {
      // Initial state
      const initialSupply = 1000;
      const initialPrice = calculatePrice(initialSupply); // 100
      
      // Sell simulation - small sale
      const smallSaleTokens = 10; // tokens
      const newSupplyAfterSmall = initialSupply - smallSaleTokens;
      const newPriceAfterSmall = calculatePrice(newSupplyAfterSmall);
      const zthReceivedSmall = smallSaleTokens * newPriceAfterSmall;
      
      // Price should decrease slightly
      expect(newPriceAfterSmall).toBeLessThan(initialPrice);
      expect(initialPrice - newPriceAfterSmall).toBeLessThan(2); // Small impact
      
      // Sell simulation - large sale
      const largeSaleTokens = 100; // tokens
      const newSupplyAfterLarge = initialSupply - largeSaleTokens;
      const newPriceAfterLarge = calculatePrice(newSupplyAfterLarge);
      const zthReceivedLarge = largeSaleTokens * newPriceAfterLarge;
      
      // Price should decrease significantly
      expect(newPriceAfterLarge).toBeLessThan(initialPrice);
      expect(initialPrice - newPriceAfterLarge).toBeGreaterThan(10); // Larger impact
    });
  });

  describe('Market Dynamics', () => {
    it('should demonstrate how price changes with market activity', () => {
      // Start with new memecoin
      let supply = 100;
      let price = calculatePrice(supply); // 1
      
      // Series of buys
      for (let i = 0; i < 5; i++) {
        const buyAmount = 10; // ZTH
        const tokensReceived = buyAmount / price;
        supply += tokensReceived;
        price = calculatePrice(supply);
      }
      
      // Price should have increased after buys
      expect(price).toBeGreaterThan(1);
      
      // Series of sells
      const peakPrice = price;
      for (let i = 0; i < 3; i++) {
        const sellTokens = 10;
        supply -= sellTokens;
        price = calculatePrice(supply);
      }
      
      // Price should have decreased after sells
      expect(price).toBeLessThan(peakPrice);
    });
  });

  describe('Slippage Calculation', () => {
    it('should calculate slippage correctly for buys', () => {
      const initialSupply = 1000;
      const initialPrice = calculatePrice(initialSupply); // 100
      
      // Small purchase (minimal slippage)
      const smallPurchase = 10; // ZTH
      const tokensFromSmall = smallPurchase / initialPrice;
      const priceAfterSmall = calculatePrice(initialSupply + tokensFromSmall);
      const slippageSmall = (priceAfterSmall - initialPrice) / initialPrice * 100;
      
      expect(slippageSmall).toBeLessThan(1); // Less than 1% slippage
      
      // Large purchase (significant slippage)
      const largePurchase = 5000; // ZTH
      const tokensFromLarge = largePurchase / initialPrice;
      const priceAfterLarge = calculatePrice(initialSupply + tokensFromLarge);
      const slippageLarge = (priceAfterLarge - initialPrice) / initialPrice * 100;
      
      expect(slippageLarge).toBeGreaterThan(5); // More than 5% slippage
    });

    it('should calculate slippage correctly for sells', () => {
      const initialSupply = 1000;
      const initialPrice = calculatePrice(initialSupply); // 100
      
      // Small sale (minimal slippage)
      const smallSale = 10; // tokens
      const priceAfterSmall = calculatePrice(initialSupply - smallSale);
      const slippageSmall = (initialPrice - priceAfterSmall) / initialPrice * 100;
      
      expect(slippageSmall).toBeLessThan(2); // Less than 2% slippage
      
      // Large sale (significant slippage)
      const largeSale = 200; // tokens
      const priceAfterLarge = calculatePrice(initialSupply - largeSale);
      const slippageLarge = (initialPrice - priceAfterLarge) / initialPrice * 100;
      
      expect(slippageLarge).toBeGreaterThan(30); // More than 30% slippage
    });
  });
}); 