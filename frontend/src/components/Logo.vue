<template>
  <Avatar :class="props.class">
    <AvatarImage
      :src="
        (props.src && props.src !== '' && props.src) ||
        `https://picsum.photos/seed/${props.alt || 'default'}/60/60`
      "
      :alt="props.alt"
    />
    <AvatarFallback>{{ props.alt?.charAt(0).toUpperCase() }}</AvatarFallback>
  </Avatar>
</template>

<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
const props = defineProps<{
  src?: string;
  alt?: string;
  class?: string;
}>();
</script>
