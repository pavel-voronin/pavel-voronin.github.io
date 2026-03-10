<template>
  <PageSection>
    <template #header>
      <ArticleHeader
        :title="page?.title ?? ''"
        :date="page?.date"
        :icon="page?.icon"
        :topics="topicTags"
        :title-lines="page?.titleLines"
      />
    </template>

    <ContentRenderer v-if="page" class="articleBody" :value="page" />

    <UtterancesComments v-if="shouldShowComments" />
  </PageSection>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: page } = await useAsyncData(`content-${slug}`, () => {
  return queryCollection('content')
    .path(`/${slug}`)
    .first()
})

const shouldShowComments = computed(() => {
  return page.value?.type === 'post' && page.value?.comments === true
})

const topicTags = computed(() => {
  const topics = page.value?.topics

  if (typeof topics === 'string') {
    return topics
      .split(',')
      .map(topic => topic.trim())
      .filter(Boolean)
  }

  if (Array.isArray(topics)) {
    return topics
      .filter((topic): topic is string => typeof topic === 'string')
      .map(topic => topic.trim())
      .filter(Boolean)
  }

  return []
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const toIconifySvgUrl = (iconName: string) => {
  const segments = iconName.split(':')
  const icon = segments.pop()
  const collection = segments.pop()

  if (!collection || !icon) {
    return null
  }

  return `https://api.iconify.design/${encodeURIComponent(collection)}/${encodeURIComponent(icon)}.svg`
}

const articleFavicon = (() => {
  if (page.value?.type !== 'post' || !page.value?.icon) {
    return null
  }

  return toIconifySvgUrl(page.value.icon)
})()

useHead(() => {
  const head = {
    title: page.value?.title ?? 'Pavel Voronin',
  }

  if (articleFavicon) {
    return {
      ...head,
      link: [{ key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: articleFavicon }],
    }
  }

  return head
})

</script>

<style scoped>
@reference "~/assets/css/main.css";

.articleBody {
  @apply text-lg leading-relaxed text-body;
}
</style>
