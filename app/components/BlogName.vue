<template>
  <div>
    <AppLink to="/" silent class="homeLink">
      Pavel Voronin
    </AppLink>
    <p class="oneLiner">
      I've been writing code since the early '90s. Three decades later, I'm still curious — about AI, architecture,
      teams, and everything in between.
      <AppLink to="/me">Read more</AppLink>
    </p>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.homeLink {
  @apply text-2xl font-semibold tracking-tight text-heading;
}

.oneLiner {
  @apply mt-3 text-sm leading-6 text-muted;
}
</style>
