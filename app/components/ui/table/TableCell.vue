<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <td :class="cn('px-4 py-3 align-middle text-foreground')">
    <slot />
  </td>
</template>
