<template>
  <component
    :is="ImageComponent"
    :src="refinedSrc"
    :alt="props.alt"
    :width="props.width"
    :height="props.height"
    class=" h-auto max-w-full rounded-lg"
  />
</template>

<script setup lang="ts">
import { joinURL, withLeadingSlash, withTrailingSlash } from 'ufo'
import ImageComponent from '#build/mdc-image-component.mjs'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
})

const refinedSrc = computed(() => {
  if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
    const base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
    if (base !== '/' && !props.src.startsWith(base)) {
      return joinURL(base, props.src)
    }
  }

  return props.src
})
</script>
