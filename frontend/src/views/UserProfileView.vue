<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading profile</h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div class="px-6 py-8">
        <div class="flex items-center space-x-6">
          <img
            :src="user?.profilePictureUrl || '/default-avatar.svg'"
            :alt="user?.username"
            class="h-24 w-24 rounded-full object-cover"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user?.username }}</h1>
            <p class="text-gray-500 dark:text-gray-400">{{ user?.fullName || "No name set" }}</p>
          </div>
          <router-link to="/user/edit">
            <Button v-if="user?.id === userStore.currentUser?.id" class="flex-end">
              Edit profile
            </Button>
          </router-link>
        </div>

        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h2>
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">ZTH Balance</p>
                <p class="text-xl font-medium text-gray-900 dark:text-white">
                  {{ parseFloat(walletData?.zthBalance || "0").toLocaleString() }} ZTH
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p class="text-xl font-medium text-gray-900 dark:text-white">
                  {{ formatDate(user?.createdAt) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Rank</p>
                <p class="text-xl font-medium text-gray-900 dark:text-white">#N/A</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div v-if="transactions.length" class="space-y-4">
              <div
                v-for="transaction in transactions"
                :key="transaction.id"
                class="flex justify-between items-center"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ transaction.type }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(transaction.createdAt) }}
                  </p>
                </div>
                <p
                  class="text-sm font-medium"
                  :class="
                    transaction.type === 'BUY'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  "
                >
                  {{ transaction.type === "BUY" ? "+" : "-" }}{{ transaction.memeCoinAmount }}
                  {{ transaction.memecoin.symbol }}
                </p>
              </div>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { users, wallet } from "@/api/client";
import { useToast } from "vue-toastification";
import { usePageTitle } from "@/composables/usePageTitle";
import type { UserResponseDto, TransactionResponseDto, WalletResponseDto } from "@/types/api";
import { useUserStore } from "@/stores/user";
import { Button } from "@/components/ui/button";

const userStore = useUserStore();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const user = ref<UserResponseDto | null>(null);
const transactions = ref<TransactionResponseDto[]>([]);
const walletData = ref<WalletResponseDto | null>(null);

// Dynamic page title based on username
const { updateTitle } = usePageTitle(() =>
  user.value?.username ? `${user.value.username}'s Profile` : "User Profile"
);

// Update title when user data changes
watch(
  () => user.value,
  () => {
    if (user.value) {
      updateTitle();
    }
  },
  { immediate: true }
);

function formatDate(dateString?: string) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchUserProfile() {
  try {
    isLoading.value = true;
    error.value = null;
    const username = route.params.username as string;
    if (username) {
      // Use users.getAll and filter by ID since getById doesn't exist
      const response = await users.getByUsername(username);
      user.value = response.data;
    } else {
      const response = await users.getMyProfile();
      user.value = response.data;
    }
  } catch (error: any) {
    error.value = error.message || "Failed to fetch user profile";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
}

async function fetchWallet() {
  try {
    const response = await wallet.getWallet();
    walletData.value = response.data;
  } catch (error: any) {
    console.error("Failed to fetch wallet:", error);
  }
}

async function fetchTransactions() {
  try {
    const response = await wallet.getTransactions(1, 5); // Get last 5 transactions
    transactions.value = response.data;
  } catch (error: any) {
    console.error("Failed to fetch transactions:", error);
  }
}

onMounted(async () => {
  await Promise.all([fetchUserProfile(), fetchTransactions(), fetchWallet()]);
});
</script>
