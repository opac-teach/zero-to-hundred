import { calculatePrice } from './bonding-curve';

describe('calculatePrice', () => {
  it('should return starting price (1 USDC) when supply is 0', () => {
    expect(calculatePrice(0)).toBe(1);
  });

  it('should calculate price correctly for positive supply', () => {
    // With slope of 0.0001 and starting price of 1
    // Price = 0.0001 * supply + 1
    expect(calculatePrice(1000)).toBe(1.1); // 0.0001 * 1000 + 1 = 1.1
    expect(calculatePrice(5000)).toBe(1.5); // 0.0001 * 5000 + 1 = 1.5
    expect(calculatePrice(10000)).toBe(2); // 0.0001 * 10000 + 1 = 2
  });

  it('should handle large supply values', () => {
    expect(calculatePrice(100000)).toBe(11); // 0.0001 * 100000 + 1 = 11
    expect(calculatePrice(1000000)).toBe(101); // 0.0001 * 1000000 + 1 = 101
  });
});
