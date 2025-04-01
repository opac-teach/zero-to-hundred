import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { MyUserResponseDto, UpdateUserDto } from "@/api";
import { auth, users } from "@/api/client";
import { useWalletStore } from "./wallet";
import { api } from "@/api/client";
import { generateRandomUsername } from "@/lib/randomProfile";
export const useUserStore = defineStore("user", () => {
  const currentUser = ref<MyUserResponseDto | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const walletStore = useWalletStore();

  const isAuthenticated = computed(() => !!token.value);

  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchProfile();
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
      const { accessToken } = response.data;

      setToken(accessToken);
      await fetchProfile();

      await walletStore.initializeWallet();

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || "Failed to login";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(email: string, password: string, userTitle?: string) {
    try {
      isLoading.value = true;
      error.value = null;

      // Generate random profile assets
      const randomUsername = generateRandomUsername();

      const response = await auth.register({
        email,
        password,
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

  initializeFromStorage();

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
    clearToken,
  };
});
