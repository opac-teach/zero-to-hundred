# Bonding Curve Algorithm

## Overview

The Zero to Hundred platform uses a bonding curve algorithm to determine the price of memecoins. A bonding curve is a mathematical curve that defines the relationship between a token's price and its supply. As the supply increases, the price increases according to a predefined formula.

## Formula

We use a quadratic bonding curve with the following formula:

```
Price = (Supply)² / 10000
```

Where:
- `Price` is the current price of the memecoin in ZTH
- `Supply` is the total number of tokens in circulation

## How It Works

### Buying Tokens

When a user buys tokens with ZTH:

1. The current price is calculated based on the current supply
2. The amount of tokens the user receives is calculated as: `ZTH Amount / Current Price`
3. These tokens are added to the total supply
4. The new price is higher due to the increased supply

### Selling Tokens

When a user sells tokens for ZTH:

1. The current price is calculated based on the current supply
2. The tokens are removed from the total supply
3. The new price is calculated based on the reduced supply
4. The user receives: `Token Amount * New Price` in ZTH

## Price Impact and Slippage

### Price Impact

The price impact refers to how much a trade affects the token price. Larger trades have a more significant impact on the price:

- Small purchases/sales: Minimal price change
- Large purchases/sales: Significant price change

### Slippage

Slippage occurs when the price changes between the time a transaction is submitted and when it is executed. Our implementation includes slippage protection:

1. The expected price is calculated before the trade
2. After calculating the new supply, the new price is determined
3. If the price difference exceeds the user's slippage tolerance, the transaction is rejected

## Benefits of the Bonding Curve

1. **Automatic Price Discovery**: The price is determined by market activity rather than arbitrary decisions
2. **Liquidity**: Users can always buy and sell tokens as long as they have the required assets
3. **Predictable Price Movement**: The price follows a mathematical formula, making it more predictable
4. **No Order Book Required**: Trades execute directly against the curve, not against other users' orders

## Example Scenarios

### New Memecoin

A new memecoin starts with a supply of 100 tokens:
- Initial price = (100)² / 10000 = 1 ZTH

### Small Purchase

A user spends 10 ZTH to buy tokens:
- Current price = 1 ZTH
- Tokens received = 10 / 1 = 10 tokens
- New supply = 110 tokens
- New price = (110)² / 10000 = 1.21 ZTH
- Price increased by 21%

### Large Purchase

A user spends 1000 ZTH to buy tokens:
- Current price = 1 ZTH
- Tokens received = 1000 / 1 = 1000 tokens
- New supply = 1100 tokens
- New price = (1100)² / 10000 = 121 ZTH
- Price increased by 12,000%

### Small Sale

A user sells 10 tokens:
- Current price = 1 ZTH
- New supply = 90 tokens
- New price = (90)² / 10000 = 0.81 ZTH
- ZTH received = 10 * 0.81 = 8.1 ZTH
- Price decreased by 19%

## Implementation Details

The bonding curve algorithm is implemented in the `TradingService` class:

```typescript
private calculatePrice(supply: number): number {
  return Math.pow(supply, 2) / 10000;
}
```

This method is used in both the `buyMemecoin` and `sellMemecoin` methods to calculate prices before and after trades. 