<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Memecoin</h1>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Token Informations</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
            <Input
              v-model="form.name"
              type="text"
              required
              @input="validateName"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500 dark:border-red-500': errors.name }"
              placeholder="e.g., Doge Coin"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.name }}
            </p>
          </div>
          <div>
            <Label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</Label>
            <Input
              v-model="form.symbol"
              type="text"
              required
              maxlength="5"
              @input="validateSymbol"
              class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-500 dark:border-red-500': errors.symbol }"
              placeholder="e.g., DOGE"
            />
            <p v-if="errors.symbol" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.symbol }}
            </p>
          </div>
        </div>

        <div>
          <Label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description <i>(Markdown supported)</i>
          </Label>
          <Textarea
            v-model="form.description"
            rows="3"
            @input="validateDescription"
            class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'border-red-500 dark:border-red-500': errors.description }"
            placeholder="Describe your memecoin..."
          />
          <p v-if="errors.description" class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ errors.description }}
          </p>
        </div>

        <div class="flex items-end space-x-4">
          <div class="flex-1">
            <Label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Logo URL</Label
            >
            <Input
              type="text"
              v-model="form.logoUrl"
              placeholder="https://example.com/logo.png"
              @input="validateLogoURL"
            />

            <p v-if="errors.logoUrl" class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ errors.logoUrl }}
            </p>
          </div>
          <Avatar :src="form.logoUrl" :alt="form.symbol" class="w-10 h-10" />
        </div>

        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Curve Configuration</h2>

        <div class="flex justify-between items-center space-x-4">
          <Label for="slope" class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Slope</Label
          >
          <span>{{ form.curveConfig.slope }}</span>
        </div>
        <Input
          id="slope"
          v-model="form.curveConfig.slope"
          type="range"
          :min="form.curveConfig.curveType == 'exponential' ? 0 : 0"
          :max="form.curveConfig.curveType == 'exponential' ? 2 : 10"
          :step="form.curveConfig.curveType == 'exponential' ? 0.1 : 0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div class="flex justify-between items-center space-x-4">
          <Label
            for="startingPrice"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >Starting Price</Label
          >
          <span>{{ form.curveConfig.startingPrice }}</span>
        </div>
        <Input
          id="startingPrice"
          v-model="form.curveConfig.startingPrice"
          type="range"
          min="0.0"
          max="100"
          step="0.5"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <div class="flex justify-between space-x-3">
          <Button
            :variant="form.curveConfig.curveType == 'linear' ? 'default' : 'outline'"
            size="sm"
            @click="form.curveConfig.curveType = 'linear'"
            class="w-full"
          >
            Linear
          </Button>
          <Button
            :variant="form.curveConfig.curveType == 'exponential' ? 'default' : 'outline'"
            size="sm"
            @click="form.curveConfig.curveType = 'exponential'"
            class="w-full"
            >Exponential</Button
          >
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end items-center space-x-4">
          <div class="text-sm text-red-500" v-if="!sufficientBalance">Not enough ZTH Balance</div>
          <div class="text-sm text-gray-500">Cost: 1 ZTH</div>

          <button
            type="submit"
            :disabled="isLoading || !isValid || !sufficientBalance"
            class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? "Creating..." : "Create Memecoin" }}
          </button>
        </div>
      </div>

      <BondingCurvePreview :curveConfig="form.curveConfig" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useMarketStore } from "@/stores/market";
import { useToast } from "vue-toastification";
import type { CreateMemecoinDto } from "@/api/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import BondingCurvePreview from "@/components/charts/BondingCurvePreview.vue";
import { useWalletStore } from "@/stores/wallet";
import Avatar from "@/components/Logo.vue";

const router = useRouter();
const marketStore = useMarketStore();
const toast = useToast();
const walletStore = useWalletStore();
const sufficientBalance = computed(
  () => walletStore.walletData && Number(walletStore.walletData?.zthBalance) >= 1
);

const form = ref<CreateMemecoinDto>({
  name: "",
  symbol: "",
  description: "",
  logoUrl: "",
  curveConfig: {
    slope: "2",
    startingPrice: "1",
    curveType: "linear",
  },
});

const errors = ref({
  name: "",
  symbol: "",
  description: "",
  logoUrl: "",
});

const isLoading = ref(false);

const isValid = computed(() => {
  return (
    form.value.name.length >= 3 &&
    form.value.symbol.length >= 2 &&
    form.value.symbol.length <= 5 &&
    /^[A-Z0-9]+$/.test(form.value.symbol) &&
    (form.value.description?.length ?? 0) >= 10 &&
    !errors.value.name &&
    !errors.value.symbol &&
    !errors.value.description
  );
});

function validateName() {
  if (form.value.name.length < 3) {
    errors.value.name = "Name must be at least 3 characters long";
  } else {
    errors.value.name = "";
  }
}

function validateSymbol() {
  form.value.symbol = form.value.symbol.toUpperCase();
  if (form.value.symbol.length < 2) {
    errors.value.symbol = "Symbol must be at least 2 characters long";
  } else if (form.value.symbol.length > 5) {
    errors.value.symbol = "Symbol must be at most 5 characters long";
  } else if (!/^[A-Z0-9]+$/.test(form.value.symbol)) {
    errors.value.symbol = "Symbol must contain only uppercase letters and numbers";
  } else {
    errors.value.symbol = "";
  }
}

function validateDescription() {
  if ((form.value.description?.length ?? 0) < 10) {
    errors.value.description = "Description must be at least 10 characters long";
  } else {
    errors.value.description = "";
  }
}

function validateLogoURL() {
  if (
    form.value.logoUrl &&
    form.value.logoUrl.length > 0 &&
    !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(form.value.logoUrl)
  ) {
    errors.value.logoUrl = "Invalid logo URL";
  } else {
    errors.value.logoUrl = "";
  }
}
async function handleSubmit() {
  if (!isValid.value) {
    toast.error("Please fill in all required fields correctly");
    return;
  }

  try {
    isLoading.value = true;
    const data = form?.value;
    // Filter out empty string values from data
    Object.keys(data).forEach((key) => {
      if (data[key] === "") {
        delete data[key];
      }
    });
    await marketStore.createMemecoin(form.value);
    toast.success("Memecoin created successfully! 🎉");
    router.push("/memecoins");
  } catch (error: any) {
    toast.error(error.message || "Failed to create memecoin");
  } finally {
    isLoading.value = false;
  }
}
</script>
