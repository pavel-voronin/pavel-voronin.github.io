<template>
  <PageSection>
    <template #header>
      <ArticleHeading>
        <span class="headingInline">
          <span class="headingLabel">Topic</span>
          <TopicBadge :topic="topic" />
        </span>
      </ArticleHeading>
    </template>
    <template #lead>Posts tagged with this topic.</template>

    <PostList v-if="topicPosts.length > 0" :posts="topicPosts" />
    <p v-else class="topicEmpty">
      No posts found for this topic yet.
    </p>
  </PageSection>
</template>

<script setup lang="ts">
const route = useRoute()
const rawTopic = Array.isArray(route.params.topic) ? route.params.topic[0] : route.params.topic

const topic = (() => {
  const value = String(rawTopic ?? '').trim()

  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
})()

const { data: topicPosts } = await useAsyncData(
  `topic-posts-${topic}`,
  async () => {
    if (!topic) {
      return []
    }

    const posts = await queryCollection('content')
      .where('type', '=', 'post')
      .order('date', 'DESC')
      .all()

    return posts.filter((post) => {
      const topics = typeof post.topics === 'string'
        ? post.topics.split(',').map(item => item.trim()).filter(Boolean)
        : Array.isArray(post.topics)
          ? post.topics
            .filter((item): item is string => typeof item === 'string')
            .map(item => item.trim())
            .filter(Boolean)
          : []

      return topics.some((item) => {
        return typeof item === 'string' && item.trim() === topic
      })
    })
  },
  {
    default: () => [],
  },
)

useHead({
  title: topic ? `Topic: ${topic}` : 'Topics',
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.topicEmpty {
  @apply m-0 text-base text-muted;
}

.headingInline {
  @apply inline-flex items-center gap-3;
}

.headingLabel {
  @apply inline;
}
</style>
