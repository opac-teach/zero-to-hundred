<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Memecoin Market</h1>
      <div class="flex items-center space-x-4 w-full sm:w-auto">
        <div class="relative flex-1 sm:flex-none">
          <Input type="text" placeholder="Search memecoins..." class="pl-10" />
          <magnifying-glass-icon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          />
        </div>
        <div class="relative sort-dropdown">
          <Button
            variant="outline"
            class="w-[180px] justify-between"
            @click.stop="isSortOpen = !isSortOpen"
          >
            <span>{{ sortOptions.find((option) => option.value === sortBy)?.label }}</span>
            <chevron-down-icon class="h-4 w-4" />
          </Button>
          <div
            v-if="isSortOpen"
            class="absolute top-full left-0 mt-1 w-full bg-background border rounded-md shadow-lg z-10"
          >
            <div
              v-for="option in sortOptions"
              :key="option.value"
              class="px-3 py-2 hover:bg-accent cursor-pointer"
              @click="
                () => {
                  sortBy = option.value;
                  isSortOpen = false;
                }
              "
            >
              {{ option.label }}
            </div>
          </div>
        </div>
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
    <!-- <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardContent class="pt-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</h3>
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
    </div> -->

    <!-- Memecoin List -->
    <Card>
      <CardContent class="p-0">
        <div v-if="marketStore.isLoading" class="p-4 text-center">Loading memecoins...</div>
        <div v-else-if="marketStore.error" class="p-4 text-center text-red-500">
          {{ marketStore.error }}
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Memecoin</TableHead>
              <TableHead>Price</TableHead>
              <!-- <TableHead>24h Change</TableHead> -->
              <TableHead>Total Supply</TableHead>
              <!-- <TableHead>24h Volume</TableHead> -->
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="memecoin in sortedMemecoins"
              :key="memecoin.id"
              @click="$router.push(`/memecoins/${memecoin.symbol}`)"
              class="cursor-pointer"
            >
              <TableCell>
                <div class="flex items-center">
                  <Avatar :src="memecoin.logoUrl" :alt="memecoin.symbol" class="h-10 w-10" />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ memecoin.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ memecoin.symbol }}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ Number(memecoin.currentPrice).toFixed(6) }} ZTH
                </div>
              </TableCell>
              <!-- <TableCell>
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getPriceChange(memecoin).startsWith('+')
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  ]"
                >
                  {{ getPriceChange(memecoin) }}
                </span>
              </TableCell> -->
              <TableCell class="text-sm text-gray-900 dark:text-white">
                {{ memecoin.totalSupply }} ZTH
              </TableCell>
              <!-- <TableCell class="text-sm text-gray-900 dark:text-white">
                {{ memecoin.volume24h }} ZTH
              </TableCell> -->
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useMarketStore } from "@/stores/market";
import { useToast } from "vue-toastification";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Avatar from "@/components/Logo.vue";

const marketStore = useMarketStore();
const toast = useToast();

const sortBy = ref<"createdAt" | "name" | "symbol" | "totalSupply">("createdAt");
const sortOrder = ref<"ASC" | "DESC">("DESC");
const isSortOpen = ref(false);

const sortOptions = [
  { value: "createdAt", label: "Created Date" },
  { value: "name", label: "Name" },
  { value: "symbol", label: "Symbol" },
  { value: "totalSupply", label: "Supply" },
] as const;

// const totalMarketCap = computed(() => {
//   return marketStore.memecoinsList.reduce((sum, coin) => sum + Number(coin.marketCap), 0);
// });

// const totalVolume24h = computed(() => {
//   return marketStore.memecoinsList.reduce((sum, coin) => sum + Number(coin.volume24h), 0);
// });

// const activeMemecoins = computed(() => {
//   return marketStore.memecoinsList.length;
// });

// const marketSentiment = computed(() => {
//   // Since we no longer have marketSentiment data, we'll use price changes to determine sentiment
//   // Count memecoins with positive price change in the last 24h as "positive"
//   // This is a simplified approach - in a real app, you'd use actual market sentiment data
//   const positiveCoins = Math.floor(marketStore.memecoinsList.length * 0.6); // Simulate 60% positive
//   const negativeCoins = Math.floor(marketStore.memecoinsList.length * 0.3); // Simulate 30% negative

//   if (positiveCoins > negativeCoins) return "Bullish";
//   if (negativeCoins > positiveCoins) return "Bearish";
//   return "Neutral";
// });

// const marketSentimentClass = computed(() => {
//   switch (marketSentiment.value) {
//     case "Bullish":
//       return "text-green-600 dark:text-green-400";
//     case "Bearish":
//       return "text-red-600 dark:text-red-400";
//     default:
//       return "text-gray-600 dark:text-gray-400";
//   }
// });

const sortedMemecoins = computed(() => {
  return [...marketStore.memecoinsList].sort((a, b) => {
    let aValue: any = a[sortBy.value];
    let bValue: any = b[sortBy.value];

    // Handle date fields
    if (sortBy.value === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle numeric fields
    if (["price", "supply"].includes(sortBy.value)) {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    // Handle string fields
    if (["name", "symbol"].includes(sortBy.value)) {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }

    // Compare values
    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    return sortOrder.value === "ASC" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
  });
});

// function getPriceChange(memecoin: MemecoinResponseDto) {
//   // Since we're now using the current price directly, we'll simulate a small change
//   // In a real app, you'd track historical prices to calculate this
//   const randomChange = (Math.random() * 2 - 1) * 5; // Random change between -5% and +5%
//   return `${randomChange >= 0 ? "+" : ""}${randomChange.toFixed(2)}%`;
// }

onMounted(async () => {
  try {
    await Promise.all([
      marketStore.fetchMemecoins({
        sortBy: sortBy.value,
        order: sortOrder.value,
      }),
      // marketStore.fetchTradingVolume(),
    ]);
    marketStore.startPriceUpdates();

    // Add click outside handler for sort dropdown
    document.addEventListener("click", handleClickOutside);
  } catch (error: any) {
    toast.error(error.message || "Failed to fetch market data");
  }
});

onUnmounted(() => {
  marketStore.stopPriceUpdates();
  document.removeEventListener("click", handleClickOutside);
});

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".sort-dropdown")) {
    isSortOpen.value = false;
  }
}

watch([sortBy, sortOrder], async () => {
  try {
    await marketStore.fetchMemecoins({
      sortBy: sortBy.value,
      order: sortOrder.value,
    });
  } catch (error: any) {
    toast.error(error.message || "Failed to update sort order");
  }
});
</script>
