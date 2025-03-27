<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <p class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ prefix }} {{ value }} {{ unit }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

defineProps<{
  title: string;
  value?: string | number;
  unit?: string;
  prefix?: string;
}>();
</script>
