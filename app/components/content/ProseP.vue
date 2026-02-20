<template>
  <p class="my-6 text-body">
    <slot />
  </p>
</template>

<style scoped>
@reference "~/assets/css/main.css";

p :deep(del) {
  @apply text-faint line-through;
}

p :deep(kbd) {
  @apply inline-flex items-center rounded-md border border-edge bg-surface px-1.5 py-px text-xs font-medium text-muted shadow-sm;
}
</style>
