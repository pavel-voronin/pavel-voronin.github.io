<template>
  <PageSection>
    <template #header>
      <div class="heroContent">
        <h1 class="heroHeading">
          <Icon name="streamline-ultimate-color:cursor-hand-2" />
          Hi, I'm Pavel
        </h1>
        <p class="heroText">
          And I build AI tooling, agents, and software systems that are meant to evolve — not just run.
          Much of my work explores how human workflows change once software starts acting back — <AppLink to="/me">
            read more</AppLink>
        </p>
        <ProseBlockquote class="border-green-600">
          <AppLink to="/now"><template #left>
              <Icon name="streamline-ultimate-color:lab-flask-experiment" />
            </template>Now</AppLink> I'm building a tool that syncs ChatGPT conversations to disk so I can read them
          directly in Obsidian.
        </ProseBlockquote>
      </div>
    </template>
  </PageSection>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.heroContent {
  @apply flex flex-col gap-5;
}

.heroHeading {
  @apply m-0 flex items-baseline gap-2 text-5xl font-bold tracking-tight text-heading;
}

.heroText {
  @apply max-w-2xl text-xl leading-relaxed text-subtle;
}
</style>
