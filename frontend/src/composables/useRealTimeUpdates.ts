import { ref, onMounted, onUnmounted } from 'vue';
import { useMarketStore } from '@/stores/market';
import { useUIStore } from '@/stores/ui';

export function useRealTimeUpdates() {
  const marketStore = useMarketStore();
  const uiStore = useUIStore();

  // Price update interval (5 seconds)
  let priceInterval: number | null = null;
  // Trading volume update interval (1 minute)
  let volumeInterval: number | null = null;

  async function updatePrices() {
    try {
      // Update prices for all memecoins
      await Promise.all(
        marketStore.memecoinsList.map(memecoin => 
          marketStore.fetchMemecoinPrice(memecoin.id)
        )
      );
    } catch (error) {
      console.error('Failed to update prices:', error);
      uiStore.setError('Failed to update prices');
    }
  }

  async function updateTradingVolume() {
    try {
      await marketStore.fetchTradingVolume();
    } catch (error) {
      console.error('Failed to update trading volume:', error);
      uiStore.setError('Failed to update trading volume');
    }
  }

  function startUpdates() {
    // Start price updates
    priceInterval = window.setInterval(updatePrices, 5000);
    
    // Start trading volume updates
    volumeInterval = window.setInterval(updateTradingVolume, 60000);

    // Initial updates
    updatePrices();
    updateTradingVolume();
  }

  function stopUpdates() {
    if (priceInterval) {
      window.clearInterval(priceInterval);
      priceInterval = null;
    }
    if (volumeInterval) {
      window.clearInterval(volumeInterval);
      volumeInterval = null;
    }
  }

  onMounted(() => {
    startUpdates();
  });

  onUnmounted(() => {
    stopUpdates();
  });

  return {
    updatePrices,
    updateTradingVolume,
    startUpdates,
    stopUpdates,
  };
} 