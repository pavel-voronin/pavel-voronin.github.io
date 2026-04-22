<template>
  <PageSection>
    <template #header>
      <PageHeader>
        <template #icon>
          <Icon name="streamline-ultimate-color:notes-paper-text" />
        </template>
        <span class="headingInline">
          <AppLink to="/blog" silent no-visited class="headingBlog">
            Blog
          </AppLink>
          <span class="headingDivider" aria-hidden="true">&rarr;</span>
          <span class="headingIcon" aria-hidden="true">
            <Icon name="streamline-ultimate-color:tags-1" />
          </span>
          <TopicBadge :topic="topicTitle" />
        </span>
      </PageHeader>
    </template>

    <PostList v-if="topicPosts.length > 0" :posts="topicPosts" />
    <p v-else class="topicEmpty">
      No posts found for this topic yet.
    </p>
  </PageSection>
</template>

<script setup lang="ts">
import { topicSlug } from '~/utils/topics'

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

const derivedContent = await useDerivedContent()
const topicKey = topicSlug(topic)
const topicEntry = computed(() => {
  return derivedContent.topicRegistry.find((entry) => {
    return entry.slug === topicKey
  })
})

const topicTitle = computed(() => {
  return topicEntry.value?.title ?? topic
})

const topicPosts = computed(() => {
  return derivedContent.topicPostsBySlug[topicKey] ?? []
})

const topicDescription = computed(() => {
  return `Posts about ${topicTitle.value}`
})

useSeoMeta({
  title: topicTitle,
  description: topicDescription,
  ogTitle: topicTitle,
  ogDescription: topicDescription,
  ogType: 'website',
  twitterTitle: topicTitle,
  twitterDescription: topicDescription,
})

useHead({
  link: [{
    key: 'site-favicon',
    rel: 'icon',
    type: 'image/svg+xml',
    href: createIconifyFaviconHref('streamline-ultimate-color:tags-1'),
  }],
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.topicEmpty {
  @apply m-0 text-base text-muted;
}

.headingInline {
  @apply inline-flex items-baseline gap-3;
}

.headingIcon {
  @apply inline-flex shrink-0 self-center text-heading;
}

.headingBlog {
  @apply shrink-0 whitespace-nowrap leading-none text-inherit -translate-y-0.5;
}

.headingDivider {
  @apply self-center text-heading/35 text-2xl leading-none;
}
</style>
