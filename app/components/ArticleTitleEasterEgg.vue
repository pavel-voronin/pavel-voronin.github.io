<template>
  <span
    class="titleEasterEgg"
    :data-state="state"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span ref="wordElement" class="titleEasterEggText">{{ visibleText }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
  replacement: string
  delayMs: number
  shakeMs: number
}>()

const wordElement = ref<HTMLElement | null>(null)
const visibleText = ref(props.text)
const hasPlayed = ref(false)
const isArmed = ref(false)
const isShaking = ref(false)
const state = computed(() => {
  if (hasPlayed.value) {
    return 'played'
  }

  if (isShaking.value) {
    return 'shaking'
  }

  if (isArmed.value) {
    return 'armed'
  }

  return 'idle'
})

let hoverTimer: ReturnType<typeof setTimeout> | null = null
let activeAnimation: Animation | null = null

const clearHoverTimer = () => {
  if (!hoverTimer) {
    return
  }

  clearTimeout(hoverTimer)
  hoverTimer = null
}

const createShakeKeyframes = (): Keyframe[] => {
  const middleFrames = 30
  const frames: Keyframe[] = [{ transform: 'translate3d(0, 0, 0)' }]

  for (let index = 1; index <= middleFrames; index += 1) {
    const progress = index / (middleFrames + 1)
    const amplitude = 5
    const offset = 1 - ((1 - progress) ** 1.7)
    const angle = Math.random() * Math.PI * 2
    const distance = amplitude * (0.3 + Math.random() * 0.7)
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    frames.push({
      offset,
      transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`,
    })
  }

  frames.push({ transform: 'translate3d(0, 0, 0)' })

  return frames
}

const finishAnimation = (animation: Animation) => {
  if (activeAnimation !== animation) {
    return
  }

  visibleText.value = props.replacement
  hasPlayed.value = true
  isShaking.value = false
  activeAnimation = null
}

const resetShake = () => {
  const animation = activeAnimation
  activeAnimation = null
  animation?.cancel()
  visibleText.value = props.text
  isArmed.value = false
  isShaking.value = false
}

const playShake = () => {
  if (hasPlayed.value || isShaking.value) {
    return
  }

  const element = wordElement.value
  if (!element) {
    return
  }

  isArmed.value = false
  isShaking.value = true

  const animation = element.animate(createShakeKeyframes(), {
    duration: props.shakeMs,
    easing: 'linear',
    fill: 'none',
    iterations: 1,
  })

  activeAnimation = animation

  animation.finished
    .then(() => {
      finishAnimation(animation)
    })
    .catch(() => {
      if (activeAnimation !== animation) {
        return
      }

      isShaking.value = false
      activeAnimation = null
    })
}

const handleMouseEnter = () => {
  if (hasPlayed.value || hoverTimer || isShaking.value) {
    return
  }

  isArmed.value = true
  hoverTimer = setTimeout(() => {
    hoverTimer = null
    playShake()
  }, props.delayMs)
}

const handleMouseLeave = () => {
  if (isShaking.value) {
    resetShake()
    return
  }

  if (!isArmed.value) {
    return
  }

  clearHoverTimer()
  isArmed.value = false
}

onBeforeUnmount(() => {
  clearHoverTimer()
  resetShake()
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.titleEasterEgg {
  @apply inline-block cursor-pointer;
}

.titleEasterEggText {
  @apply inline-block;
}

.titleEasterEgg[data-state="played"] {
  @apply cursor-text;
}
</style>
