<template>
  <div
    class="embedosInitializingOverlay"
    aria-label="Initializing"
    :style="overlayStyle"
    role="status"
  >
    <div class="embedosInitializingOverlayIndicator" :style="indicatorStyle">
      <Icon
        aria-hidden="true"
        class="embedosInitializingOverlayIcon"
        :style="iconStyle"
        name="streamline-ultimate-color:cog"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import type { EmbedosTerminalTheme } from "@embedos/vue"

const props = defineProps<{
  theme: EmbedosTerminalTheme | null
}>()

const fallbackTheme = {
  background: "rgb(17 24 39)",
  foreground: "rgb(243 244 246)",
}

const resolvedTheme = computed(() => ({
  background: props.theme?.background ?? fallbackTheme.background,
  foreground: props.theme?.foreground ?? fallbackTheme.foreground,
}))
const rotation = ref(0)
const transitionDuration = ref(120)
const overlayStyle = computed(() => ({
  "--embedos-initializing-bg": resolvedTheme.value.background,
  "--embedos-initializing-fg": resolvedTheme.value.foreground,
}))
const indicatorStyle = computed(() => ({
  minHeight: "4rem",
  minWidth: "4rem",
}))
const iconStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg)`,
  transitionDuration: `${transitionDuration.value}ms`,
}))

let tickTimer: number | null = null

function scheduleNextTick(): void {
  transitionDuration.value = randomBetween(70, 150)
  tickTimer = window.setTimeout(() => {
    rotation.value += 15
    scheduleNextTick()
  }, randomBetween(90, 220))
}

function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min))
}

onMounted(() => {
  scheduleNextTick()
})

onBeforeUnmount(() => {
  if (tickTimer !== null) {
    window.clearTimeout(tickTimer)
    tickTimer = null
  }
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.embedosInitializingOverlay {
  @apply flex h-full w-full items-center justify-center bg-[var(--embedos-initializing-bg)] text-[var(--embedos-initializing-fg)] pointer-events-none select-none;
}

.embedosInitializingOverlayIndicator {
  @apply flex items-center justify-center;
}

.embedosInitializingOverlayIcon {
  @apply h-[min(44vw,24rem)] w-[min(44vw,24rem)] text-[var(--embedos-initializing-fg)] transition-transform ease-linear will-change-transform;
}

.embedosInitializingOverlayIcon :deep(svg) {
  @apply block;
}
</style>
