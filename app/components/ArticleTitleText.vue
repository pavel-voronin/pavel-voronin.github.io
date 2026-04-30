<template>
  <template
    v-for="(segment, index) in segments"
    :key="index"
  >
    <ProseCode v-if="segment.kind === 'code'" variant="title">{{ segment.value }}</ProseCode>
    <template v-else>{{ segment.value }}</template>
  </template>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
}>()

const segments = computed(() => {
  return parseTitleSegments(props.title)
})
</script>
