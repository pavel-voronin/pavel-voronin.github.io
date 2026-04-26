<template>
  <ContentRenderer v-if="snippet" :value="snippet" tag="span" unwrap="p" class="snippet" />
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const { data: snippet } = await useAsyncData(`snippets-${props.name}`, () => {
  return queryCollection('snippets')
    .path(`/_${props.name}`)
    .first()
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.snippet {
  @apply inline;
}
</style>
