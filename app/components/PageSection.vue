<template>
  <section class="pageSection">
    <header v-if="$slots.header" class="sectionHeader">
      <slot name="header" />
      <p v-if="$slots.lead" class="sectionLead">
        <slot name="lead" />
      </p>
    </header>
    <div class="sectionContent">
      <slot />
    </div>
  </section>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.pageSection {
  @apply w-full;
}

.sectionHeader {
  @apply mb-4;
}

.sectionLead {
  @apply mt-2 max-w-2xl text-base leading-7 text-muted;
}
</style>
