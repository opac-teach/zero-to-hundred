import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  WalletResponseDto, 
  TransactionResponseDto, 
  TradeResponseDto, 
  MemecoinResponseDto 
} from '@/types/api';
import { wallet, trading } from '@/api/client';

export const useWalletStore = defineStore('wallet', () => {
  const walletData = ref<WalletResponseDto | null>(null);
  const transactions = ref<TransactionResponseDto[]>([]);
  const transactionPagination = ref<{ total: number; page: number; limit: number; totalPages: number }>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const balance = computed(() => walletData.value?.balance || 0);
  const holdings = computed(() => walletData.value?.holdings || []);

  async function fetchWallet() {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await wallet.getWallet();
      walletData.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch wallet';
      throw err;
    } finally {
      isLoading.value = false;
    }
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
      error.value = err.response?.data?.message || 'Failed to fetch transactions';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function updateBalance(newBalance: number) {
    if (walletData.value) {
      walletData.value.balance = newBalance;
    }
  }

  function updateHolding(memecoinId: string, amount: number, valueUsd: number, memecoin: MemecoinResponseDto) {
    if (!walletData.value) return;

    const holdingIndex = walletData.value.holdings.findIndex(h => h.memecoinId === memecoinId);
    if (holdingIndex === -1) {
      // Add new holding
      walletData.value.holdings.push({
        id: crypto.randomUUID(), // Use a proper UUID instead of timestamp
        walletId: walletData.value.id,
        memecoinId,
        amount,
        valueUsd,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memecoin,
      });
    } else {
      // Update existing holding
      walletData.value.holdings[holdingIndex].amount = amount;
      walletData.value.holdings[holdingIndex].valueUsd = valueUsd;
      walletData.value.holdings[holdingIndex].updatedAt = new Date().toISOString();
      walletData.value.holdings[holdingIndex].memecoin = memecoin;
    }
  }

  async function trade(memecoinId: string, amount: number, slippageTolerance: number = 1) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await trading.buy({
        memecoinId,
        amount,
        slippageTolerance,
      });
      
      // Update wallet state based on trade response
      const tradeResponse = response.data;
      updateBalance(tradeResponse.newBalance);
      updateHolding(
        memecoinId,
        tradeResponse.newHoldingAmount,
        tradeResponse.totalValue,
        {} as MemecoinResponseDto // This should be fetched from the memecoin store
      );
      
      // Fetch fresh wallet data to ensure consistency
      await fetchWallet();
      return tradeResponse;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to execute trade';
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
    balance,
    holdings,
    fetchWallet,
    fetchTransactions,
    updateBalance,
    updateHolding,
    trade,
  };
}); 