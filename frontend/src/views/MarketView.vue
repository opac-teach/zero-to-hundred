<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Memecoin Market</h1>
      <div class="flex items-center space-x-4 w-full sm:w-auto">
        <div class="relative flex-1 sm:flex-none">
          <input
            type="text"
            placeholder="Search memecoins..."
            class="w-full sm:w-64 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 pl-10"
          />
          <magnifying-glass-icon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <select
          v-model="sortBy"
          class="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="createdAt">Created Date</option>
          <option value="name">Name</option>
          <option value="symbol">Symbol</option>
          <option value="totalSupply">Total Supply</option>
        </select>
        <button
          @click="sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC'"
          class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <arrow-up-icon v-if="sortOrder === 'ASC'" class="h-5 w-5" />
          <arrow-down-icon v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Market Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Market Cap</h3>
        <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ totalMarketCap }} ZTH
        </p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Volume</h3>
        <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ totalVolume24h }} ZTH
        </p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Memecoins</h3>
        <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
          {{ activeMemecoins }}
        </p>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Market Sentiment</h3>
        <p class="mt-2 text-2xl font-semibold" :class="marketSentimentClass">
          {{ marketSentiment }}
        </p>
      </div>
    </div>

    <!-- Memecoin List -->
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Memecoin
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                24h Change
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Market Cap
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                24h Volume
              </th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="memecoin in sortedMemecoins" :key="memecoin.id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img :src="memecoin.logoUrl" :alt="memecoin.name" class="h-10 w-10 rounded-full" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ memecoin.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ memecoin.symbol }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ memecoin.currentPrice.toFixed(6) }} ZTH</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getPriceChange(memecoin).startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                ]">
                  {{ getPriceChange(memecoin) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ memecoin.marketCap.toLocaleString() }} ZTH
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ memecoin.volume24h.toLocaleString() }} ZTH
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                  Trade
                </button>
                <button class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="selectedMemecoin" class="mt-8 space-y-8">
      <!-- Price Chart -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ selectedMemecoin.name }} Price Chart
          </h3>
          <div class="flex space-x-2">
            <button
              v-for="timeframe in timeframes"
              :key="timeframe"
              @click="selectedTimeframe = timeframe"
              class="px-3 py-1 text-sm rounded-md"
              :class="selectedTimeframe === timeframe ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
            >
              {{ timeframe }}
            </button>
          </div>
        </div>
        <div class="h-96">
          <price-chart
            :data="priceData"
            :timeframe="selectedTimeframe"
          />
        </div>
      </div>

      <!-- Volume Chart -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Trading Volume
        </h3>
        <div class="h-48">
          <volume-chart
            :data="volumeData"
            :timeframe="selectedTimeframe"
          />
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <div v-if="selectedMemecoin" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Trade {{ selectedMemecoin.name }}
          </h3>
          <button
            @click="selectedMemecoin = null"
            class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <x-mark-icon class="h-6 w-6" />
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (ZTH)
            </label>
            <input
              v-model="tradeAmount"
              type="number"
              min="0"
              step="0.000001"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slippage Tolerance (%)
            </label>
            <input
              v-model="slippageTolerance"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="selectedMemecoin = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              @click="handleTrade"
              :disabled="!tradeAmount || isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Processing...' : 'Confirm Trade' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useMarketStore } from '@/stores/market';
import { useWalletStore } from '@/stores/wallet';
import { useToast } from 'vue-toastification';
import PriceChart from '@/components/PriceChart.vue';
import VolumeChart from '@/components/VolumeChart.vue';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline';
import type { Memecoin } from '@/types/api';

const marketStore = useMarketStore();
const walletStore = useWalletStore();
const toast = useToast();

const sortBy = ref<'createdAt' | 'name' | 'symbol' | 'totalSupply'>('createdAt');
const sortOrder = ref<'ASC' | 'DESC'>('DESC');
const selectedMemecoin = ref<Memecoin | null>(null);
const tradeAmount = ref<string>('');
const slippageTolerance = ref<string>('1');
const isLoading = ref(false);
const selectedTimeframe = ref<'24h' | '7d' | '30d'>('24h');
const timeframes = ['24h', '7d', '30d'] as const;

// Mock data for charts (replace with real data from API)
const priceData = ref([
  { timestamp: '2024-03-01T00:00:00Z', open: 0.0001, high: 0.0002, low: 0.00005, close: 0.00015, volume: 1000 },
  { timestamp: '2024-03-01T01:00:00Z', open: 0.00015, high: 0.00025, low: 0.0001, close: 0.0002, volume: 1500 },
  // Add more data points...
]);

const volumeData = ref([
  { timestamp: '2024-03-01T00:00:00Z', volume: 1000 },
  { timestamp: '2024-03-01T01:00:00Z', volume: 1500 },
  // Add more data points...
]);

// Fetch data on mount
onMounted(async () => {
  try {
    await marketStore.fetchMemecoins({
      sortBy: sortBy.value,
      order: sortOrder.value
    });
    marketStore.startPriceUpdates();
  } catch (error: any) {
    toast.error(error.message || 'Failed to fetch market data');
  }
});

// Watch for sort changes
watch([sortBy, sortOrder], async () => {
  try {
    await marketStore.fetchMemecoins({
      sortBy: sortBy.value,
      order: sortOrder.value
    });
  } catch (error: any) {
    toast.error(error.message || 'Failed to update sort order');
  }
});

const sortedMemecoins = computed(() => {
  return marketStore.memecoinsList;
});

const totalMarketCap = computed(() => {
  return marketStore.memecoinsList.reduce((sum, coin) => sum + coin.marketCap, 0).toLocaleString();
});

const totalVolume24h = computed(() => {
  return marketStore.memecoinsList.reduce((sum, coin) => sum + coin.volume24h, 0).toLocaleString();
});

const activeMemecoins = computed(() => {
  return marketStore.memecoinsList.filter(coin => coin.isActive).length;
});

const marketSentiment = computed(() => {
  const positiveCoins = marketStore.memecoinsList.filter(
    coin => marketStore.memecoinPrices[coin.id]?.marketSentiment === 'POSITIVE'
  ).length;
  const negativeCoins = marketStore.memecoinsList.filter(
    coin => marketStore.memecoinPrices[coin.id]?.marketSentiment === 'NEGATIVE'
  ).length;

  if (positiveCoins > negativeCoins) return 'BULLISH 🚀';
  if (negativeCoins > positiveCoins) return 'BEARISH 🐻';
  return 'NEUTRAL 📊';
});

const marketSentimentClass = computed(() => {
  switch (marketSentiment.value) {
    case 'BULLISH 🚀':
      return 'text-green-600 dark:text-green-400';
    case 'BEARISH 🐻':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-yellow-600 dark:text-yellow-400';
  }
});

function getPriceChange(memecoin: Memecoin) {
  const price = marketStore.memecoinPrices[memecoin.id];
  if (!price) return '0%';
  const change = ((price.price - memecoin.currentPrice) / memecoin.currentPrice) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

function getPriceChangeClass(memecoin: Memecoin) {
  const change = parseFloat(getPriceChange(memecoin));
  if (change > 0) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (change < 0) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
}

function openTradeModal(memecoin: Memecoin) {
  selectedMemecoin.value = memecoin;
  tradeAmount.value = '';
  slippageTolerance.value = '1';
}

async function handleTrade() {
  if (!selectedMemecoin.value || !tradeAmount.value) return;

  try {
    isLoading.value = true;
    const amount = parseFloat(tradeAmount.value);
    const slippage = parseFloat(slippageTolerance.value);

    await walletStore.trade(selectedMemecoin.value.id, amount, slippage);
    toast.success('Trade executed successfully! 🎉');
    selectedMemecoin.value = null;
  } catch (error: any) {
    toast.error(error.message || 'Failed to execute trade');
  } finally {
    isLoading.value = false;
  }
}
</script> 