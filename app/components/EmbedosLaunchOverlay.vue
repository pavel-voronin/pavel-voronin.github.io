<template>
  <button
    class="embedosLaunchOverlay"
    aria-label="Download and launch"
    :style="overlayStyle"
    type="button"
    @click="$emit('launch')"
  >
    <span class="embedosLaunchOverlayMarker">
      <svg
        aria-hidden="true"
        class="embedosLaunchOverlayIcon"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 22.542c5.822 0 10.542-4.72 10.542-10.542S17.822 1.458 12 1.458S1.458 6.178 1.458 12S6.178 22.542 12 22.542" fill="#fff" />
        <path d="M12 19.792a10.54 10.54 0 0 1-10.45-9.167a10.541 10.541 0 1 0 20.9 0A10.54 10.54 0 0 1 12 19.792" fill="#e4f1f5" />
        <path d="M12 22.54c5.822 0 10.542-4.72 10.542-10.54c0-5.823-4.72-10.543-10.542-10.543S1.46 6.177 1.46 12S6.179 22.541 12 22.541" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9.455 15.792a.458.458 0 0 1-.664-.41V8.616a.46.46 0 0 1 .664-.41l6.767 3.383a.458.458 0 0 1 0 .82z" fill="#78eb7b" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  theme: {
    background: string
    foreground: string
  }
}>()

defineEmits<{
  launch: []
}>()

const overlayStyle = computed(() => ({
  "--embedos-launch-bg": props.theme.background,
  "--embedos-launch-fg": props.theme.foreground,
}))
</script>

<style scoped>
@reference "~/assets/css/main.css";

.embedosLaunchOverlay {
  @apply flex h-full w-full items-center justify-center bg-[var(--embedos-launch-bg)] text-[var(--embedos-launch-fg)] pointer-events-auto;
}

.embedosLaunchOverlayMarker {
  @apply relative flex items-center justify-center;
}

.embedosLaunchOverlayIcon {
  @apply h-[min(44vw,24rem)] w-[min(44vw,24rem)];
}

.embedosLaunchOverlayMarker :deep(svg) {
  @apply block;
}
</style>
