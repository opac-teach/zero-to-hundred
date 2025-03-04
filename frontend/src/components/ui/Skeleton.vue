<template>
  <div
    :class="[
      'animate-pulse rounded-md',
      variant === 'text' ? 'h-4' : '',
      variant === 'circle' ? 'h-12 w-12 rounded-full' : '',
      variant === 'rectangular' ? 'h-32' : '',
      variant === 'card' ? 'h-48' : '',
      className
    ]"
    :style="{
      backgroundColor: 'currentColor',
      opacity: 0.1,
    }"
  />
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'text' | 'circle' | 'rectangular' | 'card';
  className?: string;
}>();
</script> 