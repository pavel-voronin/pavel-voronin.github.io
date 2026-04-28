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
</style>
