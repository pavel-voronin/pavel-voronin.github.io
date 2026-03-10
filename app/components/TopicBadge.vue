<template>
  <AppLink :to="toTopicPath(topic)" silent no-visited :class="badgeClass({ tone })">
    {{ topic }}
  </AppLink>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants'

const props = defineProps<{
  topic: string
  tone?: BadgeTone
}>()

const normalizeTopic = (value: string) => {
  return value.trim().toLowerCase()
}

type BadgeTone = 'default' | 'warm' | 'cool' | 'fresh' | 'accent'

const topicToneMap: Record<string, BadgeTone> = {
  ai: 'cool',
  'ai toolchain': 'cool',
}

const tone = computed<BadgeTone>(() => {
  if (props.tone) {
    return props.tone
  }

  return topicToneMap[normalizeTopic(props.topic)] ?? 'default'
})

const toTopicPath = (topic: string) => {
  return `/topics/${encodeURIComponent(topic)}`
}

const badgeClass = tv({
  base: 'badge',
  variants: {
    tone: {
      default: 'badgeToneDefault',
      warm: 'badgeToneWarm',
      cool: 'badgeToneCool',
      fresh: 'badgeToneFresh',
      accent: 'badgeToneAccent',
    },
  },
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.badge {
  @apply rounded-sm px-2 py-0.5 font-medium transition-colors;
}

.badgeToneDefault {
  @apply bg-amber-200 text-amber-950 hover:bg-amber-300;
}

.badgeToneWarm {
  @apply bg-amber-300 text-amber-950 hover:bg-amber-400;
}

.badgeToneCool {
  @apply bg-sky-200 text-sky-950 hover:bg-sky-300;
}

.badgeToneFresh {
  @apply bg-emerald-200 text-emerald-950 hover:bg-emerald-300;
}

.badgeToneAccent {
  @apply bg-rose-200 text-rose-950 hover:bg-rose-300;
}
</style>
