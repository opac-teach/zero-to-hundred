import { defineStore } from "pinia";
import { ref, computed, onMounted } from "vue";
import type {
  WalletResponseDto,
  TransactionResponseDto,
  TradeResponseDto,
  MemecoinResponseDto,
} from "@/types/api";
import { wallet, trading } from "@/api/client";
import { useMarketStore } from "@/stores/market";

export const useWalletStore = defineStore("wallet", () => {
  const walletData = ref<WalletResponseDto | null>(null);
  const transactions = ref<TransactionResponseDto[]>([]);
  const transactionPagination = ref<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const zthBalance = computed(() => walletData.value?.zthBalance || "0");
  const holdings = computed(() => walletData.value?.holdings || []);

  async function fetchWallet() {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await wallet.getWallet();
      walletData.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch wallet";
      console.error("Failed to fetch wallet:", err);
      // Don't throw the error here to prevent breaking the app flow
    } finally {
      isLoading.value = false;
    }
  }

  // Initialize wallet data - can be called when the app starts or user logs in
  async function initializeWallet() {
    // Only fetch if we don't already have wallet data
    if (!walletData.value) {
      await fetchWallet();
    }
  }

  // Clear wallet data - called when user logs out
  function clearWallet() {
    walletData.value = null;
    transactions.value = [];
    transactionPagination.value = {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };
    error.value = null;
  }

  async function fetchTransactions(page: number = 1, limit: number = 10) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await wallet.getTransactions(page, limit);
      transactions.value = response.data;
      transactionPagination.value = {
        total: response.data.length,
        page,
        limit,
        totalPages: Math.ceil(response.data.length / limit),
      };
      return transactions.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch transactions";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function updateBalance(newBalance: string) {
    if (walletData.value) {
      walletData.value.zthBalance = newBalance;
    }
  }

  function updateHolding(memecoinId: string, amount: string, memecoin: MemecoinResponseDto) {
    if (!walletData.value) return;

    const holdingIndex = walletData.value.holdings.findIndex((h) => h.memecoinId === memecoinId);
    if (holdingIndex === -1) {
      // Add new holding
      walletData.value.holdings.push({
        id: crypto.randomUUID(), // Use a proper UUID instead of timestamp
        walletId: walletData.value.id,
        memecoinId,
        amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memecoin,
      });
    } else {
      // Update existing holding
      walletData.value.holdings[holdingIndex].amount = amount;
      walletData.value.holdings[holdingIndex].updatedAt = new Date().toISOString();
      walletData.value.holdings[holdingIndex].memecoin = memecoin;
    }
  }

  async function tradeMemecoin(
    memecoinId: string,
    amount: string,
    requestCost: string,
    slippageTolerance: number = 1,
    tradeType: "buy" | "sell"
  ) {
    try {
      isLoading.value = true;
      error.value = null;

      // Get the current price from the market store
      const marketStore = useMarketStore();
      const memecoin = marketStore.memecoinsList.find((m) => m.id === memecoinId);

      if (!memecoin) {
        throw new Error("Unable to find memecoin");
      }

      const response = await trading.trade({
        memecoinId,
        amount,
        requestCost,
        slippageTolerance,
        tradeType,
      });

      // Log the successful response
      console.log("Buy response:", response.data);

      // Fetch fresh wallet data to ensure UI displays updated balances
      await fetchWallet();
      await marketStore.fetchMemecoins();

      return response.data;
    } catch (err: any) {
      // Log the full error object
      console.error("Buy error:", err);
      console.error("Error response:", err.response?.data);
      error.value = err.response?.data?.message || "Failed to execute buy";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    walletData,
    transactions,
    transactionPagination,
    isLoading,
    error,
    zthBalance,
    holdings,
    fetchWallet,
    initializeWallet,
    clearWallet,
    fetchTransactions,
    updateBalance,
    updateHolding,
    tradeMemecoin,
  };
});
