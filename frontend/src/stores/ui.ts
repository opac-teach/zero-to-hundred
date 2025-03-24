import { setBaseUrl } from "@/api/client";
import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useUIStore = defineStore("ui", () => {
  const isDarkMode = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const isSidebarOpen = ref(false);
  const isMobile = ref(false);
  const hasCompletedOnboarding = ref(false);
  const useCustomAPI = ref("false");
  const customAPIURL = ref("");

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
    document.documentElement.classList.toggle("dark");
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

  const storedUrl = localStorage.getItem("customApiUrl");
  if (storedUrl) {
    customAPIURL.value = storedUrl;
  }
  const storedUsedCustomAPI = localStorage.getItem("usedCustomAPI");
  if (storedUsedCustomAPI) {
    useCustomAPI.value = storedUsedCustomAPI;
    if (useCustomAPI.value === "true") setBaseUrl(customAPIURL.value);
  }
  watch([useCustomAPI, customAPIURL], ([use, url]) => {
    if (use) setBaseUrl(url);
    localStorage.setItem("usedCustomAPI", use);
    localStorage.setItem("customApiUrl", url);
  });

  return {
    isDarkMode,
    isLoading,
    error,
    success,
    isSidebarOpen,
    isMobile,
    hasCompletedOnboarding,
    useCustomAPI,
    customAPIURL,
    toggleDarkMode,
    setLoading,
    setError,
    setSuccess,
    toggleSidebar,
    setMobile,
    setHasCompletedOnboarding,
  };
});
