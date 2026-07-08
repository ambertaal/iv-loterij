<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { Check } from '@lucide/vue'
import { cn } from '~/lib/utils'

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <CheckboxRoot
    v-model:checked="model"
    :class="cn(
      'peer h-5 w-5 shrink-0 rounded-sm border border-input',
      'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'flex items-center justify-center'
    )"
  >
    <CheckboxIndicator>
      <Check class="h-3.5 w-3.5 text-primary-foreground" :stroke-width="3" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
