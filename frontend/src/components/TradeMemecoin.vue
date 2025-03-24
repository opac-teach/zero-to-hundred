<template>
  <Card>
    <CardHeader>
      <CardTitle>Trade {{ memecoin?.symbol }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="space-y-4">
          <div class="flex text-sm font-medium items-center">
            <label class="flex-1">Amount to {{ tradeType }}</label>

            <Button
              v-if="tradeType == 'sell'"
              variant="ghost"
              @click="tradeAmount = walletHolding?.amount || '0'"
              class="mr-2"
            >
              Sell all
            </Button>
            <span class="text-sm text-gray-500"> Balance: {{ walletHolding?.amount || "0" }} </span>
          </div>
          <div class="relative items-center">
            <Input
              v-model="tradeAmount"
              type="number"
              min="0"
              step="0.000001"
              :class="{ 'border-red-500': tradeAmountError }"
            />
            <span
              class="absolute end-0 inset-y-0 flex items-center justify-center px-2 font-medium"
            >
              {{ memecoin?.symbol }}
            </span>
          </div>
          <div class="flex text-sm font-medium items-center">
            <label class="flex-1">
              {{ tradeType == "buy" ? "Pay" : "Receive" }}
            </label>
            <span class="text-sm text-gray-500">
              Balance: {{ walletData?.zthBalance || "0" }}
            </span>
          </div>
          <div class="relative items-center">
            <Input :value="tradeEstimation?.cost" disabled type="number" />
            <span
              class="absolute end-0 inset-y-0 flex items-center justify-center px-2 font-medium"
            >
              ZTH
            </span>
          </div>
          <p v-if="tradeAmountError" class="text-sm text-red-500">{{ tradeAmountError }}</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium">Slippage Tolerance</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info :size="16" /></TooltipTrigger>
                  <TooltipContent>
                    <p>
                      The slippage tolerance is the maximum percentage difference between the
                      expected price and the price at which the trade is executed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span class="text-sm text-gray-500">{{ slippageTolerance }}%</span>
          </div>
          <Input
            v-model="slippageTolerance"
            type="range"
            min="0"
            max="30"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div class="flex justify-between space-x-3">
          <Button
            variant="outline"
            size="sm"
            @click="tradeType = 'buy'"
            :class="{
              'bg-green-400 text-primary-foreground': tradeType == 'buy',
            }"
            class="w-full hover:bg-green-200"
          >
            Buy
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="tradeType = 'sell'"
            :class="{ 'bg-red-400 text-primary-foreground': tradeType == 'sell' }"
            class="w-full hover:bg-red-200"
            >Sell</Button
          >
        </div>
        <div class="flex space-x-3">
          <Button
            variant="default"
            class="flex-1"
            @click="handleTrade()"
            :disabled="!isTradeFormValid || isLoading || tradeAmount == '0'"
          >
            {{ isLoading ? "Processing..." : "Trade" }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useWalletStore } from "@/stores/wallet";
import { useToast } from "vue-toastification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TradeEstimationResponseDto } from "@/api";
import { trading } from "@/api/client";
import type { MemecoinResponseDto } from "@/api";

const { memecoin } = defineProps<{
  memecoin?: MemecoinResponseDto;
}>();

const walletStore = useWalletStore();
const toast = useToast();

const walletData = computed(() => walletStore.walletData);
const walletHolding = computed(() =>
  walletStore.holdings.find((holding) => holding.memecoinId === memecoin?.id)
);
const tradeAmount = ref("0");
const slippageTolerance = ref("5");
const isLoading = ref(false);
const tradeEstimation = ref<TradeEstimationResponseDto | null>(null);
const tradeType = ref<"buy" | "sell">("buy");

// Validation state
const tradeAmountError = ref("");

// Computed properties for validation
const isTradeAmountValid = computed(() => {
  const amount = parseFloat(tradeAmount.value);
  return !isNaN(amount) && amount > 0;
});

const isSlippageValid = computed(() => {
  const slippage = parseFloat(slippageTolerance.value);
  return !isNaN(slippage) && slippage >= 0 && slippage <= 30;
});

const isTradeFormValid = computed(() => {
  return isTradeAmountValid.value && isSlippageValid.value;
});

watch(
  [tradeAmount, tradeType, walletHolding],
  ([newTradeAmount, newTradeType, newWalletHolding]) => {
    if (!newTradeAmount) return;
    tradeEstimation.value = null;
    tradeAmountError.value = "";

    const amount = parseFloat(newTradeAmount);
    if (isNaN(amount)) {
      tradeAmountError.value = "Please enter a valid number";
      return false;
    }
    if (
      newTradeType == "sell" &&
      (!newWalletHolding || Number(newTradeAmount) > Number(newWalletHolding?.amount))
    ) {
      tradeAmountError.value = "Insufficient balance";
      return false;
    }

    if (!memecoin) return;
    trading
      .estimate({
        memecoinId: memecoin.id,
        amount: newTradeAmount,
        requestCost: memecoin.currentPrice,
        tradeType: newTradeType,
      })
      .then((response) => {
        tradeEstimation.value = response.data;

        if (
          newTradeType == "buy" &&
          Number(tradeEstimation.value?.cost) > Number(walletData.value?.zthBalance)
        ) {
          tradeAmountError.value = "Insufficient balance";
          return false;
        }
      });
  }
);

async function handleTrade() {
  if (!memecoin || !tradeAmount.value) return;

  try {
    isLoading.value = true;

    if (!tradeEstimation.value) {
      throw new Error("Trade estimation not found");
    }
    await walletStore.tradeMemecoin(
      memecoin.id,
      tradeAmount.value,
      tradeEstimation.value.cost,
      parseFloat(slippageTolerance.value),
      tradeType.value
    );

    tradeAmount.value = "0";
    toast.success(`Trade ${tradeType.value} executed successfully!`);
  } catch (error) {
    toast.error("Failed to execute trade. Please try again.");
  } finally {
    isLoading.value = false;
  }
}
</script>
