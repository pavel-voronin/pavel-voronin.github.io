<template>
  <PageSection>
    <template #header>
      <div class="heroContent">
        <h1 class="heroHeading">
          <Icon name="streamline-ultimate-color:cursor-hand-2" size="1cap" />
          Hi, I'm Pavel
        </h1>
        <p class="heroText">
          And I build AI tooling, agents, and software systems that are meant to evolve — not just run.
          Much of my work explores how human workflows change once software starts acting back.
        </p>
        <AppButton to="/me" class="self-start">
          <template #left>
            <Icon name="streamline-ultimate-color:smiley-happy" />
          </template>
          About me
        </AppButton>
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
