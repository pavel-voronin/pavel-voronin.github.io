<template>
  <code :class="codeClass">
    <slot />
  </code>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  class?: string | null
  variant?: 'inline' | 'title'
}>(), {
  class: null,
  variant: 'inline',
})

const codeClass = computed(() => {
  if (props.variant === 'title') {
    return props.class ? `${props.class} proseCodeTitle` : 'proseCodeTitle'
  }

  if (props.class) {
    return `${props.class} proseCodeBlock`
  }

  return 'proseCodeInline'
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.proseCodeInline {
  @apply rounded-sm bg-edge-light/60 px-1.5 py-0.5 text-sm text-subtle;
}

.proseCodeBlock {
  @apply text-sm leading-relaxed text-code-text;
}

.proseCodeTitle {
  @apply rounded-sm bg-edge-light/60 px-2 py-0.5 font-mono text-[0.72em] font-semibold leading-none text-subtle;
}
</style>
