<template>
  <Mermaid v-if="isMermaid" :code="props.code" />
  <div v-else class="codeBlockFrame">
    <button
      class="copyCodeButton"
      type="button"
      :aria-label="copyLabel"
      :title="copyLabel"
      @click="copyCode"
    >
      <Icon v-if="copied" name="lucide:check" class="copyCodeIcon" aria-hidden="true" />
      <Icon v-else name="lucide:copy" class="copyCodeIcon" aria-hidden="true" />
    </button>
    <pre ref="preElement" :class="preClass"><slot /></pre>
  </div>
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

const preElement = ref<HTMLPreElement | null>(null)
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const preClass = computed(() => {
  return ['prosePre', props.class].filter(Boolean).join(' ')
})

const copyLabel = computed(() => {
  return copied.value ? 'Copied code' : 'Copy code'
})

async function copyCode() {
  const code = props.code || preElement.value?.textContent || ''

  if (!code) {
    return
  }

  try {
    await navigator.clipboard.writeText(code)
  }
  catch {
    return
  }

  copied.value = true

  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }

  copiedTimer = setTimeout(() => {
    copied.value = false
    copiedTimer = null
  }, 1600)
}

onBeforeUnmount(() => {
  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.codeBlockFrame {
  @apply relative my-8;
}

.copyCodeButton {
  @apply absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/10 text-code-text opacity-80 shadow-sm transition hover:bg-white/15 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft;
}

.copyCodeIcon {
  @apply size-4;
}

.prosePre {
  @apply m-0 overflow-x-auto rounded-lg bg-code-bg p-5 pr-16;
}

.prosePre :deep(code) {
  @apply bg-transparent p-0 text-sm leading-relaxed text-code-text;
}

.prosePre :deep(code .line) {
  @apply block;
}
</style>
