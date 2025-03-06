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
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.totalSupply }} ZTH
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Volume</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.volume24h }} ZTH
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.totalSupply }}
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
              <label class="text-sm font-medium">Amount of memecoin to {{ tradeType }}</label>
              <Input
                v-model="tradeAmount"
                type="number"
                min="0"
                step="0.000001"
                :class="{ 'border-red-500': tradeAmountError }"
              />
              <div class="flex">
                <div>Balance: {{ walletHolding?.amount || "0" }}</div>
                <Button
                  v-if="tradeType == 'sell'"
                  variant="outline"
                  @click="tradeAmount = walletHolding?.amount || '0'"
                >
                  All
                </Button>
              </div>
              <p v-if="tradeAmountError" class="text-sm text-red-500">{{ tradeAmountError }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium">Cost</label>
                <span class="text-sm text-gray-500">{{ tradeEstimation?.cost }} ZTH</span>
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

            <div>
              <label class="text-sm font-medium">Trade Type</label>
              <select v-model="tradeType" class="w-full">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div class="flex space-x-3">
              <Button
                variant="outline"
                class="flex-1"
                @click="handleTrade()"
                :disabled="!isTradeFormValid || isLoading || tradeAmount == '0'"
              >
                {{ isLoading ? "Processing..." : "Trade" }}
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
import type { TradeEstimationResponseDto } from "@/types/api";
import { trading } from "@/api/client";

const route = useRoute();
const router = useRouter();
const marketStore = useMarketStore();
const walletStore = useWalletStore();
const assetsStore = useAssetsStore();
const toast = useToast();

const memecoin = computed(() =>
  marketStore.memecoinsList.find((coin) => coin.symbol === route.params.symbol)
);
const walletData = computed(() => walletStore.walletData);
const walletHolding = computed(() =>
  walletStore.holdings.find((holding) => holding.memecoinId === memecoin.value?.id)
);
const tradeAmount = ref("0");
const slippageTolerance = ref("5");
const isLoading = ref(false);
const selectedTimeframe = ref<"24h" | "7d" | "30d">("24h");
const timeframes = ["24h", "7d", "30d"] as const;
const tradeEstimation = ref<TradeEstimationResponseDto | null>(null);
const tradeType = ref<"buy" | "sell">("buy");

// Validation state
const tradeAmountError = ref("");

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

watch(
  [tradeAmount, tradeType, walletHolding],
  ([newTradeAmount, newTradeType, newWalletHolding]) => {
    if (!newTradeAmount) return;
    tradeEstimation.value = null;
    tradeAmountError.value = "";

    const amount = parseFloat(newTradeAmount);
    if (isNaN(amount)) {
      tradeAmountError.value = "Please enter a valid number";
      return false;
    }
    if (
      newTradeType == "sell" &&
      (!newWalletHolding || Number(newTradeAmount) > Number(newWalletHolding?.amount))
    ) {
      tradeAmountError.value = "Insufficient balance";
      return false;
    }

    if (!memecoin.value) return;
    trading
      .estimate({
        memecoinId: memecoin.value.id,
        amount: newTradeAmount,
        requestCost: memecoin.value.currentPrice,
        tradeType: newTradeType,
      })
      .then((response) => {
        tradeEstimation.value = response.data;

        if (
          newTradeType == "buy" &&
          Number(tradeEstimation.value?.cost) > Number(walletData.value?.zthBalance)
        ) {
          tradeAmountError.value = "Insufficient balance";
          return false;
        }
      });
  }
);

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

async function handleTrade() {
  if (!memecoin.value || !tradeAmount.value) return;

  try {
    isLoading.value = true;

    if (!tradeEstimation.value) {
      throw new Error("Trade estimation not found");
    }
    await walletStore.tradeMemecoin(
      memecoin.value.id,
      tradeAmount.value,
      tradeEstimation.value.cost,
      parseFloat(slippageTolerance.value),
      tradeType.value
    );

    tradeAmount.value = "0";
    toast.success(`Trade ${tradeType.value} executed successfully!`);
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
