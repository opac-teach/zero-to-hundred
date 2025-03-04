<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Welcome Screen -->
    <div v-if="currentStep === 0" class="text-center space-y-6" data-test="onboarding-step">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
        Welcome to Zero to Hundred! 🚀
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-400">
        Get ready to create, trade, and earn with memecoins!
      </p>
      <div class="mt-8">
        <button
          @click="nextStep"
          class="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-medium"
          data-test="next-button"
        >
          Let's Get Started!
        </button>
      </div>
    </div>

    <!-- Tutorial Steps -->
    <div v-else-if="currentStep < 4" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ steps[currentStep - 1].title }}
        </h2>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          Step {{ currentStep }} of 3
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6" data-test="onboarding-step">
        <div class="flex items-center justify-center mb-6">
          <component
            :is="steps[currentStep - 1].icon"
            class="w-16 h-16 text-indigo-600 dark:text-indigo-400"
          />
        </div>
        <p class="text-lg text-gray-600 dark:text-gray-400 text-center">
          {{ steps[currentStep - 1].description }}
        </p>
      </div>

      <div class="flex justify-between">
        <button
          v-if="currentStep > 1"
          @click="previousStep"
          class="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          data-test="back-button"
        >
          Back
        </button>
        <button
          @click="nextStep"
          class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ml-auto"
          :disabled="currentStep === 3"
          data-test="next-button"
        >
          {{ currentStep === 3 ? 'Finish' : 'Next' }}
        </button>
      </div>
    </div>

    <!-- Action Choice -->
    <div v-else class="space-y-6" data-test="onboarding-step">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center">
        Ready to Start Your Journey?
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          to="/create-memecoin"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          data-test="create-memecoin-link"
        >
          <div class="text-center">
            <rocket-launch-icon class="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Create Your First Memecoin
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Launch your own memecoin and start your journey to the moon! 🚀
            </p>
          </div>
        </router-link>

        <router-link
          to="/memecoins"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          data-test="explore-market-link"
        >
          <div class="text-center">
            <chart-bar-icon class="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Explore the Market
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Browse existing memecoins and start trading! 📈
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useUIStore } from '@/stores/ui';
import {
  RocketLaunchIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
} from '@heroicons/vue/24/outline';

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();
const currentStep = ref(0);

const steps = [
  {
    title: 'Create Memecoins',
    description: 'Launch your own memecoin with just a few clicks. Set the name, symbol, and description to make it unique!',
    icon: RocketLaunchIcon,
  },
  {
    title: 'Trade & Earn',
    description: 'Buy and sell memecoins using our bonding curve model. Early adopters can earn more as the price increases!',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Compete & Win',
    description: 'Show off your trading skills on the leaderboard. The more ZTH you earn, the higher you climb!',
    icon: TrophyIcon,
  },
];

async function nextStep() {
  if (currentStep.value < 4) {
    currentStep.value++;
    if (currentStep.value === 4) {
      // Mark onboarding as completed when reaching the final step
      try {
        uiStore.setHasCompletedOnboarding(true);
        // Navigate to market page after completing onboarding
        router.push({ name: 'market' });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    }
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}
</script> 