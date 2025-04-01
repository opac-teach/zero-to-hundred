<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div class="flex items-center space-x-4">
        <Avatar :src="memecoin?.logoUrl" :alt="memecoin?.symbol" class="h-16 w-16" />
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
          <div v-html="description" class="prose max-w-none"></div>
        </CardContent>
      </Card>
    </div>

    <!-- Memecoin Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
      <KPI
        title="Current Price"
        :value="Number(memecoin?.currentPrice || '0').toFixed(2)"
        unit="ZTH"
      />
      <KPI
        title="Current Supply"
        :value="Number(memecoin?.totalSupply || '0').toFixed(2)"
        unit="ZTH"
      />
      <Card>
        <CardHeader> <CardTitle> Curve Config </CardTitle> </CardHeader>
        <CardContent>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400">Type</span>
            <span class="font-medium">{{ memecoin?.curveConfig.curveType }}</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-gray-500 dark:text-gray-400">Starting Price</span>
            <span class="font-medium">{{ memecoin?.curveConfig.startingPrice }}</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <span class="text-gray-500 dark:text-gray-400">Slope</span>
            <span class="font-medium">{{ memecoin?.curveConfig.slope }}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader> <CardTitle> Created By </CardTitle> </CardHeader>
        <CardContent>
          <router-link
            :to="`/user/${memecoin?.creator?.username}`"
            class="flex items-center space-x-4"
          >
            <Avatar
              :src="memecoin?.creator?.profilePictureUrl"
              :alt="memecoin?.creator?.username"
              class="h-16 w-16"
            />
            <div>
              <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ memecoin?.creator?.username }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">{{ memecoin?.creator?.userTitle }}</p>
            </div>
          </router-link>
        </CardContent>
      </Card>
      <!-- <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Volume</h3>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ memecoin?.volume24h }} ZTH
          </p>
        </CardContent>
      </Card> -->
    </div>

    <!-- Charts and Trading Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TradeMemecoin
        :memecoin="memecoin"
        @update-amount="updateTargetSupply"
        @trade-executed="fetchTxs"
      />

      <BondingCurvePreview
        :curveConfig="memecoin?.curveConfig"
        :currentSupply="memecoin?.totalSupply"
        :targetSupply="targetSupply"
      />

      <!-- Price Chart -->
      <!-- <Card>
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
      </Card> -->

      <!-- Volume Chart -->
      <!-- <Card>
        <CardHeader>
          <CardTitle>Trading Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="h-48">
            <volume-chart :data="volumeData" :timeframe="selectedTimeframe" />
          </div>
        </CardContent>
      </Card> -->
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="flex items-center border-b last:border-b-0 pb-4"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ transaction.type }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(transaction.createdAt) }}
              </p>
            </div>
            <div class="flex-1 ml-8 flex items-center">
              <Avatar
                :src="transaction.user?.profilePictureUrl"
                :alt="transaction.user?.username"
                class="h-8 w-8 mr-2"
              />
              <router-link
                :to="`/user/${transaction.user?.username}`"
                class="text-sm font-medium text-gray-900 dark:text-white"
              >
                {{ transaction.user?.username }}
              </router-link>
            </div>
            <div class="text-right">
              <div v-if="transaction.type !== 'CREATE'" class="text-right">
                <p
                  class="text-sm font-medium"
                  :class="
                    transaction.type === 'BUY'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ transaction.type === "BUY" ? "+" : "-" }}
                  {{ Number(transaction.memecoinAmount).toFixed(2) }}
                  {{ memecoin?.symbol }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ transaction.type === "BUY" ? "-" : "+" }}
                  {{ Number(transaction.zthAmount).toFixed(2) }} ZTH
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  @
                  {{ Number(transaction.price).toFixed(2) }}
                  {{ memecoin?.symbol }}/ZTH
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMarketStore } from "@/stores/market";
import { useToast } from "vue-toastification";
import { usePageTitle } from "@/composables/usePageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { marked } from "marked";
import TradeMemecoin from "@/components/TradeMemecoin.vue";
import BondingCurvePreview from "@/components/charts/BondingCurvePreview.vue";
import Avatar from "@/components/Logo.vue";
import KPI from "@/components/KPI.vue";
import type { TransactionResponseDto } from "@/api/types";
import { memecoins } from "@/api";
import { formatDate } from "@/utils/formatters";

const route = useRoute();
const router = useRouter();
const marketStore = useMarketStore();
const toast = useToast();
const targetSupply = ref<string | undefined>(undefined);
const transactions = ref<TransactionResponseDto[]>([]);
const memecoinSymbol = route.params.symbol as string;
const memecoin = computed(() =>
  marketStore.memecoinsList.find((coin) => coin.symbol === memecoinSymbol)
);
const selectedTimeframe = ref<"24h" | "7d" | "30d">("24h");
const timeframes = ["24h", "7d", "30d"] as const;

const description = computed(() => marked.parse(memecoin.value?.description || ""));

function updateTargetSupply(amount: string) {
  targetSupply.value = (Number(memecoin.value?.totalSupply) + Number(amount)).toString();
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

async function fetchTxs() {
  const resTx = await memecoins.getTransactions(memecoinSymbol);
  transactions.value = resTx.data;
}

onMounted(async () => {
  try {
    await marketStore.fetchMemecoinDetails(memecoinSymbol);
    if (!memecoin.value) {
      router.push("/memecoins");
    }
    marketStore.startPriceUpdates();
    fetchTxs();
  } catch (error: any) {
    toast.error(error.message || "Failed to fetch memecoin details");
    router.push("/memecoins");
  }
});

onUnmounted(() => {
  marketStore.stopPriceUpdates();
});
</script>
