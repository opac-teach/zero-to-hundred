<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <header
      class="sticky top-0 z-100 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
    >
      <div class="container flex h-14 items-center">
        <div class="mr-4 flex flex-1">
          <!-- Logo -->
          <router-link to="/" class="mr-6 flex items-center space-x-2">
            <span class="font-bold text-xl text-primary">ZTH</span>
          </router-link>

          <!-- Navigation Links -->
          <nav class="flex items-center gap-4 text-sm font-medium">
            <router-link
              v-for="item in navigationItems"
              :key="item.name"
              :to="item.href"
              class="transition-colors hover:text-foreground/80"
              :class="[route.path === item.href ? 'text-foreground' : 'text-foreground/60']"
            >
              {{ item.name }}
            </router-link>
          </nav>
        </div>

        <!-- Right side -->
        <div class="flex flex-1 items-center justify-end space-x-4">
          <!-- Theme toggle -->
          <Button variant="ghost" size="icon" @click="uiStore.toggleDarkMode">
            <sun-icon v-if="uiStore.isDarkMode" class="h-4 w-4" />
            <moon-icon v-else class="h-4 w-4" />
          </Button>

          <Select v-model="uiStore.useCustomAPI">
            <SelectTrigger class="w-[120px]">
              <SelectValue :value="uiStore.useCustomAPI" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="false">Default API</SelectItem>
                <SelectItem value="true" :disabled="!uiStore.customAPIURL">Custom API</SelectItem>
              </SelectGroup>
              <div class="p-1">
                <Label for="custom-api-url">Custom API URL</Label>
                <Input
                  id="custom-api-url"
                  v-model="uiStore.customAPIURL"
                  type="text"
                  placeholder="http://localhost:3000/api"
                />
              </div>
            </SelectContent>
          </Select>

          <!-- User menu -->
          <div v-if="userStore.isAuthenticated" class="flex items-center space-x-4">
            <!-- ZTH Balance -->
            <div class="text-sm font-medium">{{ walletStore.zthBalance }} ZTH</div>

            <!-- Profile dropdown -->
            <div class="relative">
              <Button
                variant="ghost"
                class="relative h-9 w-9 rounded-full"
                @click="isProfileMenuOpen = !isProfileMenuOpen"
              >
                <Avatar class="h-9 w-9">
                  <AvatarImage
                    :src="userStore.currentUser?.profilePictureUrl || '/default-avatar.svg'"
                    :alt="userStore.currentUser?.username"
                  />
                  <AvatarFallback>{{
                    userStore.currentUser?.username?.charAt(0).toUpperCase()
                  }}</AvatarFallback>
                </Avatar>
              </Button>
              <div
                v-if="isProfileMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-10"
              >
                <router-link
                  to="/user"
                  class="block px-4 py-2 hover:bg-accent cursor-pointer"
                  @click="isProfileMenuOpen = false"
                >
                  Profile
                </router-link>
                <router-link
                  to="/wallet"
                  class="block px-4 py-2 hover:bg-accent cursor-pointer"
                  @click="isProfileMenuOpen = false"
                >
                  Wallet
                </router-link>
                <button
                  class="w-full text-left px-4 py-2 hover:bg-accent cursor-pointer"
                  @click="handleLogout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Login/Register buttons -->
          <div v-else class="flex items-center space-x-4">
            <Button variant="ghost" as-child>
              <router-link to="/login"> Login </router-link>
            </Button>
            <Button as-child>
              <router-link to="/register"> Register </router-link>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useWalletStore } from "@/stores/wallet";
import { useUIStore } from "@/stores/ui";
import { SunIcon, MoonIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const walletStore = useWalletStore();
const uiStore = useUIStore();
const isProfileMenuOpen = ref(false);

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Memecoins", href: "/memecoins" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Create Memecoin", href: "/create-memecoin" },
];

async function handleLogout() {
  isProfileMenuOpen.value = false;
  await userStore.logout();
  router.push("/login");
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
