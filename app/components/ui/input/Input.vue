<script setup lang="ts">
import { cn } from '~/lib/utils'

const model = defineModel<string>()

defineProps<{
  placeholder?: string
  type?: string
  disabled?: boolean
}>()
</script>

<template>
  <input
    v-model="model"
    :type="type || 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn(
      'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-40'
    )"
  >
</template>
