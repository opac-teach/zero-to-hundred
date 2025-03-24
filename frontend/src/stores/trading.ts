import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { TransactionResponseDto } from "@/api";

interface TradeStats {
  totalTrades: number;
  winRate: number;
  averageReturn: number;
  totalHoldings: number;
  change24h: number;
  bestTrade: {
    memecoinId: string;
    memecoinName: string;
    profit: string;
    date: string;
  };
  averageHoldingTime: number;
  tradingFrequency: number;
}

export const useTradingStore = defineStore("trading", () => {
  const transactions = ref<TransactionResponseDto[]>([]);
  const stats = ref<TradeStats>({
    totalTrades: 0,
    winRate: 0,
    averageReturn: 0,
    totalHoldings: 0,
    change24h: 0,
    bestTrade: {
      memecoinId: "",
      memecoinName: "",
      profit: "0",
      date: "",
    },
    averageHoldingTime: 0,
    tradingFrequency: 0,
  });

  function calculateStats() {
    if (transactions.value.length === 0) {
      // Reset stats to default values when there are no transactions
      stats.value = {
        totalTrades: 0,
        winRate: 0,
        averageReturn: 0,
        totalHoldings: 0,
        change24h: 0,
        bestTrade: {
          memecoinId: "",
          memecoinName: "",
          profit: "0",
          date: "",
        },
        averageHoldingTime: 0,
        tradingFrequency: 0,
      };
      return;
    }

    // Calculate total trades
    stats.value.totalTrades = transactions.value.length;

    // Calculate win rate - assuming a winning trade is when zthAmount is positive for SELL transactions
    const sellTransactions = transactions.value.filter((t) => t.type === "SELL");
    const winningTrades = sellTransactions.filter((t) => parseFloat(t.zthAmount) > 0).length;
    stats.value.winRate =
      sellTransactions.length > 0 ? (winningTrades / sellTransactions.length) * 100 : 0;

    // Calculate average return
    if (sellTransactions.length > 0) {
      const totalProfit = sellTransactions.reduce((sum, t) => sum + parseFloat(t.zthAmount), 0);
      stats.value.averageReturn = totalProfit / sellTransactions.length;
    } else {
      stats.value.averageReturn = 0;
    }

    // Find best trade
    if (sellTransactions.length > 0) {
      const bestTrade = sellTransactions.reduce(
        (best, current) =>
          parseFloat(current.zthAmount) > parseFloat(best.zthAmount) ? current : best,
        sellTransactions[0]
      );

      stats.value.bestTrade = {
        memecoinId: bestTrade.memecoinId,
        memecoinName: bestTrade.memecoin.symbol,
        profit: bestTrade.zthAmount,
        date: bestTrade.createdAt,
      };
    }

    // Calculate average holding time
    const holdingTimes = transactions.value
      .filter((t) => t.type === "SELL")
      .map((t) => {
        const buyTransaction = transactions.value.find(
          (bt) =>
            bt.memecoinId === t.memecoinId &&
            bt.type === "BUY" &&
            new Date(bt.createdAt) < new Date(t.createdAt)
        );
        if (!buyTransaction) return 0;
        return new Date(t.createdAt).getTime() - new Date(buyTransaction.createdAt).getTime();
      })
      .filter((t) => t > 0);

    if (holdingTimes.length > 0) {
      const averageHoldingTimeMs =
        holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length;
      stats.value.averageHoldingTime = averageHoldingTimeMs / (1000 * 60 * 60 * 24); // Convert to days
    } else {
      stats.value.averageHoldingTime = 0;
    }

    // Calculate trading frequency (trades per day)
    if (transactions.value.length > 1) {
      const firstTrade = new Date(
        Math.min(...transactions.value.map((t) => new Date(t.createdAt).getTime()))
      );
      const lastTrade = new Date(
        Math.max(...transactions.value.map((t) => new Date(t.createdAt).getTime()))
      );
      const daysDiff = (lastTrade.getTime() - firstTrade.getTime()) / (1000 * 60 * 60 * 24);
      stats.value.tradingFrequency = stats.value.totalTrades / Math.max(1, daysDiff);
    } else {
      stats.value.tradingFrequency = 0;
    }

    // Calculate 24h change
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentTrades = transactions.value.filter((t) => new Date(t.createdAt) > oneDayAgo);

    if (recentTrades.length > 0) {
      const recentProfit = recentTrades.reduce((sum, t) => {
        // For BUY, subtract the ZTH amount (negative profit)
        // For SELL, add the ZTH amount (positive profit)
        return t.type === "BUY" ? sum - parseFloat(t.zthAmount) : sum + parseFloat(t.zthAmount);
      }, 0);

      stats.value.change24h = recentProfit;
    } else {
      stats.value.change24h = 0;
    }
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
