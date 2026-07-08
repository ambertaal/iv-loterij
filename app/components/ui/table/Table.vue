<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <div class="w-full overflow-x-auto">
    <table :class="cn('w-full caption-bottom text-sm')">
      <slot />
    </table>
  </div>
</template>
