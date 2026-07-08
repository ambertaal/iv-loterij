<script setup lang="ts">
import { cn } from '~/lib/utils'
import { buttonVariants, type ButtonVariants } from '~/lib/variants/button'

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  as?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
  disabled: false
})
</script>

<template>
  <component
    :is="props.as"
    :disabled="props.disabled"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }))"
  >
    <slot />
  </component>
</template>
