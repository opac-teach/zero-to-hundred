# Trading Module

The Trading Module provides functionality for buying and selling memecoins on the Zero to Hundred platform. It implements a bonding curve algorithm for price determination, ensuring that prices are determined by market dynamics.

## Components

### DTOs (Data Transfer Objects)

- **BuyMemecoinDto**: Validates input for buying memecoins
  - `memecoinId`: ID of the memecoin to buy
  - `amount`: Amount of ZTH to spend
  - `slippageTolerance`: Optional tolerance for price slippage (default: 1%)

- **SellMemecoinDto**: Validates input for selling memecoins
  - `memecoinId`: ID of the memecoin to sell
  - `amount`: Amount of memecoin tokens to sell
  - `slippageTolerance`: Optional tolerance for price slippage (default: 1%)

- **TradeResponseDto**: Response format for trade operations
  - Contains transaction details, price information, and updated balances

### Service

The `TradingService` handles the business logic for trading operations:

- **buyMemecoin**: Allows users to buy memecoins with ZTH
  - Calculates token amount based on current price
  - Updates wallet balance, memecoin supply, and holdings
  - Creates transaction records

- **sellMemecoin**: Allows users to sell memecoins for ZTH
  - Calculates ZTH amount based on current price
  - Updates wallet balance, memecoin supply, and holdings
  - Creates transaction records

### Controller

The `TradingController` exposes REST endpoints for trading operations:

- **POST /trading/buy**: Endpoint for buying memecoins
  - Requires authentication
  - Accepts `BuyMemecoinDto` in request body
  - Returns `TradeResponseDto`

- **POST /trading/sell**: Endpoint for selling memecoins
  - Requires authentication
  - Accepts `SellMemecoinDto` in request body
  - Returns `TradeResponseDto`

## Bonding Curve Algorithm

The module implements a quadratic bonding curve for price determination:

```
Price = (Supply)² / 10000
```

This formula ensures that:
- Price increases as supply increases (when users buy)
- Price decreases as supply decreases (when users sell)
- The rate of price change is proportional to the supply

## Slippage Protection

To protect users from unexpected price changes during high-volume trading, the module implements slippage protection:

1. The current price is calculated before the trade
2. The expected trade value is calculated
3. After the trade would affect supply, the new price is calculated
4. If the price difference exceeds the user's slippage tolerance, the transaction is rejected

## Usage Example

```typescript
// Buy memecoins
const buyDto = new BuyMemecoinDto();
buyDto.memecoinId = 'memecoin-id';
buyDto.amount = 10; // Spend 10 ZTH
buyDto.slippageTolerance = 0.5; // 0.5% tolerance

const buyResponse = await tradingService.buyMemecoin(userId, buyDto);

// Sell memecoins
const sellDto = new SellMemecoinDto();
sellDto.memecoinId = 'memecoin-id';
sellDto.amount = 100; // Sell 100 tokens
sellDto.slippageTolerance = 0.5; // 0.5% tolerance

const sellResponse = await tradingService.sellMemecoin(userId, sellDto);
```

## Testing

The module includes comprehensive unit tests and end-to-end tests to ensure reliability:

- Unit tests for DTOs, service, and controller
- End-to-end tests for API endpoints
- Tests for edge cases like insufficient balance, slippage exceeding tolerance, etc. 