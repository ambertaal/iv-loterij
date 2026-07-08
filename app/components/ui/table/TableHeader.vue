<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <thead :class="cn('border-b border-border')">
    <slot />
  </thead>
</template>
