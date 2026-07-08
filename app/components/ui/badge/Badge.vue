<script setup lang="ts">
import { cn } from '~/lib/utils'
import { badgeVariants, type BadgeVariants } from '~/lib/variants/badge'

withDefaults(defineProps<{ variant?: BadgeVariants['variant'] }>(), { variant: 'default' })
</script>

<template>
  <span :class="cn(badgeVariants({ variant }))">
    <slot />
  </span>
</template>
