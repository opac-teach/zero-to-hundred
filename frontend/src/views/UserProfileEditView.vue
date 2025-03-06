<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <Button @click="isEditing = !isEditing">
        {{ isEditing ? "Save Changes" : "Edit Profile" }}
      </Button>
    </div>

    <!-- Profile Banner -->
    <div class="relative h-48 rounded-lg overflow-hidden mb-8">
      <img
        :src="user?.bannerUrl || '/default-banner.jpg'"
        alt="Profile Banner"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <Button
        v-if="isEditing"
        variant="secondary"
        size="icon"
        class="absolute top-4 right-4"
        @click="handleImageUpload('banner')"
      >
        <camera-icon class="w-5 h-5" />
      </Button>
    </div>

    <!-- Profile Info -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Profile Picture -->
          <div class="relative">
            <Avatar class="w-32 h-32">
              <AvatarImage
                :src="user?.profilePictureUrl || '/default-avatar.png'"
                :alt="user?.username"
              />
              <AvatarFallback>{{ user?.username?.charAt(0).toUpperCase() }}</AvatarFallback>
            </Avatar>
            <Button
              v-if="isEditing"
              variant="secondary"
              size="icon"
              class="absolute bottom-0 right-0"
              @click="handleImageUpload('profile')"
            >
              <camera-icon class="w-5 h-5" />
            </Button>
          </div>

          <!-- Profile Details -->
          <div class="flex-1 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label>Username</Label>
                <Input v-if="isEditing" v-model="editedUser.username" type="text" />
                <p v-else class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ user?.username }}
                </p>
              </div>
              <div class="space-y-2">
                <Label>Full Name</Label>
                <Input v-if="isEditing" v-model="editedUser.fullName" type="text" />
                <p v-else class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ user?.fullName }}
                </p>
              </div>
            </div>

            <div class="space-y-2">
              <Label>Description</Label>
              <Textarea v-if="isEditing" v-model="editedUser.description" rows="3" />
              <p v-else class="text-gray-600 dark:text-gray-400">
                {{ user?.description || "No description yet" }}
              </p>
            </div>

            <!-- Theme Customization -->
            <div v-if="isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <Label>Background Color</Label>
                <Input v-model="editedUser.backgroundColor" type="color" class="h-10" />
              </div>
              <div class="space-y-2">
                <Label>Text Color</Label>
                <Input v-model="editedUser.textColor" type="color" class="h-10" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Statistics -->
    <Card>
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
                {{ winRate.toFixed(1) }}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Return</div>
              <div
                class="mt-1 text-2xl font-semibold"
                :class="
                  averageReturn >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ averageReturn.toFixed(2) }} ZTH
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">24h Change</div>
              <div
                class="mt-1 text-2xl font-semibold"
                :class="
                  change24h >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                {{ change24h >= 0 ? "+" : "" }}{{ change24h.toFixed(2) }}%
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
                  {{ tradingFrequency.toFixed(1) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">trades per day</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Avg. holding time: {{ averageHoldingTime.toFixed(1) }} days
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Portfolio Value -->
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Card>
            <CardContent class="pt-6">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">ZTH Balance</span>
                <span class="font-medium text-gray-900 dark:text-white"
                  >{{ walletStore.zthBalance }} ZTH</span
                >
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">Total Holdings</span>
                <span class="font-medium text-gray-900 dark:text-white"
                  >{{ tradingStore.stats.totalHoldings }} ZTH</span
                >
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-6">
              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-400">24h Change</span>
                <span
                  :class="[
                    'font-medium',
                    change24h >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  ]"
                >
                  {{ change24h >= 0 ? "+" : "" }}{{ change24h.toFixed(2) }}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>

    <!-- Created Memecoins -->
    <Card>
      <CardHeader>
        <CardTitle>Created Memecoins</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <Card v-for="memecoin in createdMemecoins" :key="memecoin.id">
            <CardContent class="pt-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      :src="memecoin.logoUrl || assetsStore.defaultMemecoinLogo"
                      :alt="memecoin.name"
                    />
                    <AvatarFallback>{{ memecoin.symbol }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ memecoin.name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ memecoin.symbol }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ parseFloat(memecoin.currentPrice).toFixed(6) }} ZTH
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ memecoin.volume24h }} ZTH 24h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useWalletStore } from "@/stores/wallet";
import { useMarketStore } from "@/stores/market";
import { useTradingStore } from "@/stores/trading";
import { useAssetsStore } from "@/stores/assets";
import { CameraIcon } from "@heroicons/vue/24/outline";
import { useToast } from "vue-toastification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserResponseDto, MemecoinResponseDto, UpdateUserDto } from "@/types/api";

const userStore = useUserStore();
const walletStore = useWalletStore();
const marketStore = useMarketStore();
const tradingStore = useTradingStore();
const assetsStore = useAssetsStore();
const toast = useToast();

const isEditing = ref(false);
const editedUser = ref<UpdateUserDto>({});
const createdMemecoins = ref<MemecoinResponseDto[]>([]);

const user = computed(() => userStore.currentUser);
const createdMemecoinsList = computed(() =>
  marketStore.memecoinsList.filter((m) => m.creatorId === user.value?.id)
);

// Add computed properties for stats
const change24h = computed(() => {
  const value = tradingStore.stats.change24h;
  return typeof value === "number" ? value : 0;
});

const averageReturn = computed(() => {
  const value = tradingStore.stats.averageReturn;
  return typeof value === "number" ? value : 0;
});

const winRate = computed(() => {
  const value = tradingStore.stats.winRate;
  return typeof value === "number" ? value : 0;
});

const tradingFrequency = computed(() => {
  const value = tradingStore.stats.tradingFrequency;
  return typeof value === "number" ? value : 0;
});

const averageHoldingTime = computed(() => {
  const value = tradingStore.stats.averageHoldingTime;
  return typeof value === "number" ? value : 0;
});

onMounted(async () => {
  try {
    await Promise.all([
      userStore.fetchProfile(),
      walletStore.fetchWallet(),
      marketStore.fetchMemecoins(),
      tradingStore.setTransactions(await walletStore.fetchTransactions()),
    ]);

    if (user.value) {
      editedUser.value = {
        username: user.value.username,
        fullName: user.value.fullName || "",
        description: user.value.description || "",
        backgroundColor: user.value.backgroundColor,
        textColor: user.value.textColor,
      };
    }

    createdMemecoins.value = createdMemecoinsList.value;
  } catch (error: any) {
    toast.error(error.message || "Failed to load profile data");
  }
});

const handleImageUpload = async (type: "profile" | "banner") => {
  // Implementation for image upload
  toast.info("Image upload functionality coming soon!");
};

const saveChanges = async () => {
  try {
    await userStore.updateProfile(editedUser.value);
    isEditing.value = false;
    toast.success("Profile updated successfully");
  } catch (error: any) {
    toast.error(error.message || "Failed to update profile");
  }
};
</script>

<style scoped>
/* Add any additional styles here */
</style>
