import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { MemecoinResponseDto, TradingVolumeDto, CreateMemecoinDto } from "@/types/api";
import { memecoins, statistics } from "@/api/client";
import { useWalletStore } from "@/stores/wallet";

export const useMarketStore = defineStore("market", () => {
  const memecoinsList = ref<MemecoinResponseDto[]>([]);
  const tradingVolume = ref<TradingVolumeDto | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const sortedMemecoins = computed(() => {
    return [...memecoinsList.value].sort(
      (a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h)
    );
  });

  let priceUpdateInterval: number | null = null;

  async function fetchMemecoins(params?: {
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "name" | "symbol" | "totalSupply";
    order?: "ASC" | "DESC";
  }) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await memecoins.getAll(params);
      memecoinsList.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch memecoins";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMemecoinDetails(memecoinSymbol: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await memecoins.getBySymbol(memecoinSymbol);
      const index = memecoinsList.value.findIndex((coin) => coin.symbol === memecoinSymbol);
      if (index !== -1) {
        memecoinsList.value[index] = response.data;
      } else {
        memecoinsList.value.push(response.data);
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch memecoin details";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMemecoinBySymbol(symbol: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await memecoins.getBySymbol(symbol);

      // Update the memecoin in the list if it exists, otherwise add it
      const index = memecoinsList.value.findIndex((coin) => coin.symbol === symbol);
      if (index !== -1) {
        memecoinsList.value[index] = response.data;
      } else {
        memecoinsList.value.push(response.data);
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch memecoin details";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createMemecoin(data: CreateMemecoinDto) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await memecoins.create(data);
      memecoinsList.value.push(response.data);

      // Fetch updated wallet data after creating a memecoin
      const walletStore = useWalletStore();
      await walletStore.fetchWallet();

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to create memecoin";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTradingVolume(params?: {
    timeframe?: "24h" | "7d" | "30d";
    memecoinId?: string;
  }) {
    try {
      const response = await statistics.getTradingVolume(params);
      tradingVolume.value = response.data;
    } catch (err: any) {
      console.error("Failed to fetch trading volume:", err);
    }
  }

  function startPriceUpdates() {
    // Update prices every 30 seconds by refreshing the memecoin list
    priceUpdateInterval = window.setInterval(() => {
      for (const memecoin of memecoinsList.value) {
        fetchMemecoinBySymbol(memecoin.symbol);
      }
    }, 5000);
  }

  function stopPriceUpdates() {
    if (priceUpdateInterval) {
      window.clearInterval(priceUpdateInterval);
      priceUpdateInterval = null;
    }
  }

  // Helper function to get current price for a memecoin
  function getMemecoinPrice(memecoinId: string): string | null {
    const memecoin = memecoinsList.value.find((coin) => coin.id === memecoinId);
    return memecoin ? memecoin.currentPrice : null;
  }

  return {
    memecoinsList,
    tradingVolume,
    isLoading,
    error,
    sortedMemecoins,
    fetchMemecoins,
    fetchMemecoinDetails,
    fetchMemecoinBySymbol,
    createMemecoin,
    fetchTradingVolume,
    startPriceUpdates,
    stopPriceUpdates,
    getMemecoinPrice,
  };
});
