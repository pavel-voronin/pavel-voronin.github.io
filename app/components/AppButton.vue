<template>
  <AppLink :to="to" :href="href" :target="target" :class="appButton({ color })">
    <template v-if="$slots.left" #left>
      <slot name="left" />
    </template>
    <slot />
    <template v-if="$slots.right" #right>
      <slot name="right" />
    </template>
  </AppLink>
</template>

<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'

const appButton = tv({
  base: 'rounded-lg px-2.5 py-2.5 font-medium text-white no-underline transition-colors hover:no-underline hover:text-white select-none',
  variants: {
    color: {
      dark: 'bg-body hover:bg-subtle',
      red: 'bg-red-500 hover:bg-red-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
    },
  },
  defaultVariants: {
    color: 'dark',
  },
})

defineProps<{
  to?: string
  href?: string
  target?: string
  color?: VariantProps<typeof appButton>["color"]
}>()
</script>
