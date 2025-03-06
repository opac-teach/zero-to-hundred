<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div class="flex items-center space-x-4">
        <img
          :src="memecoin?.logoUrl || assetsStore.defaultMemecoinLogo"
          :alt="memecoin?.name"
          class="h-12 w-12 rounded-full"
        />
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ memecoin?.name }}</h1>
          <p class="text-gray-500 dark:text-gray-400">{{ memecoin?.symbol }}</p>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <Button variant="outline" @click="$router.push('/memecoins')"> Back to Market </Button>
      </div>
    </div>

    <!-- Memecoin Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Current Price</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ Number(memecoin?.currentPrice || "0").toFixed(6) }} ZTH
          </p>
          <span
            :class="[
              'mt-2 inline-flex text-sm font-semibold',
              getPriceChange().startsWith('+')
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ getPriceChange() }}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.marketCap.toLocaleString() }} ZTH
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Volume</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.volume24h.toLocaleString() }} ZTH
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.totalSupply.toLocaleString() }}
          </p>
        </CardContent>
      </Card>
    </div>

    <div>
      <!-- Trading Section -->
      <Card>
        <CardHeader>
          <CardTitle>Trade {{ memecoin?.name }}</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Amount (ZTH)</label>
              <Input
                v-model="tradeAmount"
                type="number"
                min="0"
                step="0.000001"
                :class="{ 'border-red-500': tradeAmountError }"
                @input="validateTradeAmount"
              />
              <p v-if="tradeAmountError" class="text-sm text-red-500">{{ tradeAmountError }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium">Current Price</label>
                <span class="text-sm text-gray-500">{{ currentPrice }} ZTH</span>
              </div>
              <div v-if="priceWarning" class="text-sm text-yellow-600 dark:text-yellow-400">
                {{ priceWarning }}
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium">Slippage Tolerance</label>
                <span class="text-sm text-gray-500">{{ slippageTolerance }}%</span>
              </div>
              <input
                v-model="slippageTolerance"
                type="range"
                min="0"
                max="30"
                step="0.1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div class="flex space-x-3">
              <Button
                variant="outline"
                class="flex-1"
                @click="handleTrade('buy')"
                :disabled="!isTradeFormValid || isLoading"
              >
                {{ isLoading ? "Processing..." : "Buy" }}
              </Button>
              <Button
                variant="outline"
                class="flex-1"
                @click="handleTrade('sell')"
                :disabled="!isTradeFormValid || isLoading"
              >
                {{ isLoading ? "Processing..." : "Sell" }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <!-- Charts and Trading Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Charts -->
      <div class="space-y-6">
        <!-- Price Chart -->
        <Card>
          <CardHeader>
            <CardTitle class="flex justify-between items-center">
              Price Chart
              <div class="flex space-x-2">
                <Button
                  v-for="timeframe in timeframes"
                  :key="timeframe"
                  variant="ghost"
                  size="sm"
                  @click="selectedTimeframe = timeframe"
                  :class="
                    selectedTimeframe === timeframe ? 'bg-primary text-primary-foreground' : ''
                  "
                >
                  {{ timeframe }}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="h-96">
              <price-chart :data="priceData" :timeframe="selectedTimeframe" />
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
              <volume-chart :data="volumeData" :timeframe="selectedTimeframe" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMarketStore } from "@/stores/market";
import { useWalletStore } from "@/stores/wallet";
import { useAssetsStore } from "@/stores/assets";
import { useToast } from "vue-toastification";
import { usePageTitle } from "@/composables/usePageTitle";
import PriceChart from "@/components/PriceChart.vue";
import VolumeChart from "@/components/VolumeChart.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemecoinResponseDto } from "@/types/api";

const route = useRoute();
const router = useRouter();
const marketStore = useMarketStore();
const walletStore = useWalletStore();
const assetsStore = useAssetsStore();
const toast = useToast();

const memecoin = ref<MemecoinResponseDto | null>(null);
const tradeAmount = ref("");
const slippageTolerance = ref("5");
const isLoading = ref(false);
const selectedTimeframe = ref<"24h" | "7d" | "30d">("24h");
const timeframes = ["24h", "7d", "30d"] as const;

// Validation state
const tradeAmountError = ref("");
const priceWarning = ref("");

// Computed properties for validation
const isTradeAmountValid = computed(() => {
  const amount = parseFloat(tradeAmount.value);
  return !isNaN(amount) && amount > 0;
});

const isSlippageValid = computed(() => {
  const slippage = parseFloat(slippageTolerance.value);
  return !isNaN(slippage) && slippage >= 0 && slippage <= 30;
});

const isTradeFormValid = computed(() => {
  return isTradeAmountValid.value && isSlippageValid.value;
});

const currentPrice = computed(() => {
  if (!memecoin.value) return "0";
  return Number(memecoin.value.currentPrice).toFixed(6);
});

// Add price warning check
watch([memecoin], ([newMemecoin]) => {
  if (!newMemecoin) return;

  // Price warning is no longer needed since we're using the current price directly
  priceWarning.value = "";
});

// Validation functions
function validateTradeAmount() {
  const amount = parseFloat(tradeAmount.value);
  if (isNaN(amount)) {
    tradeAmountError.value = "Please enter a valid number";
    return false;
  }
  if (amount <= 0) {
    tradeAmountError.value = "Amount must be greater than 0";
    return false;
  }
  tradeAmountError.value = "";
  return true;
}

const priceData = computed(() => {
  if (!memecoin.value) return [];
  const price = memecoin.value.currentPrice;
  if (!price) return [];

  // Convert string to number for calculations
  const priceNum = parseFloat(price);

  return [
    {
      timestamp: new Date().toISOString(),
      open: priceNum,
      high: priceNum * 1.1,
      low: priceNum * 0.9,
      close: priceNum,
      volume: parseFloat(memecoin.value.volume24h),
    },
  ];
});

const volumeData = computed(() => {
  if (!memecoin.value) return [];
  return [
    {
      timestamp: new Date().toISOString(),
      volume: parseFloat(memecoin.value.volume24h),
    },
  ];
});

function getPriceChange() {
  if (!memecoin.value) return "0%";
  // Since we're now using the current price directly, we'll simulate a small change
  // In a real app, you'd track historical prices to calculate this
  const randomChange = (Math.random() * 2 - 1) * 5; // Random change between -5% and +5%
  return `${randomChange >= 0 ? "+" : ""}${randomChange.toFixed(2)}%`;
}

async function handleTrade(action: "buy" | "sell") {
  if (!memecoin.value || !tradeAmount.value) return;

  try {
    isLoading.value = true;

    if (action === "buy") {
      await walletStore.buyMemecoin(
        memecoin.value.id,
        tradeAmount.value,
        parseFloat(slippageTolerance.value)
      );
    } else {
      await walletStore.sellMemecoin(
        memecoin.value.id,
        tradeAmount.value,
        parseFloat(slippageTolerance.value)
      );
    }

    toast.success(`Trade ${action} executed successfully!`);
    tradeAmount.value = "";
  } catch (error) {
    toast.error("Failed to execute trade. Please try again.");
  } finally {
    isLoading.value = false;
  }
}

// Dynamic page title based on memecoin name
const { updateTitle } = usePageTitle(() =>
  memecoin.value?.name ? `${memecoin.value.name} (${memecoin.value.symbol})` : "Memecoin Details"
);

// Update title when memecoin data changes
watch(
  () => memecoin.value,
  () => {
    if (memecoin.value) {
      updateTitle();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    const memecoinSymbol = route.params.symbol as string;
    await marketStore.fetchMemecoinDetails(memecoinSymbol);
    memecoin.value =
      marketStore.memecoinsList.find((coin) => coin.symbol === memecoinSymbol) || null;
    if (!memecoin.value) {
      router.push("/memecoins");
    }
    marketStore.startPriceUpdates();
  } catch (error: any) {
    toast.error(error.message || "Failed to fetch memecoin details");
    router.push("/memecoins");
  }
});

onUnmounted(() => {
  marketStore.stopPriceUpdates();
});
</script>
