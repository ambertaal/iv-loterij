<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <div :class="cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4')">
    <slot />
  </div>
</template>
