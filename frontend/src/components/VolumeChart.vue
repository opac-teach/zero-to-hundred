<template>
  <div class="w-full h-full">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { ChartData, ChartOptions } from 'chart.js'

interface VolumeData {
  timestamp: string
  volume: number
}

const props = defineProps<{
  data: VolumeData[]
  timeframe: '24h' | '7d' | '30d'
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function createChart() {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy()
  }

  // Prepare data for volume chart
  const chartData: ChartData = {
    datasets: [
      {
        label: 'Volume',
        data: props.data.map(d => ({
          x: new Date(d.timestamp).getTime(),
          y: d.volume,
        })),
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4F46E5',
        borderWidth: 1,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  }

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
            const data = context.raw as { y: number }
            return `Volume: ${data.y.toFixed(2)} ZTH`
          },
        },
      },
    },
  }

  chart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options,
  })
}

// Create chart on mount
onMounted(() => {
  createChart()
})

// Update chart when data changes
watch(() => props.data, () => {
  createChart()
}, { deep: true })

// Clean up on unmount
onUnmounted(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script> 