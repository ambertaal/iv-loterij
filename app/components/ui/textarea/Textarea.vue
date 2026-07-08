<script setup lang="ts">
import { cn } from '~/lib/utils'

const model = defineModel<string>()

defineProps<{
  placeholder?: string
  rows?: number
}>()
</script>

<template>
  <textarea
    v-model="model"
    :placeholder="placeholder"
    :rows="rows || 6"
    :class="cn(
      'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground placeholder:font-sans',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'resize-y'
    )"
  />
</template>
