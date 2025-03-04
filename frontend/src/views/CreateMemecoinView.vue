<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Memecoin</h1>
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Cost: 1 ZTH
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Doge Coin"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
            <input
              v-model="form.symbol"
              type="text"
              required
              maxlength="5"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., DOGE"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Describe your memecoin..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
          <div class="mt-1 flex items-center space-x-4">
            <img
              v-if="logoPreview"
              :src="logoPreview"
              alt="Logo Preview"
              class="w-16 h-16 rounded-full object-cover"
            />
            <button
              type="button"
              @click="handleLogoUpload"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Upload Logo
            </button>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleLogoChange"
            />
          </div>
        </div>
      </div>

      <!-- Bonding Curve Preview -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Bonding Curve Preview</h2>
        <div class="h-64">
          <canvas ref="curveCanvas"></canvas>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Price</label>
            <p class="mt-1 text-lg font-medium text-gray-900 dark:text-white">0.0001 ZTH</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Price at 1000 Supply</label>
            <p class="mt-1 text-lg font-medium text-gray-900 dark:text-white">0.1 ZTH</p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isLoading || !isValid"
          class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Creating...' : 'Create Memecoin' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMarketStore } from '@/stores/market';
import { useWalletStore } from '@/stores/wallet';
import { useToast } from 'vue-toastification';
import type { CreateMemecoinDto } from '@/types/api';

const router = useRouter();
const marketStore = useMarketStore();
const walletStore = useWalletStore();
const toast = useToast();

const form = ref<CreateMemecoinDto>({
  name: '',
  symbol: '',
  description: '',
  logoUrl: '',
});

const isLoading = ref(false);
const logoPreview = ref<string | null>(null);
const logoInput = ref<HTMLInputElement | null>(null);
const curveCanvas = ref<HTMLCanvasElement | null>(null);

const isValid = computed(() => {
  return (
    form.value.name.length >= 3 &&
    form.value.symbol.length >= 2 &&
    form.value.symbol.length <= 5 &&
    (form.value.description?.length ?? 0) >= 10
  );
});

function handleLogoUpload() {
  logoInput.value?.click();
}

function handleLogoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
      // In a real app, you would upload this to a server and get back a URL
      form.value.logoUrl = logoPreview.value;
    };
    reader.readAsDataURL(file);
  }
}

function drawBondingCurve() {
  const canvas = curveCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw axes
  ctx.beginPath();
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1;
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Draw curve
  ctx.beginPath();
  ctx.strokeStyle = '#4F46E5';
  ctx.lineWidth = 2;
  ctx.moveTo(padding, height - padding);

  for (let x = 0; x <= width - 2 * padding; x++) {
    const supply = (x / (width - 2 * padding)) * 1000;
    const price = (supply * supply) / 10000;
    const y = height - padding - (price / 0.1) * (height - 2 * padding);
    ctx.lineTo(x + padding, y);
  }

  ctx.stroke();
}

async function handleSubmit() {
  if (!isValid.value) {
    toast.error('Please fill in all required fields correctly');
    return;
  }

  try {
    isLoading.value = true;
    await marketStore.createMemecoin(form.value);
    toast.success('Memecoin created successfully! 🚀');
    router.push('/market');
  } catch (error: any) {
    toast.error(error.message || 'Failed to create memecoin');
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  drawBondingCurve();
});

// Redraw curve when window is resized
window.addEventListener('resize', drawBondingCurve);
</script> 