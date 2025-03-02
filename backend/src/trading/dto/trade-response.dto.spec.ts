import { plainToInstance } from 'class-transformer';
import { TradeResponseDto } from './trade-response.dto';
import { TransactionType } from '../../entities/transaction.entity';

describe('TradeResponseDto', () => {
  it('should transform a plain object to a TradeResponseDto instance', () => {
    const now = new Date();
    const plainObject = {
      transactionId: 'transaction-id-1',
      type: TransactionType.BUY,
      memecoinId: 'memecoin-id-1',
      memecoinSymbol: 'TEST',
      amount: 10,
      price: 0.1,
      totalValue: 1,
      newBalance: 99,
      newHoldingAmount: 60,
      executedAt: now,
    };

    const dto = new TradeResponseDto(plainObject);

    // Check that all expected properties are present
    expect(dto.transactionId).toBe(plainObject.transactionId);
    expect(dto.type).toBe(plainObject.type);
    expect(dto.memecoinId).toBe(plainObject.memecoinId);
    expect(dto.memecoinSymbol).toBe(plainObject.memecoinSymbol);
    expect(dto.amount).toBe(plainObject.amount);
    expect(dto.price).toBe(plainObject.price);
    expect(dto.totalValue).toBe(plainObject.totalValue);
    expect(dto.newBalance).toBe(plainObject.newBalance);
    expect(dto.newHoldingAmount).toBe(plainObject.newHoldingAmount);
    expect(dto.executedAt).toEqual(plainObject.executedAt);
  });

  it('should handle partial data correctly', () => {
    const partialData = {
      transactionId: 'transaction-id-1',
      type: TransactionType.SELL,
      memecoinId: 'memecoin-id-1',
      memecoinSymbol: 'TEST',
    };

    const dto = new TradeResponseDto(partialData);

    // Check that provided properties are present
    expect(dto.transactionId).toBe(partialData.transactionId);
    expect(dto.type).toBe(partialData.type);
    expect(dto.memecoinId).toBe(partialData.memecoinId);
    expect(dto.memecoinSymbol).toBe(partialData.memecoinSymbol);

    // Check that non-provided properties are undefined
    expect(dto.amount).toBeUndefined();
    expect(dto.price).toBeUndefined();
    expect(dto.totalValue).toBeUndefined();
    expect(dto.newBalance).toBeUndefined();
    expect(dto.newHoldingAmount).toBeUndefined();
    expect(dto.executedAt).toBeUndefined();
  });

  it('should handle transformation with class-transformer', () => {
    const now = new Date();
    const plainObject = {
      transactionId: 'transaction-id-1',
      type: TransactionType.BUY,
      memecoinId: 'memecoin-id-1',
      memecoinSymbol: 'TEST',
      amount: 10,
      price: 0.1,
      totalValue: 1,
      newBalance: 99,
      newHoldingAmount: 60,
      executedAt: now,
    };

    const dto = plainToInstance(TradeResponseDto, plainObject);

    // Check that all expected properties are present
    expect(dto.transactionId).toBe(plainObject.transactionId);
    expect(dto.type).toBe(plainObject.type);
    expect(dto.memecoinId).toBe(plainObject.memecoinId);
    expect(dto.memecoinSymbol).toBe(plainObject.memecoinSymbol);
    expect(dto.amount).toBe(plainObject.amount);
    expect(dto.price).toBe(plainObject.price);
    expect(dto.totalValue).toBe(plainObject.totalValue);
    expect(dto.newBalance).toBe(plainObject.newBalance);
    expect(dto.newHoldingAmount).toBe(plainObject.newHoldingAmount);
    expect(dto.executedAt).toEqual(plainObject.executedAt);
  });
}); 