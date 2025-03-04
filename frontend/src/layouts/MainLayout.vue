<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <div class="mr-4 flex">
          <!-- Logo -->
          <router-link to="/" class="mr-6 flex items-center space-x-2">
            <span class="font-bold text-xl text-primary">ZTH</span>
          </router-link>

          <!-- Navigation Links -->
          <nav class="flex items-center space-x-6 text-sm font-medium">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.href"
              class="transition-colors hover:text-foreground/80"
              :class="[
                route.path === item.href
                  ? 'text-foreground'
                  : 'text-foreground/60',
              ]"
            >
              {{ item.name }}
            </router-link>
          </nav>
        </div>

        <!-- Right side -->
        <div class="flex flex-1 items-center justify-end space-x-4">
          <!-- Theme toggle -->
          <Button
            variant="ghost"
            size="icon"
            @click="uiStore.toggleDarkMode"
          >
            <sun-icon v-if="uiStore.isDarkMode" class="h-4 w-4" />
            <moon-icon v-else class="h-4 w-4" />
          </Button>

          <!-- User menu -->
          <div v-if="userStore.isAuthenticated" class="flex items-center space-x-4">
            <!-- ZTH Balance -->
            <div class="text-sm font-medium">
              {{ walletStore.balance }} ZTH
            </div>

            <!-- Profile dropdown -->
            <DropdownMenu v-model:open="isProfileMenuOpen">
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="relative h-9 w-9 rounded-full">
                  <Avatar class="h-9 w-9">
                    <AvatarImage :src="userStore.currentUser?.profilePictureUrl || '/default-avatar.png'" :alt="userStore.currentUser?.username" />
                    <AvatarFallback>{{ userStore.currentUser?.username?.charAt(0).toUpperCase() }}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem as-child>
                  <router-link to="/profile" @click="isProfileMenuOpen = false">
                    Profile
                  </router-link>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <router-link to="/wallet" @click="isProfileMenuOpen = false">
                    Wallet
                  </router-link>
                </DropdownMenuItem>
                <DropdownMenuItem @click="handleLogout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Login/Register buttons -->
          <div v-else class="flex items-center space-x-4">
            <Button variant="ghost" as-child>
              <router-link to="/login">
                Login
              </router-link>
            </Button>
            <Button as-child>
              <router-link to="/register">
                Register
              </router-link>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container py-6">
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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