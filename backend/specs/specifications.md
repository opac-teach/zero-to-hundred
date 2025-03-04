# Technical Specifications for Zero to Hundred Backend

The backend must be developped with NestJS and in Typescript

The database must be PostgreSQL using TypeORM.
It will expose a HTTP REST API that the frontend will use to communicate.  
The server must export OpenAPI definitions and expose a swagger interface. 
Migration should be used when updating data models, to be able to easily update existing database. 
The app should log most of important actions, with different levels and configurable output. 

## Authentication

There should be an user/password authorization system. It should be basic but secured, with standard flow like sign-up/login/forget password and can use state of the art libraries.

All sensitive routes must be only accessible by who should have access to. 

User profiles and Memecoin list and prices can be publicly accessible, but routes like getting wallet balance should be authenticated. 
The controllers must guarantee that the user asking for something is allowed to do it, like selling a memecoin. 

## Safe concurrency

The backend service must be resilient if executed concurrently, like with resource scaling, threading, or micro-services. As a starting point, he server must be built in a monolithic fashion in a single instance, but should be already scalable. 

This means for instance, using database transactions while executing multiple read/write that are sensible to concurrency, like updating balances when buying memecoins. 

## Tests

There must exist proper unit tests for each part of the backend software, like API routes, middleware, entities, and providers.

It should be easy to run the tests locally and by a CI. Github actions should be defined to test the app. 

## Deployment

All parts of the app must run inside docker containers, be easily deployable to a cloud.
The whole app should be easilly locally runnable via docker compose. 

We don't consider backup management, the project will be run locally. 
There should be a github action to build the necessary containers. 

# Data Models

### User
- `id`: UUID (Primary Key)
- `username`: String (unique)
- `email`: String (unique)
- `password`: String (hashed)
- `fullName`: String (optional)
- `profilePictureUrl`: String (URL, optional)
- `bannerUrl`: String (URL, optional)
- `description`: String (optional)
- `backgroundColor`: String (hex color, default: #f5f5f5)
- `textColor`: String (hex color, default: #333333)
- `isActive`: Boolean (default: true)
- `role`: String (default: 'user')
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Memecoin
- `id`: UUID (Primary Key)
- `name`: String
- `ticker`: String (unique)
- `description`: String
- `logo`: String (URL)
- `creatorId`: UUID (Foreign Key to User)
- `supply`: Decimal (default: 0)
- `reserveBalance`: Decimal (default: 0)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Wallet
- `id`: UUID (Primary Key)
- `zthBalance`: Decimal (precision: 18, scale: 8, default: 100)
- `ownerId`: UUID (Foreign Key to User)
- `isActive`: Boolean (default: true)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### WalletHolding
- `id`: UUID (Primary Key)
- `walletId`: UUID (Foreign Key to Wallet)
- `memecoinId`: UUID (Foreign Key to Memecoin)
- `amount`: Decimal (number of tokens held)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Transaction
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key to User)
- `memecoinId`: UUID (Foreign Key to Memecoin)
- `type`: Enum ('BUY', 'SELL', 'CREATE')
- `amount`: Decimal (number of tokens)
- `zthAmount`: Decimal (ZTH spent or received)
- `pricePerToken`: Decimal
- `timestamp`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

## API Endpoints

### Authentication
- `POST /api/auth/register`
  - Description: Register a new user
  - Request Body:
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```
  - Response: User object (without password)

- `POST /api/auth/login`
  - Description: Login a user
  - Request Body:
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
  - Response: JWT token and user object

- `POST /api/auth/forgot-password`
  - Description: Request password reset
  - Request Body:
    ```json
    {
      "email": "string"
    }
    ```
  - Response: Success message

- `POST /api/auth/reset-password`
  - Description: Reset password with token
  - Request Body:
    ```json
    {
      "token": "string",
      "newPassword": "string"
    }
    ```
  - Response: Success message

### Users
- `GET /api/users`
  - Description: Get all users (for leaderboard)
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 20)
    - `sortBy`: string (default: "wallet.zthBalance")
    - `order`: string (default: "DESC")
  - Response: Array of user objects with pagination metadata

- `GET /api/users/:id`
  - Description: Get user by ID
  - Response: User object

- `GET /api/users/me`
  - Description: Get current user profile
  - Authentication: Required
  - Response: User object

- `PUT /api/users/me`
  - Description: Update current user profile
  - Authentication: Required
  - Request Body:
    ```json
    {
      "username": "string",
      "profilePicture": "string",
      "banner": "string",
      "description": "string",
      "pageSettings": {
        "backgroundColor": "string",
        "textColor": "string",
        "accentColor": "string"
      }
    }
    ```
  - Response: Updated user object

### Memecoins
- `GET /api/memecoins`
  - Description: Get all memecoins
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 20)
    - `sortBy`: string (default: "createdAt")
    - `order`: string (default: "DESC")
  - Response: Array of memecoin objects with pagination metadata

- `GET /api/memecoins/:id`
  - Description: Get memecoin by ID
  - Response: Memecoin object with current price and market sentiment

- `POST /api/memecoins`
  - Description: Create a new memecoin (costs 1 ZTH to prevent spam)
  - Authentication: Required
  - Request Body:
    ```json
    {
      "name": "string",
      "ticker": "string",
      "description": "string",
      "logo": "string"
    }
    ```
  - Response: Created memecoin object with updated user ZTH balance

- `GET /api/memecoins/:id/price`
  - Description: Get current price of a memecoin
  - Response:
    ```json
    {
      "price": "decimal",
      "supply": "decimal",
      "marketSentiment": "string" // "POSITIVE", "NEUTRAL", "NEGATIVE"
    }
    ```

- `GET /api/memecoins/:id/transactions`
  - Description: Get transaction history for a memecoin
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 20)
    - `timeframe`: string (default: "24h", options: "24h", "7d", "30d", "all")
  - Response: Array of transaction objects with pagination metadata

### Wallet
- `GET /api/wallet`
  - Description: Get current user's wallet
  - Authentication: Required
  - Response: Wallet object with holdings and ZTH balance

- `GET /api/wallet/transactions`
  - Description: Get current user's transaction history
  - Authentication: Required
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 20)
    - `type`: string (optional, "BUY" or "SELL")
    - `memecoinId`: string (optional)
  - Response: Array of transaction objects with pagination metadata

### Trading
- `POST /api/trading/buy`
  - Description: Buy memecoin tokens
  - Authentication: Required
  - Request Body:
    ```json
    {
      "memecoinId": "string",
      "zthAmount": "decimal",
      "slippageTolerance": "decimal" // percentage (e.g., 0.5 for 0.5%)
    }
    ```
  - Response: Transaction object

- `POST /api/trading/sell`
  - Description: Sell memecoin tokens
  - Authentication: Required
  - Request Body:
    ```json
    {
      "memecoinId": "string",
      "tokenAmount": "decimal",
      "slippageTolerance": "decimal" // percentage (e.g., 0.5 for 0.5%)
    }
    ```
  - Response: Transaction object

### Statistics
- `GET /api/statistics/trading-volume`
  - Description: Get trading volume statistics
  - Query Parameters:
    - `timeframe`: string (default: "24h", options: "24h", "7d", "30d")
    - `memecoinId`: string (optional)
  - Response:
    ```json
    {
      "totalVolume": "decimal",
      "buyVolume": "decimal",
      "sellVolume": "decimal",
      "memecoins": [
        {
          "id": "string",
          "ticker": "string",
          "volume": "decimal"
        }
      ]
    }
    ```

- `GET /api/statistics/leaderboard`
  - Description: Get user leaderboard
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 20)
  - Response: Array of user objects sorted by ZTH balance with pagination metadata
