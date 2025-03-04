# Technical Specifications for Zero to Hundred Backend Frontend

The frontend must be developed using VueJS in Typescript.

Styling must be done using tailwind, using shadcn/vue components.

The frontend must use only client-side rendering, so it should not use Nuxt.

State management must be managed with pinia.

The app should look modern, like a funny web3 degen website.

It should incorporate dynamic elements such as animated background, moving elements, color animations, ...

## Responsive Design

The application should follow a mobile-first approach, ensuring all features are accessible and usable on both mobile devices and desktop computers. The UI should adapt smoothly to different screen sizes with appropriate breakpoints.

## Loading & Error States

- Loading states should be indicated using skeleton loaders for content and spinning animations for actions
- Error messages should be displayed using toast notifications for temporary errors
- Form validation errors should be shown inline below the respective fields
- Network errors should show a banner at the top of the page with retry options

## Charts and Data Visualization

- Price charts should be implemented using Chart.js or TradingView's lightweight charts
- Historical price data should be visualized with candlestick charts for different time periods (24h, 7d, 30d)
- Trading volume should be displayed as bar charts below price charts

## Pages

Every page should have a top navigation bar with a drop down on the top right to login or access user pages, and show the user's ZTH balance.

### Landing page

The landing page should feature an eye-catching introduction to the platform, explaining the concept of memecoins, how to get started, and highlighting key features with engaging visuals.

### Sign-in/Sign-up

Should also be fun, with jokes in the form. 

*The following pages are only accessible by logged-in users*

### Dashboard

Show a list of all the memecoins existing on the platform, a button to buy, with their price and some nice stats like how many times traded, market sentiment...

- Include a prominent "Create Memecoin" button
- Display price charts for trending memecoins
- Implement filters for sorting by various metrics (price, volume, sentiment)

### Create Memecoin

A dedicated page for creating new memecoins with:
- Form for entering memecoin details (name, ticker, description)
- Logo upload with preview
- Clear display of the creation cost (1 ZTH)
- Preview of how the memecoin will appear in listings

### Profile Page

User profile page should include:
- Editable username, profile picture, and banner
- Customizable page styling (background color, text color, fonts)
- Trading statistics and achievements
- List of created memecoins
- Recent trading activity
- Performance metrics visualization

### Leaderboard

Display all users sorted by their ZTH balance, biggest first. 
- Include filters for different time periods
- Show user rank changes
- Display key metrics for each user

### Wallet

Show the list of the memecoin owned by the user, with buttons to sell them. 
- Portfolio value over time chart
- Profit/loss calculations for each holding
- Quick buy/sell actions
- Transaction history

## Navigation Structure

The application should implement the following navigation structure:
1. Main navigation bar (top)
   - Logo/Home
   - Dashboard
   - Leaderboard
   - Wallet
   - Create Memecoin
2. User menu (top right)
   - Profile
   - Settings
   - Logout
3. Mobile navigation
   - Hamburger menu for smaller screens
   - Bottom navigation bar for key actions

## Tests

There must exist basic unit tests for each page of the frontend.

It should be easy to run the tests locally and by a CI. Github actions should be defined to test the app. 

Test coverage should include:
- Component rendering
- User interactions
- State management
- Form validations
- API integration
