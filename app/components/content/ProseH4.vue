<template>
  <h4 :id="props.id" class="mb-2 mt-6 text-lg font-semibold text-heading">
    <a v-if="props.id && generate" :href="`#${props.id}`">
      <slot />
    </a>
    <slot v-else />
  </h4>
</template>

<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})

const { headings } = useRuntimeConfig().public.mdc

const generate = computed(() => {
  return props.id &&
    ((typeof headings?.anchorLinks === 'boolean' && headings.anchorLinks) ||
      (typeof headings?.anchorLinks === 'object' && headings.anchorLinks?.h4))
})
</script>
