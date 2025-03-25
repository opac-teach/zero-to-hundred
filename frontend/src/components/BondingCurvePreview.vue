<template>
  <Card class="">
    <CardHeader>
      <CardTitle>Bonding Curve Preview</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="h-64">
        <canvas ref="curveCanvas" class="w-full h-full"></canvas>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Initial Price</label
          >
          <p class="mt-1 text-lg font-medium text-gray-900 dark:text-white">{{ minPrice }} ZTH</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Price at {{ maxSupply }} Supply</label
          >
          <p class="mt-1 text-lg font-medium text-gray-900 dark:text-white">{{ maxPrice }} ZTH</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { calculatePrice, defaultCurveConfig, type BondingCurveConfig } from "@/lib/bonding-curve";
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Chart, type ChartData, type ChartDataset } from "chart.js/auto";

const {
  curveConfig = defaultCurveConfig,
  currentSupply,
  targetSupply,
} = defineProps<{
  curveConfig?: BondingCurveConfig;
  currentSupply?: string;
  targetSupply?: string;
}>();

const curveCanvas = ref<HTMLCanvasElement | null>(null);

const currentSupplyNumber = computed(() => (currentSupply ? Number(currentSupply) : null));
const maxSupply = computed(() => {
  if (targetSupply && Number(targetSupply) > (currentSupplyNumber.value || 0) * 4) {
    return Number(targetSupply) + 1;
  }
  return (currentSupplyNumber.value || 0) * 4 || 100;
});
const minPrice = computed(() => Number(calculatePrice(0, curveConfig || defaultCurveConfig)));
const maxPrice = computed(() =>
  Number(calculatePrice(maxSupply.value, curveConfig || defaultCurveConfig))
);
const maxPriceDisplayed = computed(() => maxPrice.value * 1.2);

let chart: Chart | null = null;
let resizeTimeout: number | null = null;

function debouncedCreateChart() {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout);
  }
  resizeTimeout = window.setTimeout(() => {
    createChart();
  }, 100);
}

function createChartData(): ChartData {
  const dataPoints = [];
  const labels = [];
  const numPoints = 100; // Number of points to plot

  for (let i = 0; i <= numPoints; i++) {
    const supply = (i / numPoints) * maxSupply.value;
    const price = Number(calculatePrice(supply, curveConfig || defaultCurveConfig));
    dataPoints.push(price);
    labels.push(supply.toFixed(0));
  }

  const datasets: ChartDataset[] = [
    {
      label: "Price",
      data: dataPoints,
      borderColor: "#4F46E5",
      tension: 0.4,
      pointStyle: false,
    },
  ];

  if (currentSupplyNumber.value !== null) {
    const datapoints = Array(numPoints + 1).fill(null);
    const currentSupplyAxis = Math.floor((currentSupplyNumber.value / maxSupply.value) * numPoints);
    datapoints[currentSupplyAxis] = Number(
      calculatePrice(currentSupplyNumber.value, curveConfig || defaultCurveConfig)
    );

    datasets.push({
      label: "Current",
      data: datapoints,
      pointBackgroundColor: "#EF4444",
      pointRadius: 6,
      showLine: false,
    });
  }

  if (targetSupply) {
    const datapoints = Array(numPoints + 1).fill(null);
    const targetSupplyAxis = Math.floor((Number(targetSupply) / maxSupply.value) * numPoints);
    datapoints[targetSupplyAxis] = Number(
      calculatePrice(Number(targetSupply), curveConfig || defaultCurveConfig)
    );
    datasets.push({
      label: "Target",
      data: datapoints,
      pointBackgroundColor: "#22c55e",
      pointRadius: 6,
      showLine: false,
    });
  }

  return {
    labels,
    datasets,
  };
}

function createChart() {
  const canvas = curveCanvas.value;
  if (!canvas) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(canvas, {
    type: "line",
    data: createChartData(),
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Supply",
          },
        },
        y: {
          title: {
            display: true,
            text: "Price (ZTH)",
          },
          suggestedMin: 0,
          suggestedMax: maxPriceDisplayed.value,
        },
      },
      interaction: {
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

onMounted(() => {
  debouncedCreateChart();
});

watch(
  [() => currentSupplyNumber.value, () => curveConfig, () => targetSupply],
  () => {
    debouncedCreateChart();
  },
  { deep: true }
);

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
});
</script>
