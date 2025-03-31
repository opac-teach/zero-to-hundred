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
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading profile</h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-300">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="space-y-4">
      <Card class="">
        <CardContent class="flex items-center space-x-6">
          <Avatar
            :src="user?.profilePictureUrl"
            :alt="user?.username"
            class="h-16 w-16 md:h-24 md:w-24"
          />
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ user?.username }}</h1>
            <p class="text-gray-500 dark:text-gray-400">{{ user?.userTitle }}</p>
          </div>
          <router-link to="/user/edit">
            <Button v-if="user?.id === userStore.currentUser?.id" class="flex-end">
              Edit profile
            </Button>
          </router-link>
        </CardContent>
      </Card>

      <Card v-if="user?.description">
        <CardContent class="pt-6">
          <div v-html="description" class="prose max-w-none"></div>
        </CardContent>
      </Card>

      <!-- <Card>
      <CardHeader>
        <CardTitle>Trading Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</div>
              <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ tradingStore.stats.totalTrades }}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</div>
              <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ (tradingStore.stats.winRate || 0).toFixed(1) }}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Return</div>
              <div
                class="mt-1 text-2xl font-semibold"
                :class="
                  (tradingStore.stats.averageReturn || 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ (tradingStore.stats.averageReturn || 0).toFixed(2) }} ZTH
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Change</div>
              <div
                class="mt-1 text-2xl font-semibold"
                :class="
                  (tradingStore.stats.change24h || 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ tradingStore.stats.change24h >= 0 ? "+" : ""
                }}{{ tradingStore.stats.change24h.toFixed(2) }}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Best Trade</div>
              <div class="mt-1">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ tradingStore.stats.bestTrade.memecoinName }}
                </div>
                <div class="text-sm text-green-600 dark:text-green-400">
                  +{{ tradingStore.stats.bestTrade.profit }} ZTH
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ new Date(tradingStore.stats.bestTrade.date).toLocaleDateString() }}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Trading Activity
              </div>
              <div class="mt-1">
                <div class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ (tradingStore.stats.tradingFrequency || 0).toFixed(1) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">trades per day</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Avg. holding time:
                  {{ (tradingStore.stats.averageHoldingTime || 0).toFixed(1) }} days
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card> -->

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI title="ZTH Balance" :value="Number(walletStore.zthBalance).toFixed(2)" unit="ZTH" />
        <KPI title="Member Since" :value="formatDate(user?.createdAt)" />
        <KPI title="Rank" :value="user?.rank" prefix="#" />
        <!-- 
          <Card>
            <CardContent class="pt-6">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Total Holdings</span>
                <span class="font-medium text-gray-900 dark:text-white"
                  >{{ tradingStore.stats.totalHoldings }} ZTH</span
                >
              </div>
            </CardContent>
          </Card> -->
        <!-- <Card>
            <CardContent class="pt-6">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">24h Change</span>
                <span
                  :class="[
                    'font-medium',
                    tradingStore.stats.change24h >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  ]"
                >
                  {{ tradingStore.stats.change24h >= 0 ? "+" : ""
                  }}{{ tradingStore.stats.change24h.toFixed(2) }}%
                </span>
              </div>
            </CardContent>
          </Card> -->
      </div>

      <!-- Portfolio -->
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4" v-if="user?.wallet.holdings.length">
            <div
              v-for="holding in user?.wallet.holdings"
              :key="holding.id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
              @click="router.push(`/memecoins/${holding.memecoin.symbol}`)"
            >
              <div class="flex items-center space-x-4">
                <Avatar
                  :src="holding.memecoin.logoUrl"
                  :alt="holding.memecoin.symbol"
                  class="w-12 h-12"
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ holding.memecoin.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ holding.memecoin.symbol }}
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ Number(holding.amount).toFixed(2) }} {{ holding.memecoin.symbol }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ Number(holding.amount) * Number(holding.memecoin.currentPrice) }}
                  ZTH
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 dark:text-gray-400">Empty...</div>
        </CardContent>
      </Card>

      <!-- Activity -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Created Memecoins -->
        <Card>
          <CardHeader>Created Memecoins</CardHeader>
          <CardContent class="space-y-4 max-h-[600px] overflow-y-auto">
            <div
              v-if="createdMemecoins.length > 0"
              v-for="memecoin in user?.createdMemecoins"
              :key="memecoin.id"
              class="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              @click="router.push(`/memecoins/${memecoin.symbol}`)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <Avatar :src="memecoin.logoUrl" :alt="memecoin.symbol" />
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">
                      {{ memecoin.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ memecoin.symbol }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900 dark:text-white">
                    <p>
                      <span class="text-gray-500 dark:text-gray-400 italic">Price:</span>
                      {{ parseFloat(memecoin.currentPrice).toFixed(2) }} ZTH
                    </p>
                    <p>
                      <span class="text-gray-500 dark:text-gray-400 italic">Supply:</span>
                      {{ parseFloat(memecoin.totalSupply).toFixed(2) }}
                    </p>
                  </div>
                  <!-- <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ memecoin.volume24h }} ZTH 24h
                  </div> -->
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 dark:text-gray-400">
              Haven't created any coin yet, leecher !
            </div>
          </CardContent>
        </Card>

        <!-- Transactions -->
        <Card>
          <CardHeader>Transactions</CardHeader>
          <CardContent class="max-h-[600px] overflow-y-auto">
            <div v-if="user?.transactions?.length" class="space-y-4">
              <div
                v-for="transaction in user?.transactions"
                :key="transaction.id"
                class="flex justify-between items-center border-b last:border-b-0 pb-4"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ transaction.type }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(transaction.createdAt) }}
                  </p>
                </div>
                <div class="text-right">
                  <div v-if="transaction.type === 'CREATE'">
                    <p class="text-sm font-medium">{{ transaction.memecoin.symbol }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ transaction.memecoin.name }}
                    </p>
                  </div>
                  <div v-else class="text-right">
                    <p
                      class="text-sm font-medium"
                      :class="
                        transaction.type === 'BUY'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      "
                    >
                      {{ transaction.type === "BUY" ? "+" : "-" }}
                      {{ Number(transaction.memeCoinAmount).toFixed(2) }}
                      {{ transaction.memecoin.symbol }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ transaction.type === "BUY" ? "-" : "+" }}
                      {{ Number(transaction.zthAmount).toFixed(2) }} ZTH
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      @
                      {{ Number(transaction.price).toFixed(2) }}
                      {{ transaction.memecoin.symbol }}/ZTH
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-gray-500 dark:text-gray-400">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { users, wallet } from "@/api/client";
import { useToast } from "vue-toastification";
import { usePageTitle } from "@/composables/usePageTitle";
import type { UserProfileResponseDto, TransactionResponseDto, WalletResponseDto } from "@/api";
import { useUserStore } from "@/stores/user";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketStore } from "@/stores/market";
import { useWalletStore } from "@/stores/wallet";
import Avatar from "@/components/Logo.vue";
import KPI from "@/components/KPI.vue";
import { formatDate } from "@/utils/formatters";

const userStore = useUserStore();
const marketStore = useMarketStore();
const walletStore = useWalletStore();
const route = useRoute();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const router = useRouter();
const user = ref<UserProfileResponseDto | null>(null);

usePageTitle(user, (userValue) =>
  userValue?.username ? `${userValue.username}'s Profile` : "User Profile"
);

const description = computed(() => marked.parse(user.value?.description || ""));

async function fetchUserProfile() {
  try {
    isLoading.value = true;
    error.value = null;
    let username = route.params.username as string;
    if (!username) {
      username = userStore.currentUser?.username || "";
    }
    const response = await users.getByUsername(username);
    user.value = response.data as UserProfileResponseDto;
  } catch (error: any) {
    error.value = error.message || "Failed to fetch user profile";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
}

const createdMemecoins = computed(() =>
  marketStore.memecoinsList.filter((m) => m.creatorId === user.value?.id)
);

onMounted(async () => {
  await Promise.all([fetchUserProfile()]);
});
</script>
