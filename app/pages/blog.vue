<template>
  <PageSection>
    <template #header>
      <PageHeader>
        <template #icon>
          <Icon name="streamline-ultimate-color:notes-paper-text" />
        </template>
        Blog
      </PageHeader>
    </template>

    <section v-if="topics.length > 0" class="topicsSection">
      <div class="topicsList">
        <TopicBadge
          v-for="topic in topics"
          :key="topic.slug"
          :topic="topic.title"
          :count="topic.count"
        />
      </div>
    </section>

    <PostList :posts="posts" />
  </PageSection>
</template>

<script setup lang="ts">
const derivedContent = await useDerivedContent()

const posts = derivedContent.blogPosts
const topics = derivedContent.topicRegistry

const blogFaviconHref = createIconifyFaviconHref('streamline-ultimate-color:notes-paper-text')

useSeoMeta({
  title: 'Blog',
  description: SITE_DESCRIPTION,
  ogTitle: 'Blog',
  ogDescription: SITE_DESCRIPTION,
  ogType: 'website',
  twitterTitle: 'Blog',
  twitterDescription: SITE_DESCRIPTION,
})

useHead({
  link: [{ key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: blogFaviconHref }],
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.topicsSection {
  @apply my-8 flex flex-col;
}

.topicsList {
  @apply flex flex-wrap gap-2;
}
</style>
