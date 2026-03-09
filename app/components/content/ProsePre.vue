<template>
  <Mermaid v-if="isMermaid" :code="props.code" />
  <pre v-else :class="preClass"><slot /></pre>
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

const isMermaid = computed(() => {
  return props.language?.toLowerCase() === "mermaid"
})

const preClass = computed(() => {
  return ['prosePre', props.class].filter(Boolean).join(' ')
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.prosePre {
  @apply my-8 overflow-x-auto rounded-lg bg-code-bg p-5;
}

.prosePre :deep(code) {
  @apply bg-transparent p-0 text-sm leading-relaxed text-code-text;
}

.prosePre :deep(code .line) {
  @apply block;
}
</style>
