<template>
  <NuxtLink
    :to="to"
    :href="href"
    :target="target"
    :external="external"
    :class="nuxtLink({ silent, noVisited, class: $attrs.class as string })"
  >
    <span v-if="$slots.left" class="icon">
      <slot name="left" />
    </span>
    <slot />
    <span v-if="$slots.right" class="icon">
      <slot name="right" />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  to?: string
  href?: string
  target?: string
  external?: boolean
  silent?: boolean
  noVisited?: boolean
}>()

const nuxtLink = tv({
  base: 'inline-flex items-baseline gap-1.5 underline underline-offset-2 text-accent hover:text-accent-soft',
  variants: {
    silent: {
      true: 'no-underline text-inherit hover:text-inherit',
    },
    noVisited: {
      true: 'no-visited',
    },
  },
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

a[href^="http"]:visited {
  color: var(--color-accent-soft);
}

a.no-visited:visited {
  color: inherit;
}

.icon {
  @apply flex shrink-0 self-center items-center *:size-[1em]
}
</style>
