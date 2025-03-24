<template>
  <div
    v-if="show"
    class="fixed top-0 left-0 right-0 z-50 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800"
  >
    <div class="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between flex-wrap">
        <div class="w-0 flex-1 flex items-center">
          <span class="flex p-2 rounded-lg bg-red-100 dark:bg-red-800">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600 dark:text-red-300" />
          </span>
          <p class="ml-3 font-medium text-sm text-red-800 dark:text-red-200">
            <span class="md:hidden">Network error</span>
            <span class="hidden md:inline">
              {{ message }}
            </span>
          </p>
        </div>
        <div class="order-3 mt-2 shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
          <button
            @click="retry"
            class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  message?: string;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

const show = ref(true);

function retry() {
  emit('retry');
  show.value = false;
}
</script> 