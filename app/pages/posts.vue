<template>
  <PageSection>
    <template #header>
      <ArticleHeading>
        Blog
      </ArticleHeading>
    </template>
    <template #lead>Archive of all posts in chronological order.</template>

    <PostList :posts="posts" />
  </PageSection>
</template>

<script setup lang="ts">
useHead({
  title: 'Posts',
})

const { data: posts } = await useAsyncData('all-posts', () => {
  return queryCollection('content')
    .where('type', '=', 'post')
    .order('date', 'DESC')
    .all()
})
</script>
