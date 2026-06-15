<template>
  <aside>
    <div>
      <AppLink to="/" silent class="homeLink">
        Pavel Voronin
        <span class="humanWide">(human)</span>
        <span class="humanNarrow">human</span>
      </AppLink>
      <p class="oneLiner">
        I've been writing code since the early '90s. Three decades later, I'm still curious — about AI, architecture,
        teams, and everything in between.
      </p>
    </div>

    <div class="sectionDivider" />

    <nav>
      <ul class="linkList">
        <li>
          <AppLink to="/blog" silent class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:notes-paper-text" />
            </template>
            Blog
          </AppLink>
        </li>
        <li>
          <AppLink to="/me" silent class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:user-question" />
            </template>
            About
          </AppLink>
        </li>
        <li>
          <AppLink to="/now" silent class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:lab-flask-experiment" />
            </template>
            Now
          </AppLink>
        </li>
        <li>
          <AppLink href="https://github.com/pavel-voronin?tab=repositories" target="_blank" silent no-visited class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:file-code-check" />
            </template>
            Repositories
          </AppLink>
        </li>
      </ul>
    </nav>

    <div class="sectionDivider" />

    <section>
      <h2 class="sectionTitle">
        Let's connect
      </h2>
      <ul class="linkList">
        <li>
          <AppLink href="https://github.com/pavel-voronin" target="_blank" silent no-visited class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:github-logo-1" />
            </template>
            <span class="linkLabel">GitHub</span>
            <GitHubContributionPixels />
          </AppLink>
        </li>
        <li>
          <AppLink href="https://www.linkedin.com/in/pavelvoronin/" target="_blank" silent no-visited class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:linkedin-logo" />
            </template>
            LinkedIn
          </AppLink>
        </li>
        <li>
          <AppLink href="https://x.com/pavel_voronin" target="_blank" silent no-visited class="linkRow">
            <template #left>
              <Icon name="local:twitter-verified" />
            </template>
            Twitter / X
          </AppLink>
        </li>
        <li>
          <AppLink href="/rss.xml" external silent no-visited class="linkRow">
            <template #left>
              <Icon name="streamline-ultimate-color:rss-feed" />
            </template>
            RSS
          </AppLink>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
@reference "~/assets/css/main.css";

aside {
  @apply flex flex-col gap-6;
}

nav,
section {
  @apply flex flex-col gap-2;
}

.sectionDivider {
  @apply border-t border-edge/70;
}

.sectionTitle {
  @apply text-lg font-semibold text-caption;
}

.linkList {
  @apply m-0 flex list-none flex-col gap-0.5 p-0;
}

.linkRow {
  @apply flex w-full items-center overflow-hidden rounded px-2 py-1.5 text-sm text-subtle no-underline transition hover:bg-accent-surface/70 hover:text-heading;
}

.linkLabel {
  @apply shrink-0;
}

.homeLink {
  @apply text-2xl font-semibold tracking-tight text-heading max-[1040px]:flex-col max-[1040px]:items-start max-[1040px]:gap-0;
}

.humanWide {
  @apply text-xl font-medium tracking-normal text-caption max-[1040px]:hidden;
}

.humanNarrow {
  @apply hidden text-xl font-medium tracking-normal text-caption max-[1040px]:inline;
}

.oneLiner {
  @apply mt-3 text-sm leading-6 text-muted max-[1040px]:mt-4;
}

@container (width < calc(17.4ch + 2px)) {
  .homeLink {
    @apply w-full flex-col items-center gap-0;
  }

  .humanWide {
    @apply hidden;
  }

  .humanNarrow {
    @apply inline;
  }

  .oneLiner {
    @apply hidden;
  }
}
</style>
