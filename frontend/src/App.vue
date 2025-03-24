<script setup lang="ts">
import { onMounted, watch } from "vue";
import MainLayout from "@/layouts/MainLayout.vue";
import { useUserStore } from "@/stores/user";
import { useUIStore } from "@/stores/ui";
import { useWalletStore } from "@/stores/wallet";

const userStore = useUserStore();
const uiStore = useUIStore();
const walletStore = useWalletStore();

// Initialize wallet when user is authenticated
watch(
  () => userStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      walletStore.initializeWallet();
    }
  },
  { immediate: true }
);

onMounted(() => {
  // Apply dark mode class if needed
  if (uiStore.isDarkMode) {
    document.documentElement.classList.add("dark");
  }
});
</script>

<template>
  <div class="min-h-screen w-full">
    <main-layout />
  </div>
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
