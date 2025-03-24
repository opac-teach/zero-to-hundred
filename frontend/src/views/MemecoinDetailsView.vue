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

    <div v-if="memecoin?.description">
      <Card>
        <CardContent class="pt-6">
          <div v-html="description" class="prose"></div>
        </CardContent>
      </Card>
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
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Current Supply</h3>
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
    </div>

    <!-- Charts and Trading Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TradeMemecoin :memecoin="memecoin" @update-amount="updateTargetSupply" />

      <BondingCurvePreview
        :curveConfig="memecoin?.curveConfig"
        :currentSupply="memecoin?.totalSupply"
        :targetSupply="targetSupply"
      />

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
                :class="selectedTimeframe === timeframe ? 'bg-primary text-primary-foreground' : ''"
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMarketStore } from "@/stores/market";
import { useAssetsStore } from "@/stores/assets";
import { useToast } from "vue-toastification";
import { usePageTitle } from "@/composables/usePageTitle";
import PriceChart from "@/components/PriceChart.vue";
import VolumeChart from "@/components/VolumeChart.vue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marked } from "marked";
import TradeMemecoin from "@/components/TradeMemecoin.vue";
import BondingCurvePreview from "@/components/BondingCurvePreview.vue";

const route = useRoute();
const router = useRouter();
const marketStore = useMarketStore();
const assetsStore = useAssetsStore();
const toast = useToast();
const targetSupply = ref<string | undefined>(undefined);

const memecoin = computed(() =>
  marketStore.memecoinsList.find((coin) => coin.symbol === route.params.symbol)
);
const selectedTimeframe = ref<"24h" | "7d" | "30d">("24h");
const timeframes = ["24h", "7d", "30d"] as const;

const description = computed(() => marked.parse(memecoin.value?.description || ""));

function updateTargetSupply(amount: string) {
  targetSupply.value = (Number(memecoin.value?.totalSupply) + Number(amount)).toString();
  console.log(targetSupply.value);
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

usePageTitle(memecoin, (memecoinValue) =>
  memecoinValue?.name ? `${memecoinValue.name} (${memecoinValue.symbol})` : "Memecoin Details"
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
