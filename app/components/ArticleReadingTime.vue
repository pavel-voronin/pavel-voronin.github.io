<template>
  <button
    type="button"
    class="readingTimeIndicator"
    :aria-label="ariaLabel"
    :aria-hidden="isReady ? undefined : 'true'"
    :title="titleText"
    :data-mode="isFastMode ? 'fast' : 'regular'"
    :data-ready="isReady ? 'true' : 'false'"
    :tabindex="isReady ? 0 : -1"
    @click="toggleMode"
  >
    <span class="readingTimeText">{{ displayedMinutes }} min</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  minutes: number
  fastMinutes: number
}>()

const READING_TIME_MODE_STORAGE_KEY = 'article-reading-time-mode'
const READING_TIME_FAST_MODE = 'fast'
const READING_TIME_REGULAR_MODE = 'regular'

const isReady = ref(false)
const isFastMode = ref(false)

const regularMinutes = computed(() => {
  return Math.max(1, Math.round(props.minutes))
})

const fastMinutes = computed(() => {
  return Math.max(1, Math.round(props.fastMinutes))
})

const displayedMinutes = computed(() => {
  return isFastMode.value ? fastMinutes.value : regularMinutes.value
})

const ariaLabel = computed(() => {
  return `Reading time: ${displayedMinutes.value} min`
})

const titleText = computed(() => {
  return isFastMode.value ? 'Fast reading' : 'Normal reading'
})

const readSavedMode = () => {
  try {
    return window.localStorage.getItem(READING_TIME_MODE_STORAGE_KEY)
  }
  catch {
    return null
  }
}

const saveMode = () => {
  try {
    window.localStorage.setItem(
      READING_TIME_MODE_STORAGE_KEY,
      isFastMode.value ? READING_TIME_FAST_MODE : READING_TIME_REGULAR_MODE,
    )
  }
  catch {
    // localStorage can be unavailable in private or restricted browser contexts.
  }
}

const toggleMode = () => {
  isFastMode.value = !isFastMode.value
  saveMode()
}

onMounted(() => {
  isFastMode.value = readSavedMode() === READING_TIME_FAST_MODE
  isReady.value = true
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.readingTimeIndicator {
  @apply inline-flex cursor-pointer items-center rounded-sm border-0 bg-transparent px-1.5 py-0.5 text-xs font-medium leading-none text-body opacity-100 transition-opacity duration-75 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent;
}

.readingTimeIndicator[data-ready="false"] {
  @apply pointer-events-none opacity-0;
}

.readingTimeIndicator[data-mode="fast"] {
  @apply italic;
}

.readingTimeText {
  @apply tabular-nums;
}
</style>
