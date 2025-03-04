<template>
  <div class="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        {{ memecoin.name }} ({{ memecoin.symbol }})
      </h3>
      <div class="flex space-x-2">
        <button
          v-for="period in periods"
          :key="period"
          @click="selectedPeriod = period"
          :class="[
            'px-3 py-1 rounded-md text-sm font-medium',
            selectedPeriod === period
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ period }}
        </button>
      </div>
    </div>
    <div class="relative h-[300px]">
      <canvas ref="chartRef"></canvas>
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-75">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import type { MemecoinResponseDto } from '@/types/api';

const props = defineProps<{
  memecoin: MemecoinResponseDto;
}>();

const periods = ['24h', '7d', '30d'];
const selectedPeriod = ref('24h');
const chartRef = ref<HTMLCanvasElement | null>(null);
const chart = ref<Chart | null>(null);
const isLoading = ref(false);

// Mock data for demonstration
const generateMockData = (period: string) => {
  const now = new Date();
  const data = [];
  const labels = [];
  let interval: number;
  let count: number;

  switch (period) {
    case '24h':
      interval = 3600000; // 1 hour
      count = 24;
      break;
    case '7d':
      interval = 86400000; // 1 day
      count = 7;
      break;
    case '30d':
      interval = 86400000; // 1 day
      count = 30;
      break;
    default:
      interval = 3600000;
      count = 24;
  }

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval);
    labels.push(time.toLocaleTimeString());
    data.push(props.memecoin.currentPrice * (1 + Math.random() * 0.1 - 0.05));
  }

  return { labels, data };
};

function initChart() {
  if (!chartRef.value) return;

  const ctx = chartRef.value.getContext('2d');
  if (!ctx) return;

  const { labels, data } = generateMockData(selectedPeriod.value);

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Price (ZTH)',
          data,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#6B7280',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#6B7280',
          },
        },
      },
    },
  });
}

function updateChart() {
  if (!chart.value) return;

  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    const { labels, data } = generateMockData(selectedPeriod.value);
    chart.value!.data.labels = labels;
    chart.value!.data.datasets[0].data = data;
    chart.value!.update();
    isLoading.value = false;
  }, 500);
}

watch(selectedPeriod, () => {
  updateChart();
});

onMounted(() => {
  initChart();
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script> 