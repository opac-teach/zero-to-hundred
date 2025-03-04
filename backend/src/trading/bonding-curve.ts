import BigNumber from 'bignumber.js';

/**
 * Calculates the price of a memecoin based on its supply using a linear pricing mechanism.
 * The formula is: Price = m * Supply + b
 * Where:
 * - m is the slope coefficient (0.0001)
 * - b is the starting price (1 USDC)
 * @param supply The current supply of the memecoin
 * @returns The calculated price as a string to maintain precision
 */
export function calculatePrice(supply: number | string): string {
  const slope = new BigNumber('0.0001'); // m coefficient
  const startingPrice = new BigNumber('1'); // b coefficient (1 USDC)
  const supplyBN = new BigNumber(supply);

  return slope.times(supplyBN).plus(startingPrice).toString();
}
