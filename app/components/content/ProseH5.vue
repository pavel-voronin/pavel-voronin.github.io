<template>
  <h5 :id="props.id" class="mb-1.5 mt-5 text-base font-semibold text-body">
    <a v-if="props.id && generate" :href="`#${props.id}`">
      <slot />
    </a>
    <slot v-else />
  </h5>
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
      (typeof headings?.anchorLinks === 'object' && headings.anchorLinks?.h5))
})
</script>
