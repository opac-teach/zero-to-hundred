import { Test } from '@nestjs/testing';
import { TradeResponseDto } from './trade-response.dto';
import {
  Transaction,
  TransactionType,
} from '../../entities/transaction.entity';
import { Memecoin } from '../../entities/memecoin.entity';

describe('TradeResponseDto', () => {
  const mockTransaction: Transaction = {
    id: 'transaction-id-1',
    userId: 'user-id-1',
    memecoinId: 'memecoin-id-1',
    amount: 100,
    price: 0.1,
    totalValue: 10,
    type: TransactionType.BUY,
    createdAt: new Date(),
    user: null,
    memecoin: null,
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
    creatorId: 'user-id-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: null,
  };

  it('should create a DTO from a plain object', () => {
    const plainObject = {
      transactionId: mockTransaction.id,
      type: mockTransaction.type,
      memecoinId: mockMemecoin.id,
      memecoinSymbol: mockMemecoin.symbol,
      newHoldingAmount: 90,
    };

    const dto = new TradeResponseDto(plainObject);

    expect(dto.transactionId).toBe(mockTransaction.id);
    expect(dto.type).toBe(mockTransaction.type);
    expect(dto.memecoinId).toBe(mockMemecoin.id);
    expect(dto.memecoinSymbol).toBe(mockMemecoin.symbol);
    expect(dto.newHoldingAmount).toBe(90);
  });

  it('should create a DTO from partial data', () => {
    const partialData = {
      transactionId: mockTransaction.id,
      type: mockTransaction.type,
      memecoinId: mockMemecoin.id,
      memecoinSymbol: mockMemecoin.symbol,
    };

    const dto = new TradeResponseDto(partialData);

    expect(dto.transactionId).toBe(mockTransaction.id);
    expect(dto.type).toBe(mockTransaction.type);
    expect(dto.memecoinId).toBe(mockMemecoin.id);
    expect(dto.memecoinSymbol).toBe(mockMemecoin.symbol);
    expect(dto.newHoldingAmount).toBeUndefined();
  });

  it('should handle undefined values', () => {
    const plainObject = {
      transactionId: undefined,
      type: undefined,
      memecoinId: undefined,
      memecoinSymbol: undefined,
      newHoldingAmount: undefined,
    };

    const dto = new TradeResponseDto(plainObject);

    expect(dto.transactionId).toBeUndefined();
    expect(dto.type).toBeUndefined();
    expect(dto.memecoinId).toBeUndefined();
    expect(dto.memecoinSymbol).toBeUndefined();
    expect(dto.newHoldingAmount).toBeUndefined();
  });
});
