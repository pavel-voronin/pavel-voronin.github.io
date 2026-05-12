<template>
  <template
    v-for="(segment, index) in segments"
    :key="index"
  >
    <ProseCode v-if="segment.kind === 'code'" variant="title">{{ segment.value }}</ProseCode>
    <ArticleTitleEasterEgg
      v-else-if="segment.kind === 'easterEgg'"
      :text="segment.value"
      :replacement="segment.replacement"
      :delay-ms="segment.delayMs"
      :shake-ms="segment.shakeMs"
    />
    <template v-else>{{ segment.value }}</template>
  </template>
</template>

<script setup lang="ts">
import type { TitleEasterEggConfig } from '~/utils/titleFormatting'

const props = defineProps<{
  title: string
  titleEasterEgg?: TitleEasterEggConfig | null
}>()

const segments = computed(() => {
  return decorateTitleSegments(props.title, props.titleEasterEgg)
})
</script>
