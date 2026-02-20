<template>
  <div class="homePage">
    <Hero />

    <PageSection>
      <template #header>
        <HomeSectionHeading>
          <AppLink to="/posts" silent>Blog</AppLink>
        </HomeSectionHeading>
      </template>

      <PostList :posts="latestPosts" />
    </PageSection>
  </div>
</template>

<script setup lang="ts">
const { data: latestPosts } = await useAsyncData('latest-posts', () => {
  return queryCollection('content')
    .where('type', '=', 'post')
    .order('date', 'DESC')
    .limit(5)
    .all()
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.homePage {
  @apply w-full flex flex-col gap-10;
}
</style>
