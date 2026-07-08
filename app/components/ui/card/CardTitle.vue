<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <h3 :class="cn('text-sm font-semibold uppercase tracking-wide text-muted-foreground')">
    <slot />
  </h3>
</template>
