<template>
  <pre :class="preClass"><slot /></pre>
</template>

<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array,
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
})

const preClass = computed(() => {
  return ['my-8 overflow-x-auto rounded-lg bg-code-bg p-5', props.class]
    .filter(Boolean)
    .join(' ')
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

pre :deep(code) {
  @apply bg-transparent p-0 text-sm leading-relaxed text-code-text;
}

pre :deep(code .line) {
  display: block;
}
</style>
