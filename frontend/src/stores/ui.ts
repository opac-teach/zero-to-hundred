import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUIStore = defineStore('ui', () => {
  const isDarkMode = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const isSidebarOpen = ref(false);
  const isMobile = ref(false);
  const hasCompletedOnboarding = ref(false);

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    document.documentElement.classList.toggle('dark');
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(message: string | null) {
    error.value = message;
  }

  function setSuccess(message: string | null) {
    success.value = message;
  }

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  function setMobile(isMobileView: boolean) {
    isMobile.value = isMobileView;
  }

  function setHasCompletedOnboarding(completed: boolean) {
    hasCompletedOnboarding.value = completed;
  }

  return {
    isDarkMode,
    isLoading,
    error,
    success,
    isSidebarOpen,
    isMobile,
    hasCompletedOnboarding,
    toggleDarkMode,
    setLoading,
    setError,
    setSuccess,
    toggleSidebar,
    setMobile,
    setHasCompletedOnboarding,
  };
}); 