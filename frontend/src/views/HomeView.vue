<script setup lang="ts">
import { RocketLaunchIcon, ChartBarIcon, TrophyIcon } from "@heroicons/vue/24/outline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
</script>

<template>
  <div class="relative">
    <!-- Hero section -->
    <div class="relative overflow-hidden">
      <!-- Background animation -->
      <div
        class="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient"
      >
        <div class="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <!-- Content -->
      <div class="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            gm, ser
          </h1>
          <p class="mt-6 text-xl text-gray-100 max-w-3xl mx-auto">
            The ultimate memecoin platform where you can create, trade, and earn ZTH tokens. Join
            the revolution and start your journey to the moon! 🚀
          </p>
          <div class="mt-10 flex justify-center gap-4">
            <router-link to="/create-memecoin">
              <Button variant="secondary" size="lg"> Get Started </Button>
            </router-link>
            <router-link to="/memecoins">
              <Button size="lg"> Explore Market </Button>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- About section -->
    <div class="py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            About Zero to Hundred
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Revolutionizing the memecoin ecosystem with innovative trading mechanics and a vibrant
            community.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                We're on a mission to democratize memecoin trading and creation, making it
                accessible to everyone. Our platform combines cutting-edge technology with
                user-friendly interfaces to create a seamless trading experience.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
              <CardDescription>
                We envision a future where anyone can participate in the memecoin revolution,
                regardless of their technical expertise. Through our innovative bonding curve model
                and community-driven approach, we're building the future of decentralized finance.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card class="mb-16">
          <CardHeader>
            <CardTitle class="text-center">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="text-center">
                <div
                  class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <rocket-launch-icon class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Easy Creation
                </h4>
                <p class="text-gray-600 dark:text-gray-400">
                  Create your own memecoin with just a few clicks
                </p>
              </div>
              <div class="text-center">
                <div
                  class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <chart-bar-icon class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Fair Trading</h4>
                <p class="text-gray-600 dark:text-gray-400">
                  Transparent and fair trading mechanics
                </p>
              </div>
              <div class="text-center">
                <div
                  class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <trophy-icon class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Community Driven
                </h4>
                <p class="text-gray-600 dark:text-gray-400">
                  Active community and competitive leaderboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <Separator class="my-8" />

    <!-- Features section -->
    <div class="py-24 bg-white dark:bg-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Why Choose Zero to Hundred?
          </h2>
          <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Everything you need to succeed in the memecoin world
          </p>
        </div>

        <div class="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent class="pt-6">
              <div class="text-center">
                <div
                  class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white"
                >
                  <rocket-launch-icon class="h-6 w-6" />
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Create Your Own Memecoin
                </h3>
                <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Launch your own memecoin with just a few clicks. No coding required!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="pt-6">
              <div class="text-center">
                <div
                  class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white"
                >
                  <chart-bar-icon class="h-6 w-6" />
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Trade with Confidence
                </h3>
                <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Our bonding curve model ensures fair prices and liquidity for all trades.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent class="pt-6">
              <div class="text-center">
                <div
                  class="inline-flex items-center justify-center w-12 h-12 rounded-md bg-indigo-500 text-white"
                >
                  <trophy-icon class="h-6 w-6" />
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Compete on the Leaderboard
                </h3>
                <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Show off your trading skills and climb the ranks to become the top trader.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <Separator class="my-8" />

    <!-- How it works section -->
    <div class="py-24 bg-gray-50 dark:bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            How It Works
          </h2>
          <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">Simple steps to get started</p>
        </div>

        <div class="mt-20">
          <div class="relative">
            <!-- Steps -->
            <div class="space-y-12">
              <div class="relative">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div
                      class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white"
                    >
                      1
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      Create an Account
                    </h3>
                    <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Sign up and receive 100 ZTH tokens to start your journey.
                    </p>
                  </div>
                </div>
              </div>

              <div class="relative">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div
                      class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white"
                    >
                      2
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      Create or Trade Memecoins
                    </h3>
                    <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Create your own memecoin or trade existing ones in the market.
                    </p>
                  </div>
                </div>
              </div>

              <div class="relative">
                <div class="flex items-center">
                  <div class="shrink-0">
                    <div
                      class="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white"
                    >
                      3
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                      Earn and Compete
                    </h3>
                    <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Grow your ZTH balance and compete for the top spot on the leaderboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
