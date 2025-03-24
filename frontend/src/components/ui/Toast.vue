<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-0 right-0 z-50 p-4 sm:p-6"
    >
      <div
        :class="[
          'rounded-lg shadow-lg p-4 max-w-sm w-full',
          type === 'error' ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900',
          'border',
          type === 'error' ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'
        ]"
      >
        <div class="flex items-start">
          <div class="shrink-0">
            <component
              :is="type === 'error' ? ExclamationCircleIcon : CheckCircleIcon"
              :class="[
                'h-5 w-5',
                type === 'error' ? 'text-red-400 dark:text-red-300' : 'text-green-400 dark:text-green-300'
              ]"
            />
          </div>
          <div class="ml-3 w-0 flex-1">
            <p
              :class="[
                'text-sm font-medium',
                type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
              ]"
            >
              {{ message }}
            </p>
            <p
              v-if="description"
              :class="[
                'mt-1 text-sm',
                type === 'error' ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'
              ]"
            >
              {{ description }}
            </p>
          </div>
          <div class="ml-4 shrink-0 flex">
            <button
              @click="close"
              class="inline-flex rounded-md focus:outline-hidden focus:ring-2 focus:ring-offset-2"
              :class="[
                type === 'error'
                  ? 'focus:ring-red-500 focus:ring-offset-red-50 dark:focus:ring-offset-red-900'
                  : 'focus:ring-green-500 focus:ring-offset-green-50 dark:focus:ring-offset-green-900'
              ]"
            >
              <span class="sr-only">Close</span>
              <XMarkIcon class="h-5 w-5" :class="type === 'error' ? 'text-red-400 dark:text-red-300' : 'text-green-400 dark:text-green-300'" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ExclamationCircleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  message: string;
  description?: string;
  type?: 'error' | 'success';
  duration?: number;
}>();

const show = ref(true);
let timeout: number | null = null;

function close() {
  show.value = false;
}

onMounted(() => {
  if (props.duration) {
    timeout = window.setTimeout(close, props.duration);
  }
});

onUnmounted(() => {
  if (timeout) {
    window.clearTimeout(timeout);
  }
});
</script> 