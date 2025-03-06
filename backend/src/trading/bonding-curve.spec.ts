import BigNumber from 'bignumber.js';
import {
  BondingCurveConfig,
  calculateBuyPrice,
  calculatePrice,
  calculateSellPrice,
} from './bonding-curve';

describe('bonding curve - linear', () => {
  const curveConfig: BondingCurveConfig = {
    slope: '0.005',
    startingPrice: '1',
    curveType: 'linear',
  };

  describe('calculatePrice', () => {
    it('should calculate price correctly for positive supply', () => {
      expect(calculatePrice('0', curveConfig)).toBe('1');
      expect(calculatePrice('100', curveConfig)).toBe('1.5');
      expect(calculatePrice('200', curveConfig)).toBe('2');
      expect(calculatePrice('300', curveConfig)).toBe('2.5');
      expect(calculatePrice('400', curveConfig)).toBe('3');
    });
  });

  describe('calculate sell/price Prices', () => {
    it('should calculate buy price correctly', () => {
      expect(calculateBuyPrice('1', '0', curveConfig)).toBe('1.0025');
      expect(calculateBuyPrice('10', '0', curveConfig)).toBe('10.25');
      expect(calculateBuyPrice('10', '5', curveConfig)).toBe('10.5');
      expect(calculateBuyPrice('10', '50', curveConfig)).toBe('12.75');
    });

    it('should calculate sell price correctly', () => {
      expect(calculateSellPrice('1', '1', curveConfig)).toBe('1.0025');
      expect(calculateSellPrice('1', '10', curveConfig)).toBe('1.0475');
      expect(calculateSellPrice('10', '10', curveConfig)).toBe('10.25');
      expect(calculateSellPrice('10', '50', curveConfig)).toBe('12.25');
    });

    it('should throw when selling too much', () => {
      expect(() => calculateSellPrice('100', '10', curveConfig)).toThrow(
        'Cannot sell more than supply',
      );
    });

    it('should calculate sll/price should be same', () => {
      expect(calculateBuyPrice('1', '0', curveConfig)).toBe(
        calculateSellPrice('1', '1', curveConfig),
      );
      expect(calculateBuyPrice('100', '0', curveConfig)).toBe(
        calculateSellPrice('100', '100', curveConfig),
      );
      expect(calculateBuyPrice('50', '50', curveConfig)).toBe(
        calculateSellPrice('50', '100', curveConfig),
      );
      expect(calculateBuyPrice('25', '50', curveConfig)).toBe(
        calculateSellPrice('25', '75', curveConfig),
      );
    });
  });

  describe('iterative buy/sell', () => {
    it('iterate by 1', () => {
      let pool = new BigNumber(0);
      for (let i = 0; i < 100; i++) {
        pool = pool.plus(
          Number(calculateBuyPrice('1', i.toString(), curveConfig)),
        );
      }
      for (let i = 100; i > 0; i--) {
        pool = pool.minus(
          Number(calculateSellPrice('1', i.toString(), curveConfig)),
        );
      }
      expect(pool.toString()).toBe('0');
    });
    it('iterate by 1.5', () => {
      let pool = new BigNumber(0);
      let amount = new BigNumber(0);
      for (let i = 0; i < 100; i++) {
        pool = pool.plus(
          Number(calculateBuyPrice('1.5', amount.toString(), curveConfig)),
        );
        amount = amount.plus(new BigNumber(1.5));
      }
      for (let i = 100; i > 0; i--) {
        pool = pool.minus(
          Number(calculateSellPrice('1.5', amount.toString(), curveConfig)),
        );
        amount = amount.minus(new BigNumber(1.5));
      }
      expect(amount.toString()).toBe('0');
      expect(pool.toString()).toBe('0');
    });
  });
});

describe('bonding curve - exponential', () => {
  const curveConfig: BondingCurveConfig = {
    slope: '3',
    startingPrice: '1',
    curveType: 'exponential',
  };

  describe('calculatePrice', () => {
    it('should calculate price correctly for positive supply', () => {
      expect(calculatePrice('0', curveConfig)).toBe('0');
      expect(calculatePrice('1', curveConfig)).toBe('1');
      expect(calculatePrice('2', curveConfig)).toBe('8');
      expect(calculatePrice('100', curveConfig)).toBe('1000000');
    });
  });

  describe('calculate Buy/sell Price', () => {
    it('should calculate buy price correctly', () => {
      expect(calculateBuyPrice('1', '0', curveConfig)).toBe('0.25');
      expect(calculateBuyPrice('2', '0', curveConfig)).toBe('4');
      expect(calculateBuyPrice('1', '5', curveConfig)).toBe('167.75');
      expect(calculateBuyPrice('5', '5', curveConfig)).toBe('2343.75');
    });

    it('should calculate sell price correctly', () => {
      expect(calculateSellPrice('1', '1', curveConfig)).toBe('0.25');
      expect(calculateSellPrice('1', '2', curveConfig)).toBe('3.75');
      expect(calculateSellPrice('2', '5', curveConfig)).toBe('136');
      expect(calculateSellPrice('5', '5', curveConfig)).toBe('156.25');
    });

    it('should calculate sell/price should be same', () => {
      expect(calculateBuyPrice('1', '0', curveConfig)).toBe(
        calculateSellPrice('1', '1', curveConfig),
      );
      expect(calculateBuyPrice('100', '0', curveConfig)).toBe(
        calculateSellPrice('100', '100', curveConfig),
      );
      expect(calculateBuyPrice('50', '50', curveConfig)).toBe(
        calculateSellPrice('50', '100', curveConfig),
      );
      expect(calculateBuyPrice('25', '50', curveConfig)).toBe(
        calculateSellPrice('25', '75', curveConfig),
      );
    });
  });

  describe('iterative buy/sell', () => {
    it('iterate by 1', () => {
      let pool = new BigNumber(0);
      let amount = 0;
      for (let i = 0; i < 100; i++) {
        pool = pool.plus(
          Number(calculateBuyPrice('1', amount.toString(), curveConfig)),
        );
        amount += 1;
      }
      for (let i = 100; i > 0; i--) {
        pool = pool.minus(
          Number(calculateSellPrice('1', amount.toString(), curveConfig)),
        );
        amount -= 1;
      }
      expect(amount).toBe(0);
      expect(pool.toString()).toBe('0');
    });
    it('iterate by 1.5', () => {
      let pool = new BigNumber(0);
      let amount = 0;
      for (let i = 0; i < 100; i++) {
        pool = pool.plus(
          Number(calculateBuyPrice('1.5', amount.toString(), curveConfig)),
        );
        amount += 1.5;
      }
      for (let i = 100; i > 0; i--) {
        pool = pool.minus(
          Number(calculateSellPrice('1.5', amount.toString(), curveConfig)),
        );
        amount -= 1.5;
      }
      expect(amount).toBe(0);
      expect(pool.toString()).toBe('0');
    });
  });
});
