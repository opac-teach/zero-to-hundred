<script setup lang="ts">
import { onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'

const userStore = useUserStore()
const uiStore = useUIStore()

onMounted(() => {
  userStore.initializeFromStorage()
  // Apply dark mode class if needed
  if (uiStore.isDarkMode) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <main-layout />
</template>

<style>
/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--background));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.7);
}
</style>
