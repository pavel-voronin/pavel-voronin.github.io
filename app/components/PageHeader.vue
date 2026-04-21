<template>
  <header class="pageHeader">
    <div v-if="$slots.icon" class="pageIcon">
      <slot name="icon" />
    </div>

    <h1 class="pageTitle">
      <slot />
    </h1>
  </header>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.pageHeader {
  @apply flex items-start gap-3;
}

.pageIcon {
  @apply flex size-11 shrink-0 items-center justify-center text-heading;
}

.pageIcon :deep(.iconify),
.pageIcon :deep(.nuxt-icon),
.pageIcon :deep(svg) {
  @apply block size-full;
}

.pageTitle {
  @apply min-w-0 text-4xl font-bold leading-tight tracking-tight text-heading;
}
</style>
