<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
      <div class="flex items-center space-x-4 w-full sm:w-auto">
        <select
          v-model="timeframe"
          class="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>
    </div>

    <!-- Top 3 -->
    <div class="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-12">
      <!-- Second Place -->
      <div v-if="topTraders[1]" class="relative transform hover:scale-105 transition-transform duration-200">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div class="bg-gray-300 dark:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center">
              <span class="text-gray-700 dark:text-gray-300 font-bold">2</span>
            </div>
          </div>
          <img
            :src="topTraders[1].profilePictureUrl || ''"
            :alt="topTraders[1].username"
            class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-300 dark:border-gray-600"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ topTraders[1].username }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ topTraders[1].fullName || 'No name set' }}
          </p>
          <div class="mt-4">
            <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ topTraders[1].balance.toLocaleString() }} ZTH
            </span>
          </div>
        </div>
      </div>

      <!-- First Place -->
      <div v-if="topTraders[0]" class="relative transform hover:scale-105 transition-transform duration-200">
        <div class="bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-lg p-6 text-center transform scale-105">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div class="bg-yellow-500 rounded-full w-8 h-8 flex items-center justify-center">
              <span class="text-white font-bold">1</span>
            </div>
          </div>
          <img
            :src="topTraders[0].profilePictureUrl || ''"
            :alt="topTraders[0].username"
            class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-yellow-500"
          />
          <h3 class="text-xl font-medium text-gray-900 dark:text-white">
            {{ topTraders[0].username }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ topTraders[0].fullName || 'No name set' }}
          </p>
          <div class="mt-4">
            <span class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {{ topTraders[0].balance.toLocaleString() }} ZTH
            </span>
          </div>
        </div>
      </div>

      <!-- Third Place -->
      <div v-if="topTraders[2]" class="relative transform hover:scale-105 transition-transform duration-200">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div class="bg-amber-600 rounded-full w-8 h-8 flex items-center justify-center">
              <span class="text-white font-bold">3</span>
            </div>
          </div>
          <img
            :src="topTraders[2].profilePictureUrl || ''"
            :alt="topTraders[2].username"
            class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-amber-600"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ topTraders[2].username }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ topTraders[2].fullName || 'No name set' }}
          </p>
          <div class="mt-4">
            <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ topTraders[2].balance.toLocaleString() }} ZTH
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Rest of the Leaderboard -->
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Balance
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Profile
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(trader, index) in traders.slice(3)" :key="trader.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ index + 4 }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="trader.profilePictureUrl || ''" :alt="trader.username" class="h-10 w-10 rounded-full" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ trader.username }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ trader.fullName || 'No name set' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ trader.balance.toLocaleString() }} ZTH</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <router-link :to="`/profile/${trader.id}`" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                  View Profile
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { users } from '@/api/client';
import { useToast } from 'vue-toastification';
import type { UserResponseDto, LeaderboardResponse } from '@/types/api';

interface Trader extends UserResponseDto {
  balance: number;
}

const userStore = useUserStore();
const toast = useToast();
const timeframe = ref('24h');

const traders = ref<Trader[]>([]);
const topTraders = computed(() => {
  if (!Array.isArray(traders.value)) return [];
  return traders.value.slice(0, 3);
});

// Fetch leaderboard data
async function fetchLeaderboard() {
  try {
    const response = await users.getLeaderboard(1, 100); // Get top 100 traders
    const leaderboardData = response.data as LeaderboardResponse;
    
    if (leaderboardData && Array.isArray(leaderboardData.users)) {
      traders.value = leaderboardData.users.map(user => ({
        ...user,
        balance: user.zthBalance
      })) as Trader[];
    } else {
      traders.value = [];
      console.error('Invalid response format from leaderboard API');
    }
  } catch (error: any) {
    traders.value = [];
    toast.error(error.message || 'Failed to fetch leaderboard data');
  }
}

// Initial fetch
onMounted(fetchLeaderboard);

// Watch for timeframe changes
watch(timeframe, fetchLeaderboard);
</script> 