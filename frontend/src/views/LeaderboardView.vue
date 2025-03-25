<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
    </div>

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
        <div class="shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
            Error loading leaderboard
          </h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Leaderboard Table -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Balance
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="(leaderboardUser, index) in leaderboard?.leaderboard"
                :key="leaderboardUser.user.id"
                class="hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-700 transition-colors"
                @click="$router.push(`/user/${leaderboardUser.user.username}`)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                      index + 1
                    }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <Avatar
                      :src="leaderboardUser.user.profilePictureUrl"
                      :alt="leaderboardUser.user.username"
                      class="h-10 w-10"
                    />
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ leaderboardUser.user.username }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ leaderboardUser.user.userTitle || "No name set" }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ leaderboardUser.user.wallet.zthBalance }} ZTH
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { users } from "@/api";
import { useToast } from "vue-toastification";
import type { LeaderboardDto } from "@/api";
import Avatar from "@/components/Logo.vue";

const userStore = useUserStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);

const leaderboard = ref<LeaderboardDto | null>(null);

// Fetch leaderboard data
async function fetchLeaderboard() {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await users.getLeaderboard(1, 100);
    const leaderboardData = response.data as LeaderboardDto;

    if (leaderboardData) {
      leaderboard.value = leaderboardData;
    } else {
      leaderboard.value = null;
      error.value = "Invalid response format from leaderboard API";
      console.error("Invalid response format from leaderboard API");
    }
  } catch (error: any) {
    leaderboard.value = null;
    error.value = error.message || "Failed to fetch leaderboard data";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
}

// Initial fetch
onMounted(fetchLeaderboard);
</script>
