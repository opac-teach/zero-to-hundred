import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UserResponseDto, UpdateUserDto } from "@/types/api";
import { auth, users } from "@/api/client";
import { useAssetsStore } from "./assets";
import { useWalletStore } from "./wallet";
import { api } from "@/api/client";

export const useUserStore = defineStore("user", () => {
  const currentUser = ref<UserResponseDto | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const assetsStore = useAssetsStore();
  const walletStore = useWalletStore();

  const isAuthenticated = computed(() => !!token.value);

  // Initialize from localStorage
  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchProfile().catch(() => {
        // If profile fetch fails, clear the token
        clearToken();
      });
    }
  };

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem("token", newToken);
    // Update axios default headers
    if (newToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem("token");
    // Clear axios default headers
    delete api.defaults.headers.common["Authorization"];
  }

  async function login(email: string, password: string) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await auth.login({ email, password });
      const { accessToken, userId, username, email: userEmail } = response.data;

      setToken(accessToken);
      await fetchProfile();

      // Initialize wallet data after successful login
      await walletStore.initializeWallet();

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to login";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string, fullName?: string) {
    try {
      isLoading.value = true;
      error.value = null;

      // Generate random profile assets
      const randomUsername = assetsStore.generateRandomUsername();
      const randomAvatar = assetsStore.getRandomAvatar();
      const randomBanner = assetsStore.getRandomBanner();
      const randomTheme = assetsStore.getRandomTheme();

      const response = await auth.register({
        email,
        password,
        fullName,
        username: randomUsername,
      });

      // Set token after successful registration
      setToken(response.data.accessToken);

      // Fetch fresh profile data
      await fetchProfile();
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to register";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    clearToken();
    currentUser.value = null;
    walletStore.clearWallet();
  }

  async function fetchProfile() {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await users.getMyProfile();
      currentUser.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to fetch profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateProfile(data: UpdateUserDto) {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await users.updateProfile(data);
      currentUser.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to update profile";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    currentUser,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    initializeFromStorage,
    clearToken,
  };
});
