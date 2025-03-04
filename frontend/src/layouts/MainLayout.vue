<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ZTH
              </router-link>
            </div>

            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                v-for="item in navigationItems"
                :key="item.name"
                :to="item.href"
                class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[
                  route.path === item.href
                    ? 'border-indigo-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300',
                ]"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center">
            <!-- Theme toggle -->
            <button
              @click="uiStore.toggleDarkMode"
              class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <sun-icon v-if="uiStore.isDarkMode" class="h-5 w-5" />
              <moon-icon v-else class="h-5 w-5" />
            </button>

            <!-- User menu -->
            <div v-if="userStore.isAuthenticated" class="ml-3 relative">
              <div class="flex items-center space-x-4">
                <!-- ZTH Balance -->
                <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ walletStore.balance }} ZTH
                </div>

                <!-- Profile dropdown -->
                <div class="relative">
                  <button
                    @click="isProfileMenuOpen = !isProfileMenuOpen"
                    class="flex items-center space-x-2 text-sm rounded-full focus:outline-none"
                  >
                    <img
                      :src="userStore.currentUser?.profilePictureUrl || '/default-avatar.png'"
                      :alt="userStore.currentUser?.username"
                      class="h-8 w-8 rounded-full"
                    />
                    <span class="text-gray-700 dark:text-gray-300">{{ userStore.currentUser?.username }}</span>
                    <chevron-down-icon class="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  <!-- Dropdown menu -->
                  <div
                    v-if="isProfileMenuOpen"
                    class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
                  >
                    <div class="py-1">
                      <router-link
                        to="/profile"
                        class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        @click="isProfileMenuOpen = false"
                      >
                        Profile
                      </router-link>
                      <router-link
                        to="/wallet"
                        class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        @click="isProfileMenuOpen = false"
                      >
                        Wallet
                      </router-link>
                      <button
                        @click="handleLogout"
                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Login/Register buttons -->
            <div v-else class="flex items-center space-x-4">
              <router-link
                to="/login"
                class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Login
              </router-link>
              <router-link
                to="/register"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Register
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view v-slot="slotProps">
        <transition name="fade" mode="out-in">
          <component :is="slotProps?.Component || defineComponent({ template: '<div>Loading...</div>' })" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useWalletStore } from '@/stores/wallet';
import { useUIStore } from '@/stores/ui';
import { SunIcon, MoonIcon, ChevronDownIcon } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const walletStore = useWalletStore();
const uiStore = useUIStore();
const isProfileMenuOpen = ref(false);

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Market', href: '/market' },
  { name: 'Leaderboard', href: '/leaderboard' },
  { name: 'Create Memecoin', href: '/create-memecoin' },
];

async function handleLogout() {
  isProfileMenuOpen.value = false;
  await userStore.logout();
  router.push('/login');
}
</script>

<style>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 