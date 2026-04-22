<template>
  <PageSection>
    <template #header>
      <ArticleHeader :title="page?.title ?? ''" :date="page?.date" :date-updated="page?.date_updated" :icon="page?.icon" :topics="topicTags"
        :title-lines="titleLines" />
    </template>

    <ContentRenderer v-if="page" class="articleBody" :value="page" />

    <UtterancesComments v-if="shouldShowComments" />
  </PageSection>
</template>

<script setup lang="ts">
import { splitTopics } from '~/utils/topics'

const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: page } = await useAsyncData(`content-${slug}`, () => {
  return queryCollection('content')
    .path(`/${slug}`)
    .first()
})

const shouldShowComments = computed(() => {
  return isPublishedToBlock(page.value) && page.value?.comments === true
})

const topicTags = computed(() => {
  return splitTopics(page.value?.topics)
})

const titleLines = computed(() => {
  const rawValue = page.value?.titleLines
  const parsedValue = typeof rawValue === 'string' ? Number.parseInt(rawValue, 10) : rawValue

  if (typeof parsedValue !== 'number' || Number.isNaN(parsedValue)) {
    return 1
  }

  return Math.min(6, Math.max(1, parsedValue))
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const canonicalUrl = useCanonicalUrl()
const siteOrigin = useSiteOrigin()
const siteImageUrl = useAbsoluteSiteUrl(SITE_OG_IMAGE_PATH)
const articleImageUrl = computed(() => {
  return resolveArticleImageUrl(page.value?.image, page.value?.path, siteOrigin.value) ?? siteImageUrl.value
})

const articleDescription = computed(() => {
  return page.value?.description ?? SITE_DESCRIPTION
})

const articleTitle = computed(() => {
  return page.value?.title ?? SITE_NAME
})

const articleOgTitle = computed(() => {
  return `${articleTitle.value} | ${SITE_NAME}`
})

const articleFavicon = (() => {
  if (!page.value?.icon) {
    return null
  }

  return createIconifyFaviconHref(page.value.icon)
})()

const baseFaviconHref = articleFavicon ?? '/favicon.svg'
const { faviconHref } = useReadingProgressFavicon({
  baseFaviconHref,
})

useSeoMeta({
  title: articleTitle,
  description: articleDescription,
  ogTitle: articleOgTitle,
  ogDescription: articleDescription,
  ogType: 'article',
  ogImage: articleImageUrl,
  ogUrl: canonicalUrl,
  twitterTitle: articleOgTitle,
  twitterDescription: articleDescription,
  twitterImage: articleImageUrl,
})

useHead(() => {
  const head = {
    title: articleTitle.value,
    link: [{ key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: faviconHref.value }],
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
