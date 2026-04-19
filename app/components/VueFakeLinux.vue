<template>
  <section class="vueFakeLinux">
    <div ref="shellRef" class="terminalShell">
      <div class="terminalStage">
        <div class="terminalProbe" aria-hidden="true">
          <span ref="probeCharRef" class="terminalProbeChar">00000000000000000000000000000000</span>
        </div>
        <ClientOnly>
          <EmbedosInitializingOverlay
            v-if="!isCrossOriginIsolated"
            :theme="initializingTheme"
          />
          <EmbedosTerminal
            v-else
            :auto-fetch="false"
            :reset-overlay-on-start="false"
            :config="runtimeConfig"
            :terminal="terminalOptions"
            @error="handleTerminalError"
            @ready="handleTerminalReady"
            @resize="handleTerminalResize"
          >
            <template #invite="{ launch, theme }">
              <EmbedosLaunchOverlay
                :theme="resolveLaunchTheme(theme)"
                @launch="launch"
              />
            </template>
            <template #initializing="{ theme }">
              <EmbedosInitializingOverlay :theme="theme" />
            </template>
          </EmbedosTerminal>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { debianBullseyeBusyboxRuntime } from "@embedos/debian-bullseye-busybox-runtime"
import { EmbedosTerminal, defaultTerminalSettings, defineRecipe } from "@embedos/vue"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import EmbedosInitializingOverlay from "~/components/EmbedosInitializingOverlay.vue"
import EmbedosLaunchOverlay from "~/components/EmbedosLaunchOverlay.vue"

const runtimeConfig = defineRecipe(debianBullseyeBusyboxRuntime, (base) => ({
  ...base,
  run: ["printf 'hello world\\n'; exec /bin/sh -i"],
  shell: ["/bin/sh", "-lc"],
}))

useCoiWorker()

const shellRef = ref<HTMLElement | null>(null)
const probeCharRef = ref<HTMLElement | null>(null)
const terminalFontSize = ref(12)
const isCrossOriginIsolated = ref(false)
let resizeObserver: ResizeObserver | null = null
let measureFrame = 0
let windowResizeHandler: (() => void) | null = null

const initializingTheme = {
  background: "#07120b",
  foreground: "#b7ffcf",
}

function clampFontSize(value: number): number {
  return Math.max(6, Math.min(18, Math.round(value * 100) / 100))
}

function updateShellSize() {
  const element = shellRef.value
  if (!element) {
    return
  }

  void element.clientWidth
  void element.clientHeight
}

function readProbeMetrics(): number | null {
  const element = probeCharRef.value
  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  const textLength = Math.max(1, element.textContent?.length ?? 1)
  const width = rect.width / textLength
  const height = rect.height

  if (width <= 0 || height <= 0) {
    return null
  }

  const shell = shellRef.value
  if (!shell) {
    return null
  }

  const availableWidth = Math.max(0, shell.clientWidth - 16)
  const availableHeight = Math.max(0, shell.clientHeight - 16)
  const widthRatio = width / 16
  const heightRatio = height / 16
  return clampFontSize(
    Math.min(
      availableWidth / (80 * widthRatio),
      availableHeight / (24 * heightRatio),
    ) * 0.97,
  )
}

function scheduleMeasurement() {
  if (!import.meta.client) {
    return
  }

  if (measureFrame !== 0) {
    window.cancelAnimationFrame(measureFrame)
  }

  measureFrame = window.requestAnimationFrame(() => {
    measureFrame = 0

    updateShellSize()

    const sample = readProbeMetrics()
    if (sample === null) {
      scheduleMeasurement()
      return
    }

    if (Math.abs(sample - terminalFontSize.value) >= 0.05) {
      terminalFontSize.value = sample
      return
    }
  })
}

const terminalOptions = computed(() => ({
  ...defaultTerminalSettings,
  fontSize: terminalFontSize.value,
  lineHeight: 1,
  theme: {
    background: "#07120b",
    foreground: "#b7ffcf",
    cursor: "#b7ffcf",
    black: "#07120b",
    red: "#ff6b6b",
    green: "#8af58c",
    yellow: "#fff08a",
    blue: "#78b7ff",
    magenta: "#d5a7ff",
    cyan: "#7fe8dd",
    white: "#dfffea",
  },
}))

function logTerminalEvent(event: string, details?: Record<string, unknown>) {
  if (!import.meta.dev) {
    return
  }

  console.debug("[vue-fake-linux]", event, details ?? {})
}

function handleTerminalReady() {
  logTerminalEvent("ready", {
    isolated: window.crossOriginIsolated,
  })
}

function handleTerminalError(error: Error) {
  logTerminalEvent("error", {
    message: error.message,
  })
}

function handleTerminalResize(size: { cols: number; rows: number }) {
  logTerminalEvent("resize", size)
}

function resolveLaunchTheme(
  theme: { background?: string | null; foreground?: string | null } | null | undefined,
): {
  background: string
  foreground: string
} {
  return {
    background: theme?.background ?? "#07120b",
    foreground: theme?.foreground ?? "#b7ffcf",
  }
}

onMounted(() => {
  isCrossOriginIsolated.value = window.crossOriginIsolated

  if (shellRef.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleMeasurement()
    })
    resizeObserver.observe(shellRef.value)
  }

  windowResizeHandler = () => {
    scheduleMeasurement()
  }
  window.addEventListener("resize", windowResizeHandler, { passive: true })

  scheduleMeasurement()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (windowResizeHandler) {
    window.removeEventListener("resize", windowResizeHandler)
    windowResizeHandler = null
  }

  if (measureFrame !== 0) {
    window.cancelAnimationFrame(measureFrame)
    measureFrame = 0
  }
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.vueFakeLinux {
  @apply flex w-full justify-center bg-surface px-4 py-6;
}

.terminalShell {
  @apply relative aspect-[4/3] w-full max-w-full overflow-hidden rounded-lg border border-edge bg-overlay shadow-2xl shadow-black/10;
}

.terminalStage {
  @apply absolute inset-0 p-2;
}

.terminalProbe {
  @apply absolute left-0 top-0 pointer-events-none whitespace-pre opacity-0 font-terminal text-base leading-none;
}

.terminalProbeChar {
  @apply whitespace-pre;
}

.terminalShell :deep(.embedos-terminal) {
  @apply relative h-full w-full;
}

.terminalShell :deep(.embedos-terminal__viewport) {
  @apply absolute inset-0 h-full w-full;
}

.terminalShell :deep(.embedos-terminal__overlay) {
  @apply absolute inset-0 z-10 flex h-full w-full;
}

.terminalShell :deep(.xterm-helper-textarea) {
  @apply opacity-0;
}

.terminalShell :deep(.xterm-width-cache-measure-container) {
  @apply opacity-0 pointer-events-none;
}
</style>
