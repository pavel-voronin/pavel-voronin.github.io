<template>
  <span class="badge">
    {{ props.text }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
}>()
</script>

<style scoped>
@reference "~/assets/css/main.css";

.badge {
  @apply mx-1 inline-block rounded-full border border-badge-border bg-badge-bg px-2 py-0.5 text-xs font-medium text-badge-text;
}
</style>
