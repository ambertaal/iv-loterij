<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <tr :class="cn('border-b border-border/60 transition-colors hover:bg-secondary/40')">
    <slot />
  </tr>
</template>
