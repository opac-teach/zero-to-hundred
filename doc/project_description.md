# Zero To Hundred

This is a memecoin platform, where users can create and buy/sell memecoins.

 
Users can earn ZTH (the platform's native currency) by creating memecoins, strategically buying trending coins, and selling them at optimal times. A user's ZTH balance serves as their score on the platform's leaderboard.

> This wil be a reference implementation for a student project. The project specification and the technologies used are part of what they have to learn. Every student will have to develop their own whole project and will not have access to the code of this repository.

While the website and features will be looking like a web3 project, everything will happen offchain. It is a training project for students, and blockchain is not in the list of skills to learn. 
All the token system and transactions will be handled by the server in a relational database. 

The code of the application should be of a good quality, but not too difficult to understand, so parts of it can be shown to students. 
It is not needed to handle complex edge cases and security protections. 

# Features

## Users

Users can signup to the platform, see all the existing memecoins, all users profiles, see the memecoins they own in their wallet and create a memecoin.

Users can edit a public profile page, containing a username, a profile picture, a banner, a description and some other funny things like customizing the look of their page (background color, text color ...). 

Their profile could be randomly generated at signup.

The page should show stats about the user, like their balances, number of trades, metrics about their trading performances.

At onboarding, explain shortly but clearly what the users can do, then propose them to create a memecoin or see the existing meme coins.

## Memecoins

Memecoins are coins created by users. 

Each memecoins has:
- Name
- Ticker
- Description
- Logo

ZTH is not a memecoin, it is stored as a value for a user. 
When a user signup, it gets 100 ZTH.

## Wallets

Each user has a single wallet that can hold multiple types of memecoins. The wallet tracks the balance of each memecoin type the user owns.

## Trading Mechanism

The platform implements an automated market maker system using a bonding curve model for each memecoin. This creates a self-sustaining economy where price is determined by supply and demand without requiring traditional order books.

### Bonding Curve Mechanics
1. Creation: When a user creates a new memecoin, they define its basic properties (name, ticker, description, logo). Creation costs 1 ZTH to prevent spam creation of memecoins.

2. Price Determination: Each memecoin's price is determined by a mathematical bonding curve function that establishes a relationship between the coin's supply and its price.
- As more tokens are purchased (supply increases), the price rises
- As tokens are sold back (supply decreases), the price falls
- The specific curve formula will be a simple polynomial function: Price = (Supply)²/10000

3. Reserve Pool: When users buy a memecoin, their ZTH payment goes into a reserve pool specific to that memecoin. This reserve serves as the liquidity source to pay users who sell their tokens.
- The reserve pool is always sufficient to buy back all existing tokens at their respective prices according to the bonding curve
- The system maintains this mathematical relationship automatically

4. Buying Process:
- When a user buys a memecoin, they specify the amount of ZTH they want to spend
- The system calculates how many tokens they receive based on the current position on the bonding curve
- The price per token increases slightly with each purchase
- The spent ZTH enters the memecoin's reserve pool

5. Selling Process:
- When a user sells a memecoin, they specify the number of tokens they want to sell
- The system calculates the ZTH they receive based on the current position on the bonding curve
- The price per token decreases slightly with each sale
- The received ZTH comes from the memecoin's reserve pool

6. No Transaction Fees: To keep the system simple, there are no transaction fees for buying or selling memecoins. The only "cost" is the natural slippage that occurs when trading on the bonding curve.
7. Market Sentiment: The platform calculates and displays market sentiment for each memecoin based on recent trading activity:
- Positive: More buys than sells in the last 24 hours
- Neutral: Roughly equal buys and sells
- Negative: More sells than buys in the last 24 hours

8. Trading Volume: The platform tracks and displays the total ZTH volume traded for each memecoin over various time periods (24h, 7d, 30d).
This bonding curve model creates a simple yet engaging economic system where early adopters of popular memecoins can profit as more users buy in, while ensuring there's always liquidity for sellers. The mechanism encourages strategic thinking about when to buy and sell different memecoins, adding depth to the gameplay without requiring complex trading knowledge.

9. Handling price changes
When a user asks to buy or sell a token, the price can change between the time it saw the price and the moment the transaction is executed. A slippage tolerance must be provided to either accept or reject the trade at execution time. 

# General technical specifications

Error handling must be properly done, like API error, input validation, both in the frontend and in the backend.

All of the data must be accessible with a REST API, but things like token price shoud be updated regularly on the frontend. (no websocket)

# Frontend

The frontend must be developed using VueJS in Typescript.

Styling must be done using tailwind, using shadcn/vue components.

The frontend must use only client-side rendering, so it should not use Nuxt.

State management must be managed with pinia.

The app should look modern, like a funny web3 degen website.

It should incorporate dynamic elements such as animated background, moving elements, color animations, ...

## Pages

Every page should have a top navigation bar with a drop down on the top right to login or access user pages, and show the user's ZTH balance.

### Landing page

The landing page should feature an eye-catching introduction to the platform, explaining the concept of memecoins, how to get started, and highlighting key features with engaging visuals.


### Sign-in/Sign-up

Should also be fun, with jokes in the form. 

*The following pages are only accessible by logged-in users*

### Dashboard

Show a list of all the memecoins existing on the platform, a button to buy, with their price and some nice stats like how many times traded, market sentiment...

### Leaderboard

Display all users sorted by their ZTH balance, biggest first. 

### Wallet

Show the list of the memecoin owned by the user, with buttons to sell them. 

# Backend

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

# Deployment

All parts of the app must run inside docker containers, be easily deployable to a cloud.
The whole app should be easilly locally runnable via docker compose. 

We don't consider backup management, the project will be run locally. 
There should be a github action to build the necessary containers. 