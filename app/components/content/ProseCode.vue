<template>
  <code :class="codeClass">
    <slot />
  </code>
</template>

<script setup lang="ts">
const props = defineProps({
  class: {
    type: String,
    default: null,
  },
})

const codeClass = computed(() => {
  if (props.class) {
    return `${props.class} text-sm leading-relaxed text-code-text`
  }

  return 'rounded-sm bg-edge-light/60 px-1.5 py-0.5 text-sm text-subtle'
})
</script>
