import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  MemecoinResponseDto, 
  MemecoinPriceDto, 
  TradingVolumeDto,
  CreateMemecoinDto 
} from '@/types/api';
import { memecoins, statistics } from '@/api/client';

export const useMarketStore = defineStore('market', () => {
  const memecoinsList = ref<MemecoinResponseDto[]>([]);
  const memecoinPrices = ref<Record<string, MemecoinPriceDto>>({});
  const tradingVolume = ref<TradingVolumeDto | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const sortedMemecoins = computed(() => {
    return [...memecoinsList.value].sort((a, b) => b.volume24h - a.volume24h);
  });

  let priceUpdateInterval: number | null = null;

  async function fetchMemecoins(params?: { 
    page?: number; 
    limit?: number; 
    sortBy?: 'createdAt' | 'name' | 'symbol' | 'totalSupply'; 
    order?: 'ASC' | 'DESC' 
  }) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await memecoins.getAll(params);
      memecoinsList.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch memecoins';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMemecoinDetails(memecoinId: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await memecoins.getById(memecoinId);
      const index = memecoinsList.value.findIndex(coin => coin.id === memecoinId);
      if (index !== -1) {
        memecoinsList.value[index] = response.data;
      } else {
        memecoinsList.value.push(response.data);
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch memecoin details';
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
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create memecoin';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMemecoinPrice(memecoinId: string) {
    try {
      const response = await memecoins.getPrice(memecoinId);
      memecoinPrices.value[memecoinId] = response.data;
    } catch (err: any) {
      console.error('Failed to fetch memecoin price:', err);
    }
  }

  async function fetchTradingVolume(params?: { timeframe?: '24h' | '7d' | '30d'; memecoinId?: string }) {
    try {
      const response = await statistics.getTradingVolume(params);
      tradingVolume.value = response.data;
    } catch (err: any) {
      console.error('Failed to fetch trading volume:', err);
    }
  }

  function updateMemecoinPrice(memecoinId: string, price: number, supply: number, marketSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE') {
    memecoinPrices.value[memecoinId] = {
      price,
      supply,
      marketSentiment,
    };
  }

  function startPriceUpdates() {
    // Update prices every 30 seconds
    priceUpdateInterval = window.setInterval(() => {
      memecoinsList.value.forEach(memecoin => {
        fetchMemecoinPrice(memecoin.id);
      });
    }, 30000);
  }

  function stopPriceUpdates() {
    if (priceUpdateInterval) {
      window.clearInterval(priceUpdateInterval);
      priceUpdateInterval = null;
    }
  }

  return {
    memecoinsList,
    memecoinPrices,
    tradingVolume,
    isLoading,
    error,
    sortedMemecoins,
    fetchMemecoins,
    fetchMemecoinDetails,
    createMemecoin,
    fetchMemecoinPrice,
    fetchTradingVolume,
    updateMemecoinPrice,
    startPriceUpdates,
    stopPriceUpdates,
  };
}); 