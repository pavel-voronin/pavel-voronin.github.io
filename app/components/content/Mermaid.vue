<template>
  <div class="mermaidRoot">
    <div v-if="errorMessage" class="mermaidError">
      {{ errorMessage }}
    </div>
    <div v-else class="mermaidSvg" v-html="svgMarkup" />
  </div>
</template>

<script setup lang="ts">
import mermaid from "mermaid"

let diagramCounter = 0

const props = defineProps({
  code: {
    type: String,
    default: "",
  },
  config: {
    type: [Object, String, Boolean, Number, Array],
    default: null,
  },
})

const svgMarkup = ref("")
const errorMessage = ref("")
const initialized = useState("mermaid-initialized", () => false)

const decodedCode = computed<string>(() => {
  if (!props.code) {
    return ""
  }

  try {
    return decodeURIComponent(props.code)
  } catch {
    return props.code
  }
})

const setupMermaid = () => {
  if (initialized.value) {
    return
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "default",
    flowchart: {
      htmlLabels: false,
    },
    themeVariables: {
      background: "transparent",
    },
  })

  initialized.value = true
}

const renderDiagram = async () => {
  if (!import.meta.client) {
    return
  }

  const source = decodedCode.value.trim()
  if (!source) {
    svgMarkup.value = ""
    errorMessage.value = ""
    return
  }

  setupMermaid()
  errorMessage.value = ""

  try {
    diagramCounter += 1
    const diagramId = `mermaid-${Date.now()}-${diagramCounter}`
    const { svg } = await mermaid.render(diagramId, source)
    svgMarkup.value = svg
  } catch {
    svgMarkup.value = ""
    errorMessage.value = "Failed to render Mermaid diagram."
  }
}

watch(
  decodedCode,
  () => {
    void renderDiagram()
  },
  { immediate: true },
)
</script>

<style scoped>
@reference "~/assets/css/main.css";

.mermaidRoot {
  @apply my-8 w-full overflow-x-auto flex justify-center;
}

.mermaidSvg :deep(svg) {
  @apply block h-auto max-w-full mx-auto bg-transparent;
}

.mermaidError {
  @apply rounded-lg border border-edge bg-edge-light px-4 py-3 text-sm text-subtle;
}
</style>
