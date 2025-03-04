import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TransactionResponseDto } from '@/types/api';

interface TradeStats {
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  totalHoldings: number;
  change24h: number;
  bestTrade: {
    memecoinId: string;
    memecoinName: string;
    profit: number;
    date: string;
  };
  averageHoldingTime: number;
  tradingFrequency: number;
}

export const useTradingStore = defineStore('trading', () => {
  const transactions = ref<TransactionResponseDto[]>([]);
  const stats = ref<TradeStats>({
    totalTrades: 0,
    winRate: 0,
    averageReturn: 0,
    totalHoldings: 0,
    change24h: 0,
    bestTrade: {
      memecoinId: '',
      memecoinName: '',
      profit: 0,
      date: '',
    },
    averageHoldingTime: 0,
    tradingFrequency: 0,
  });

  function calculateStats() {
    if (transactions.value.length === 0) return;

    // Calculate total trades
    stats.value.totalTrades = transactions.value.length;

    // Calculate win rate
    const winningTrades = transactions.value.filter(t => t.totalValue > 0).length;
    stats.value.winRate = (winningTrades / stats.value.totalTrades) * 100;

    // Calculate average return
    const totalProfit = transactions.value.reduce((sum, t) => sum + t.totalValue, 0);
    stats.value.averageReturn = totalProfit / stats.value.totalTrades;

    // Find best trade
    const bestTrade = transactions.value.reduce((best, current) => 
      current.totalValue > best.totalValue ? current : best
    );
    stats.value.bestTrade = {
      memecoinId: bestTrade.memecoinId,
      memecoinName: bestTrade.memecoin.symbol,
      profit: bestTrade.totalValue,
      date: bestTrade.createdAt,
    };

    // Calculate average holding time
    const holdingTimes = transactions.value
      .filter(t => t.type === 'sell')
      .map(t => {
        const buyTransaction = transactions.value.find(
          bt => bt.memecoinId === t.memecoinId && bt.type === 'buy' && new Date(bt.createdAt) < new Date(t.createdAt)
        );
        if (!buyTransaction) return 0;
        return new Date(t.createdAt).getTime() - new Date(buyTransaction.createdAt).getTime();
      })
      .filter(t => t > 0);
    
    if (holdingTimes.length > 0) {
      const averageHoldingTimeMs = holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length;
      stats.value.averageHoldingTime = averageHoldingTimeMs / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate trading frequency (trades per day)
    const firstTrade = new Date(Math.min(...transactions.value.map(t => new Date(t.createdAt).getTime())));
    const lastTrade = new Date(Math.max(...transactions.value.map(t => new Date(t.createdAt).getTime())));
    const daysDiff = (lastTrade.getTime() - firstTrade.getTime()) / (1000 * 60 * 60 * 24);
    stats.value.tradingFrequency = stats.value.totalTrades / Math.max(1, daysDiff);

    // Calculate 24h change
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentTrades = transactions.value.filter(t => new Date(t.createdAt) > oneDayAgo);
    const recentProfit = recentTrades.reduce((sum, t) => sum + t.totalValue, 0);
    stats.value.change24h = recentProfit;
  }

  function addTransaction(transaction: TransactionResponseDto) {
    transactions.value.push(transaction);
    calculateStats();
  }

  function setTransactions(newTransactions: TransactionResponseDto[]) {
    transactions.value = newTransactions;
    calculateStats();
  }

  return {
    transactions,
    stats,
    addTransaction,
    setTransactions,
  };
}); 