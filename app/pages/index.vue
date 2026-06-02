<template>
  <div class="homePage">
    <Hero />

    <PageSection>
      <template #header>
        <HomeSectionHeading>
          <AppLink to="/blog" silent>
            <template #left>
              <Icon name="streamline-ultimate-color:pasta-bowl-warm" />
            </template>
            Fresh
          </AppLink>
        </HomeSectionHeading>
      </template>

      <PostList :posts="latestPosts" />
      <div class="freshMore">
        <AppLink to="/blog" class="freshMoreLink">
          View all posts
          <template #right>
            &rarr;
          </template>
        </AppLink>
      </div>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
const derivedContent = await useDerivedContent()
const latestPosts = derivedContent.blogPosts.slice(0, 5)
</script>

<style scoped>
@reference "~/assets/css/main.css";

.homePage {
  @apply w-full flex flex-col gap-10;
}

.freshMore {
  @apply mt-7;
}

.freshMoreLink {
  @apply text-lg no-underline hover:no-underline;
}
</style>
