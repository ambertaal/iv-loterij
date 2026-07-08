<script setup lang="ts">
import { DialogContent, DialogOverlay, DialogPortal } from 'reka-ui'
import { cn } from '~/lib/utils'
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in" />
    <DialogContent
      :class="cn(
        'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
        'rounded-lg border border-border bg-card p-6 shadow-xl',
        'focus:outline-none'
      )"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
