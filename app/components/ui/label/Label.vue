<script setup lang="ts">
import { cn } from '~/lib/utils'

const props = defineProps<{ for?: string }>()
</script>

<template>
  <label :for="props.for" :class="cn('text-sm font-medium leading-none text-foreground')">
    <slot />
  </label>
</template>
