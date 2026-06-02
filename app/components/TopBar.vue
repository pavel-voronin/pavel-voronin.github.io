<template>
  <header class="topBar">
    <AppLink to="/" silent class="brand">
      Pavel Voronin
      <span class="brandHuman">(human)</span>
    </AppLink>

    <nav class="nav">
      <AppLink to="/blog" silent class="navLink">
        <Icon name="streamline-ultimate-color:notes-paper-text" />
        Blog
      </AppLink>
      <AppLink to="/me" silent class="navLink">
        <Icon name="streamline-ultimate-color:user-question" />
        About
      </AppLink>
    </nav>

    <div class="socials">
      <AppLink href="https://github.com/pavel-voronin" target="_blank" silent no-visited class="socialLink">
        <Icon name="streamline-ultimate-color:github-logo-1" />
      </AppLink>
      <AppLink href="https://x.com/pavel_voronin" target="_blank" silent no-visited class="socialLink">
        <Icon name="local:twitter-verified" />
      </AppLink>
      <AppLink href="https://www.linkedin.com/in/pavelvoronin/" target="_blank" silent no-visited class="socialLink">
        <Icon name="streamline-ultimate-color:linkedin-logo" />
      </AppLink>
    </div>
  </header>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.topBar {
  @apply h-14 flex items-center gap-3 px-4 bg-surface;
}

@variant sidenav {
  .topBar {
    display: none;
  }
}

.brand {
  @apply text-lg font-semibold tracking-tight text-heading no-underline whitespace-nowrap;
}

.brandHuman {
  @apply text-sm font-medium tracking-normal text-caption;
}

.nav {
  @apply ml-auto flex items-center gap-0.5;
}

.navLink {
  @apply flex items-center gap-1 rounded px-2 py-1.5 text-sm text-subtle no-underline transition hover:bg-accent-surface/70 hover:text-heading;
}

.socials {
  @apply flex items-center gap-2;
}

.socialLink {
  @apply text-subtle no-underline transition hover:text-heading flex items-center;
}
</style>
