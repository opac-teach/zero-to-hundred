<template>
  <div class="w-full h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import type { ChartData, ChartOptions } from 'chart.js';
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';

// Register the candlestick controller and elements
Chart.register(CandlestickController, CandlestickElement, OhlcElement);

interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const props = defineProps<{
  data: PriceData[];
  timeframe: '24h' | '7d' | '30d';
}>();

const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function createChart() {
  if (!chartRef.value) return;

  const ctx = chartRef.value.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }

  // Prepare data for candlestick chart
  const chartData: ChartData = {
    datasets: [
      {
        label: 'Price',
        data: props.data.map(d => ({
          x: new Date(d.timestamp).getTime(),
          o: d.open,
          h: d.high,
          l: d.low,
          c: d.close,
        })),
        borderColor: '#4F46E5',
        backgroundColor: '#4F46E5',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: props.timeframe === '24h' ? 'hour' : props.timeframe === '7d' ? 'day' : 'week',
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        position: 'right',
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const data = context.raw as { o: number; h: number; l: number; c: number };
            return [
              `Open: ${data.o.toFixed(6)} ZTH`,
              `High: ${data.h.toFixed(6)} ZTH`,
              `Low: ${data.l.toFixed(6)} ZTH`,
              `Close: ${data.c.toFixed(6)} ZTH`,
            ];
          },
        },
      },
    },
  };

  chart = new Chart(ctx, {
    type: 'candlestick',
    data: chartData,
    options,
  });
}

// Create chart on mount
onMounted(() => {
  createChart();
});

// Update chart when data changes
watch(() => props.data, () => {
  createChart();
}, { deep: true });

// Clean up on unmount
onUnmounted(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});
</script> 