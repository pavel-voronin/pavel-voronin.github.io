<template>
  <blockquote class="my-3 border-l-4 border-edge py-0.5 pl-5 text-base italic text-caption">
    <slot />
  </blockquote>
</template>

<style scoped>
@reference "~/assets/css/main.css";

blockquote :deep(p) {
  @apply my-3;
}
</style>
