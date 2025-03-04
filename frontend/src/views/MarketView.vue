<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Memecoin Market</h1>
      <div class="flex items-center space-x-4 w-full sm:w-auto">
        <div class="relative flex-1 sm:flex-none">
          <Input
            type="text"
            placeholder="Search memecoins..."
            class="pl-10"
          />
          <magnifying-glass-icon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <Select v-model="sortBy">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="symbol">Symbol</SelectItem>
            <SelectItem value="totalSupply">Total Supply</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          @click="sortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC'"
        >
          <arrow-up-icon v-if="sortOrder === 'ASC'" class="h-5 w-5" />
          <arrow-down-icon v-else class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <!-- Market Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Market Cap</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ totalMarketCap }} ZTH
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Volume</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ totalVolume24h }} ZTH
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Active Memecoins</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ activeMemecoins }}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Market Sentiment</h3>
          <p class="mt-2 text-2xl font-semibold" :class="marketSentimentClass">
            {{ marketSentiment }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Memecoin List -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Memecoin</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>24h Volume</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="memecoin in sortedMemecoins" :key="memecoin.id">
              <TableCell>
                <div class="flex items-center">
                  <img :src="memecoin.logoUrl" :alt="memecoin.name" class="h-10 w-10 rounded-full" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ memecoin.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ memecoin.symbol }}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="text-sm text-gray-900 dark:text-white">{{ memecoin.currentPrice.toFixed(6) }} ZTH</div>
              </TableCell>
              <TableCell>
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getPriceChange(memecoin).startsWith('+') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                ]">
                  {{ getPriceChange(memecoin) }}
                </span>
              </TableCell>
              <TableCell class="text-sm text-gray-900 dark:text-white">
                {{ memecoin.marketCap.toLocaleString() }} ZTH
              </TableCell>
              <TableCell class="text-sm text-gray-900 dark:text-white">
                {{ memecoin.volume24h.toLocaleString() }} ZTH
              </TableCell>
              <TableCell>
                <div class="flex space-x-2">
                  <Button variant="ghost" size="sm" @click="openTradeModal(memecoin)">
                    Trade
                  </Button>
                  <Button variant="ghost" size="sm" @click="selectMemecoin(memecoin)">
                    Details
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Charts -->
    <div v-if="selectedMemecoin" class="mt-8 space-y-8">
      <!-- Price Chart -->
      <Card>
        <CardHeader>
          <CardTitle class="flex justify-between items-center">
            {{ selectedMemecoin.name }} Price Chart
            <div class="flex space-x-2">
              <Button
                v-for="timeframe in timeframes"
                :key="timeframe"
                variant="ghost"
                size="sm"
                @click="selectedTimeframe = timeframe"
                :class="selectedTimeframe === timeframe ? 'bg-primary text-primary-foreground' : ''"
              >
                {{ timeframe }}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-96">
            <price-chart
              :data="priceData"
              :timeframe="selectedTimeframe"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Volume Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Trading Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-48">
            <volume-chart
              :data="volumeData"
              :timeframe="selectedTimeframe"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Trade Modal -->
    <Dialog v-model:open="isTradeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade {{ selectedMemecoin?.name }}</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Amount (ZTH)</label>
            <Input
              v-model="tradeAmount"
              type="number"
              min="0"
              step="0.000001"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Slippage Tolerance (%)</label>
            <Input
              v-model="slippageTolerance"
              type="number"
              min="0"
              max="100"
              step="0.1"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <Button
              variant="ghost"
              @click="isTradeModalOpen = false"
            >
              Cancel
            </Button>
            <Button
              @click="handleTrade"
              :disabled="!tradeAmount || isLoading"
            >
              {{ isLoading ? 'Processing...' : 'Confirm Trade' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MemecoinResponseDto } from '@/types/api';

const marketStore = useMarketStore();
const walletStore = useWalletStore();
const toast = useToast();

const sortBy = ref<'createdAt' | 'name' | 'symbol' | 'totalSupply'>('createdAt');
const sortOrder = ref<'ASC' | 'DESC'>('DESC');
const selectedMemecoin = ref<MemecoinResponseDto | null>(null);
const isTradeModalOpen = ref(false);
const tradeAmount = ref('');
const slippageTolerance = ref('1');
const isLoading = ref(false);
const selectedTimeframe = ref<'24h' | '7d' | '30d'>('24h');
const timeframes = ['24h', '7d', '30d'] as const;

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

  if (positiveCoins > negativeCoins) return 'Bullish';
  if (negativeCoins > positiveCoins) return 'Bearish';
  return 'Neutral';
});

const marketSentimentClass = computed(() => {
  switch (marketSentiment.value) {
    case 'Bullish':
      return 'text-green-600 dark:text-green-400';
    case 'Bearish':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
});

const sortedMemecoins = computed(() => {
  return [...marketStore.memecoinsList].sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    return sortOrder.value === 'ASC' ? 
      (aValue > bValue ? 1 : -1) : 
      (aValue < bValue ? 1 : -1);
  });
});

const priceData = computed(() => {
  if (!selectedMemecoin.value) return [];
  const price = marketStore.memecoinPrices[selectedMemecoin.value.id];
  if (!price) return [];
  return [{
    timestamp: new Date().toISOString(),
    open: price.price,
    high: price.price * 1.1, // Simulated data
    low: price.price * 0.9, // Simulated data
    close: price.price,
    volume: selectedMemecoin.value.volume24h
  }];
});

const volumeData = computed(() => {
  if (!selectedMemecoin.value) return [];
  return [{
    timestamp: new Date().toISOString(),
    volume: selectedMemecoin.value.volume24h
  }];
});

function getPriceChange(memecoin: MemecoinResponseDto) {
  const price = marketStore.memecoinPrices[memecoin.id];
  if (!price) return '0%';
  const change = ((price.price - memecoin.currentPrice) / memecoin.currentPrice) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
}

function openTradeModal(memecoin: MemecoinResponseDto) {
  selectedMemecoin.value = memecoin;
  isTradeModalOpen.value = true;
}

function selectMemecoin(memecoin: MemecoinResponseDto) {
  selectedMemecoin.value = memecoin;
}

async function handleTrade() {
  if (!selectedMemecoin.value || !tradeAmount.value) return;

  try {
    isLoading.value = true;
    await walletStore.trade(
      selectedMemecoin.value.id,
      parseFloat(tradeAmount.value),
      parseFloat(slippageTolerance.value)
    );
    toast.success('Trade executed successfully!');
    isTradeModalOpen.value = false;
    tradeAmount.value = '';
  } catch (error) {
    toast.error('Failed to execute trade. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

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
</script>

<style scoped>
/* Add any additional styles here */
</style> 