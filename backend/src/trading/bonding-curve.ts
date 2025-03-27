import Decimal from 'decimal.js';

export interface BondingCurveConfig {
  slope: string;
  startingPrice: string;
  curveType: 'linear' | 'exponential';
}

export const defaultCurveConfig: BondingCurveConfig = {
  slope: '2',
  startingPrice: '1',
  curveType: 'linear',
};

export function calculatePrice(
  supply: number | string,
  curveConfig: BondingCurveConfig = defaultCurveConfig,
): string {
  const slope = new Decimal(curveConfig.slope);
  const startingPrice = new Decimal(curveConfig.startingPrice);
  const supplyBN = new Decimal(supply);

  if (curveConfig.curveType === 'linear') {
    return slope.times(supplyBN).plus(startingPrice).toString();
  } else if (curveConfig.curveType === 'exponential') {
    return startingPrice.times(supplyBN.pow(slope)).toString();
  } else {
    throw new Error('Invalid curve type');
  }
}

export function calculateBuyPrice(
  amount: string,
  supply: string,
  curveConfig: BondingCurveConfig = defaultCurveConfig,
): string {
  const slopeBN = new Decimal(curveConfig.slope);
  const startingPriceBN = new Decimal(curveConfig.startingPrice);

  const amountBN = new Decimal(amount);
  const supplyBN = new Decimal(supply);
  const newSupplyBN = supplyBN.plus(amountBN);

  if (amountBN.lte(0)) {
    throw new Error('Amount cannot be zero or negative');
  }
  if (supplyBN.lt(0)) {
    throw new Error('Supply cannot be negative');
  }

  if (curveConfig.curveType === 'linear') {
    return slopeBN
      .times(newSupplyBN.pow(2).minus(supplyBN.pow(2)))
      .div(2)
      .plus(startingPriceBN.times(amountBN))
      .toString();
  } else if (curveConfig.curveType === 'exponential') {
    return startingPriceBN
      .times(
        newSupplyBN.pow(slopeBN.plus(1)).minus(supplyBN.pow(slopeBN.plus(1))),
      )
      .div(slopeBN.plus(1))
      .toString();
  } else {
    throw new Error('Invalid curve type');
  }
}

export function calculateSellPrice(
  amount: string,
  supply: string,
  curveConfig: BondingCurveConfig = defaultCurveConfig,
): string {
  const slope = new Decimal(curveConfig.slope);
  const startingPrice = new Decimal(curveConfig.startingPrice);

  const amountBN = new Decimal(amount);
  const supplyBN = new Decimal(supply);
  const newSupplyBN = supplyBN.minus(amountBN);
  if (supplyBN.lt(0)) {
    throw new Error('Supply cannot be negative');
  }
  if (amountBN.lte(0)) {
    throw new Error('Amount cannot be zero or negative');
  }
  if (amountBN.gt(supplyBN)) {
    throw new Error('Cannot sell more than supply');
  }
  if (curveConfig.curveType === 'linear') {
    return slope
      .times(supplyBN.pow(2).minus(newSupplyBN.pow(2)))
      .div(2)
      .plus(startingPrice.times(amountBN))
      .toString();
  } else if (curveConfig.curveType === 'exponential') {
    return startingPrice
      .times(supplyBN.pow(slope.plus(1)).minus(newSupplyBN.pow(slope.plus(1))))
      .div(slope.plus(1))
      .toString();
  } else {
    throw new Error('Invalid curve type');
  }
}
