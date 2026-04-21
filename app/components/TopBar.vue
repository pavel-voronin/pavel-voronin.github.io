<template>
  <header class="topBar">
    <AppLink to="/" silent class="brand">Pavel Voronin</AppLink>

    <nav class="nav">
      <AppLink to="/blog" silent class="navLink">
        <Icon name="streamline-ultimate-color:notes-paper-text" />
        Blog
      </AppLink>
      <AppLink to="/me" silent class="navLink">
        <Icon name="streamline-ultimate-color:smiley-happy" />
        About
      </AppLink>
    </nav>

    <div class="socials">
      <AppLink href="https://github.com/pavel-voronin" target="_blank" silent no-visited class="socialLink">
        <Icon name="streamline-ultimate-color:github-logo-1" />
      </AppLink>
      <AppLink href="https://x.com/pavel_voronin" target="_blank" silent no-visited class="socialLink">
        <Icon name="logos:twitter" />
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
  @apply fixed top-0 left-0 right-0 h-14 z-50 flex items-center gap-3 px-4 bg-surface border-b border-edge/70;
}

@variant sidenav {
  .topBar {
    display: none;
  }
}

.brand {
  @apply text-lg font-semibold tracking-tight text-heading no-underline whitespace-nowrap;
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
