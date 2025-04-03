<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
      <div class="flex items-center space-x-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-3">
          <div class="text-sm text-gray-500 dark:text-gray-400">ZTH Balance</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ walletStore.zthBalance }} ZTH
          </div>
        </div>
      </div>
    </div>

    <!-- Holdings -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">My Holdings</h2>
        <div class="flex items-center space-x-2">
          <span class="text-gray-500 dark:text-gray-400">Sort by:</span>
          <button
            @click="sortHoldingsBy = 'value'"
            class="px-3 py-1 rounded-md text-sm font-medium"
            :class="
              sortHoldingsBy === 'value'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            "
          >
            Value
          </button>
          <button
            @click="sortHoldingsBy = 'amount'"
            class="px-3 py-1 rounded-md text-sm font-medium"
            :class="
              sortHoldingsBy === 'amount'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            "
          >
            Amount
          </button>
        </div>
      </div>
      <div class="space-y-4">
        <div
          v-for="holding in sortedHoldings"
          :key="holding.id"
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          @click="router.push(`/memecoins/${holding.memecoin.symbol}`)"
        >
          <div class="flex items-center space-x-4">
            <Avatar
              :src="holding.memecoin.logoUrl"
              :alt="holding.memecoin.symbol"
              class="w-12 h-12"
            />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ holding.memecoin.name }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ holding.memecoin.symbol }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ holding.amount }} {{ holding.memecoin.symbol }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{
                calculateSellPrice(
                  holding.amount,
                  holding.memecoin.totalSupply,
                  holding.memecoin.curveConfig
                )
              }}
              ZTH
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
        <div class="flex items-center space-x-2">
          <button
            v-for="filter in transactionFilters"
            :key="filter.value"
            @click="selectedFilter = filter.value"
            class="px-3 py-1 rounded-md text-sm font-medium"
            :class="
              selectedFilter === filter.value
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            "
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Memecoin
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="transaction in filteredTransactions"
              :key="transaction.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(transaction.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="
                    transaction.type === 'BUY'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  "
                >
                  {{ transaction.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <Avatar
                    :src="transaction.memecoin.logoUrl"
                    :alt="transaction.memecoin.symbol"
                    class="h-8 w-8"
                  />
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ transaction.memecoin.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ transaction.memecoin.symbol }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ transaction.type === "BUY" ? "+" : "-" }}{{ transaction.memecoinAmount }}
                {{ transaction.memecoin.symbol }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ transaction.zthAmount }} ZTH
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useWalletStore } from "@/stores/wallet";
import { useToast } from "vue-toastification";
import Avatar from "@/components/Logo.vue";
import router from "@/router";
import { calculateSellPrice } from "@/lib/bonding-curve";
import { formatDate } from "@/utils/formatters";

const walletStore = useWalletStore();
const toast = useToast();
const sortHoldingsBy = ref<"value" | "amount">("value");
const selectedFilter = ref("all");

const transactionFilters = [
  { label: "All", value: "all" },
  { label: "Buy", value: "BUY" },
  { label: "Sell", value: "SELL" },
];

const sortedHoldings = computed(() => {
  return [...walletStore.holdings].sort((a, b) => {
    if (sortHoldingsBy.value === "value") {
      const aValue = parseFloat(a.amount) * parseFloat(a.memecoin.currentPrice);
      const bValue = parseFloat(b.amount) * parseFloat(b.memecoin.currentPrice);
      return bValue - aValue;
    }
    return parseFloat(b.amount) - parseFloat(a.amount);
  });
});

const filteredTransactions = computed(() => {
  if (selectedFilter.value === "all") {
    return walletStore.transactions;
  }
  return walletStore.transactions.filter((t) => t.type === selectedFilter.value);
});

onMounted(async () => {
  try {
    await walletStore.fetchWallet();
    await walletStore.fetchTransactions();
  } catch (error: any) {
    toast.error(error.message || "Failed to fetch wallet data");
  }
});
</script>
