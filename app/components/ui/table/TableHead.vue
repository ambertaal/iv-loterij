<script setup lang="ts">
import { cn } from '~/lib/utils'
</script>

<template>
  <th :class="cn('h-10 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground')">
    <slot />
  </th>
</template>
