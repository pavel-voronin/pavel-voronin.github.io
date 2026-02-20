<template>
  <h1 :id="props.id" class="mb-4 mt-10 text-4xl font-bold leading-tight tracking-tight text-heading">
    <a v-if="props.id" :href="`#${props.id}`">
      <slot />
    </a>
    <slot v-else />
  </h1>
</template>

<script setup lang="ts">
const props = defineProps({
  id: {
    type: String,
    required: false,
  },
})
</script>
