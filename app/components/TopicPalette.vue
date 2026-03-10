<template>
  <div class="palette">
    <TopicBadge topic="default" tone="default" />
    <TopicBadge topic="warm" tone="warm" />
    <TopicBadge topic="cool" tone="cool" />
    <TopicBadge topic="fresh" tone="fresh" />
    <TopicBadge topic="accent" tone="accent" />
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.palette {
  @apply flex flex-wrap gap-2;
}
</style>
