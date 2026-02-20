<template>
  <h2 :id="props.id" class="mb-3 mt-9 text-2xl font-bold leading-tight tracking-tight text-heading">
    <a v-if="props.id && generate" :href="`#${props.id}`">
      <slot />
    </a>
    <slot v-else />
  </h2>
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
      (typeof headings?.anchorLinks === 'object' && headings.anchorLinks?.h2))
})
</script>
