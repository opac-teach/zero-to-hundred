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

const currentSupplyNumber = computed(() => (currentSupply ? Number(currentSupply) : 0));
const maxSupply = computed(() => {
  if (targetSupply && Number(targetSupply) > currentSupplyNumber.value * 4) {
    return Number(targetSupply) + 1;
  }
  return currentSupplyNumber.value * 4 || 100;
});
const minPrice = computed(() => Number(calculatePrice(0, curveConfig || defaultCurveConfig)));
const maxPrice = computed(() =>
  Number(calculatePrice(maxSupply.value, curveConfig || defaultCurveConfig))
);
const maxPriceDisplayed = computed(() => maxPrice.value * 1.2);

let resizeTimeout: number | null = null;

function drawBondingCurve() {
  const canvas = curveCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.scale(dpr, dpr);
  const width = rect.width;
  const height = rect.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw axes
  ctx.beginPath();
  ctx.strokeStyle = "#6B7280";
  ctx.lineWidth = 1;
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.lineTo(width, height);
  ctx.stroke();

  // Draw labels
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "#6B7280";

  for (
    let price = 0;
    price <= maxPriceDisplayed.value;
    price += Math.max(1, maxPriceDisplayed.value / 10)
  ) {
    ctx.fillText(price.toFixed(2), 5, height - (price / maxPriceDisplayed.value) * height);
  }

  for (
    let supply = 0;
    supply <= maxSupply.value;
    supply += Math.max(1, Math.round(maxSupply.value / 10))
  ) {
    ctx.fillText(supply.toString(), (supply / maxSupply.value) * width, height - 5);
  }

  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#22c55e";

  ctx.fillText("Price", 5, 10);
  ctx.fillText("Supply", width - 38, height - 5);

  if (curveConfig.slope === "0" && curveConfig.startingPrice === "0") {
    ctx.fillText("Free Mooney", width / 2, height / 2);
  } else {
    // Draw cur ve
    ctx.beginPath();
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 2;

    const step = Math.max(1, Math.floor(width / 200)); // Limit number of points for better performance
    for (let drawCol = 0; drawCol <= width; drawCol += step) {
      const supply = (drawCol / width) * maxSupply.value;
      const price = Number(calculatePrice(supply, curveConfig || defaultCurveConfig));
      const x = (supply / maxSupply.value) * width;
      const y = height - (price / maxPriceDisplayed.value) * height;

      if (drawCol === 0) {
        ctx.moveTo(x, y);
      }
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  // Draw current supply point
  if (currentSupplyNumber.value > 0) {
    const currentPrice = Number(
      calculatePrice(currentSupplyNumber.value, curveConfig || defaultCurveConfig)
    );
    const currentX = (currentSupplyNumber.value / maxSupply.value) * width;
    const currentY = height - (currentPrice / maxPriceDisplayed.value) * height;
    ctx.fillStyle = "#EF4444";
    ctx.beginPath();
    ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("Current", currentX - 30, currentY - 10);
  }

  if (targetSupply) {
    const targetPrice = Number(calculatePrice(targetSupply, curveConfig || defaultCurveConfig));
    const targetX = (Number(targetSupply) / maxSupply.value) * width;
    const targetY = height - (targetPrice / maxPriceDisplayed.value) * height;
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(
      "Target",
      targetX + (Number(targetSupply) < currentSupplyNumber.value ? 5 : -30),
      targetY + 20
    );
  }
}

function debouncedDrawBondingCurve() {
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout);
  }
  resizeTimeout = window.setTimeout(() => {
    drawBondingCurve();
  }, 100);
}

onMounted(() => {
  debouncedDrawBondingCurve();
});

window.addEventListener("resize", debouncedDrawBondingCurve);

watch(
  [() => currentSupplyNumber.value, () => curveConfig, () => targetSupply],
  () => {
    debouncedDrawBondingCurve();
  },
  { deep: true }
);

onUnmounted(() => {
  window.removeEventListener("resize", debouncedDrawBondingCurve);
  if (resizeTimeout) {
    window.clearTimeout(resizeTimeout);
  }
});
</script>
