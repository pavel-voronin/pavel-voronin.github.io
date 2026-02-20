<template>
  <h2 class="homeSectionHeading">
    <slot />
  </h2>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.homeSectionHeading {
  @apply text-2xl font-semibold tracking-tight text-heading;
}
</style>
