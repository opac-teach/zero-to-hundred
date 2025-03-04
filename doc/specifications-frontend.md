# Technical Specifications for Zero to Hundred Backend Frontend

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

## Tests

There must exist basic unit tests for each page of the frontend.

It should be easy to run the tests locally and by a CI. Github actions should be defined to test the app. 
