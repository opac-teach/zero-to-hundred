<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <button
        @click="isEditing = !isEditing"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        {{ isEditing ? 'Save Changes' : 'Edit Profile' }}
      </button>
    </div>

    <!-- Profile Banner -->
    <div class="relative h-48 rounded-lg overflow-hidden mb-8">
      <img
        :src="user?.bannerUrl || '/default-banner.jpg'"
        alt="Profile Banner"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <button
        v-if="isEditing"
        @click="handleImageUpload('banner')"
        class="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <camera-icon class="w-5 h-5" />
      </button>
    </div>

    <!-- Profile Info -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Profile Picture -->
        <div class="relative">
          <img
            :src="user?.profilePictureUrl || '/default-avatar.png'"
            :alt="user?.username"
            class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800"
          />
          <button
            v-if="isEditing"
            @click="handleImageUpload('profile')"
            class="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <camera-icon class="w-5 h-5" />
          </button>
        </div>

        <!-- Profile Details -->
        <div class="flex-1 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                v-if="isEditing"
                v-model="editedUser.username"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p v-else class="mt-1 text-lg font-medium text-gray-900 dark:text-white">{{ user?.username }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                v-if="isEditing"
                v-model="editedUser.fullName"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p v-else class="mt-1 text-lg font-medium text-gray-900 dark:text-white">{{ user?.fullName }}</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              v-if="isEditing"
              v-model="editedUser.description"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            ></textarea>
            <p v-else class="mt-1 text-gray-600 dark:text-gray-400">{{ user?.description || 'No description yet' }}</p>
          </div>

          <!-- Theme Customization -->
          <div v-if="isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</label>
              <input
                v-model="editedUser.backgroundColor"
                type="color"
                class="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Text Color</label>
              <input
                v-model="editedUser.textColor"
                type="color"
                class="mt-1 block w-full h-10 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Trading Statistics</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ tradingStore.stats.totalTrades }}
          </div>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</div>
          <div class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {{ tradingStore.stats.winRate.toFixed(1) }}%
          </div>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Return</div>
          <div class="mt-1 text-2xl font-semibold" :class="tradingStore.stats.averageReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ tradingStore.stats.averageReturn.toFixed(2) }} ZTH
          </div>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Change</div>
          <div class="mt-1 text-2xl font-semibold" :class="tradingStore.stats.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ tradingStore.stats.change24h.toFixed(2) }} ZTH
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Best Trade</div>
          <div class="mt-1">
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ tradingStore.stats.bestTrade.memecoinName }}
            </div>
            <div class="text-sm text-green-600 dark:text-green-400">
              +{{ tradingStore.stats.bestTrade.profit.toFixed(2) }} ZTH
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ new Date(tradingStore.stats.bestTrade.date).toLocaleDateString() }}
            </div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Trading Activity</div>
          <div class="mt-1">
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ tradingStore.stats.tradingFrequency.toFixed(1) }}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              trades per day
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Avg. holding time: {{ tradingStore.stats.averageHoldingTime.toFixed(1) }} days
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio Value -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-6">Portfolio Value</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <span class="text-gray-600 dark:text-gray-400">ZTH Balance</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ walletStore.balance.toLocaleString() }} ZTH</span>
        </div>
        <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <span class="text-gray-600 dark:text-gray-400">Total Holdings</span>
          <span class="font-medium text-gray-900 dark:text-white">{{ tradingStore.stats.totalHoldings.toLocaleString() }} ZTH</span>
        </div>
        <div class="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <span class="text-gray-600 dark:text-gray-400">24h Change</span>
          <span :class="['font-medium', tradingStore.stats.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
            {{ tradingStore.stats.change24h >= 0 ? '+' : '' }}{{ tradingStore.stats.change24h.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Created Memecoins -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Created Memecoins</h3>
      <div class="space-y-4">
        <div v-for="memecoin in createdMemecoins" :key="memecoin.id" class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img :src="memecoin.logoUrl" :alt="memecoin.name" class="w-8 h-8 rounded-full" />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ memecoin.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ memecoin.symbol }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-medium text-gray-900 dark:text-white">{{ memecoin.currentPrice }} ZTH</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ memecoin.volume24h }} ZTH 24h</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useWalletStore } from '@/stores/wallet';
import { useMarketStore } from '@/stores/market';
import { useTradingStore } from '@/stores/trading';
import { CameraIcon } from '@heroicons/vue/24/outline';
import { useToast } from 'vue-toastification';
import type { User, Memecoin } from '@/types/api';

const userStore = useUserStore();
const walletStore = useWalletStore();
const marketStore = useMarketStore();
const tradingStore = useTradingStore();
const toast = useToast();

const isEditing = ref(false);
const user = ref<User | null>(null);
const editedUser = ref<Partial<User>>({});
const createdMemecoins = ref<Memecoin[]>([]);

onMounted(async () => {
  try {
    await Promise.all([
      userStore.fetchProfile(),
      walletStore.fetchWallet(),
      marketStore.fetchMemecoins(),
      tradingStore.setTransactions(await walletStore.fetchTransactions()),
    ]);

    user.value = userStore.currentUser;
    editedUser.value = { ...user.value };
    
    // Filter created memecoins
    createdMemecoins.value = marketStore.memecoinsList.filter(
      (m) => m.creatorId === user.value?.id
    );
  } catch (error: any) {
    toast.error(error.message || 'Failed to load profile data');
  }
});

async function handleImageUpload(type: 'profile' | 'banner') {
  // Implement image upload logic here
  toast.info('Image upload functionality coming soon!');
}

async function saveProfile() {
  try {
    await userStore.updateProfile(editedUser.value);
    user.value = userStore.currentUser;
    isEditing.value = false;
    toast.success('Profile updated successfully!');
  } catch (error: any) {
    toast.error(error.message || 'Failed to update profile');
  }
}
</script> 