<template>
  <Card>
    <CardContent class="pt-6">
      <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
        {{ title }}
      </h3>
      <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        {{ value }} {{ unit }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";

defineProps<{
  title: string;
  value?: string;
  unit?: string;
}>();
</script>
