<template>
  <h1 class="articleHeading">
    <slot />
  </h1>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.articleHeading {
  @apply text-4xl font-bold leading-tight tracking-tight text-heading;
}
</style>
