<template>
  <PageSection>
    <template #header>
      <ArticleHeader :title="page?.title ?? ''" :date="page?.date" :date-updated="page?.date_updated" :icon="page?.icon" :topics="topicTags"
        :title-lines="titleLines" :publication-links="publicationLinks" />
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

type PublicationLink = {
  label: string
  platform?: string
  url: string
}

type SocialLinks = {
  twitter?: string
  hackerNews?: string
  lobsters?: string
  reddit?: string
  linkedin?: string
}

const socialLinks = computed<SocialLinks>(() => {
  const current = page.value as (SocialLinks | null | undefined)
  return current ?? {}
})

const publicationLinks = computed<PublicationLink[]>(() => {
  if (!page.value) {
    return []
  }

  const links: PublicationLink[] = []

  if (socialLinks.value.twitter) {
    links.push({ label: 'On X', platform: 'x', url: socialLinks.value.twitter })
  }

  if (socialLinks.value.hackerNews) {
    links.push({ label: 'On Hacker News', platform: 'hacker-news', url: socialLinks.value.hackerNews })
  }

  if (socialLinks.value.lobsters) {
    links.push({ label: 'On Lobsters', platform: 'lobsters', url: socialLinks.value.lobsters })
  }

  if (socialLinks.value.reddit) {
    links.push({ label: 'On Reddit', platform: 'reddit', url: socialLinks.value.reddit })
  }

  if (socialLinks.value.linkedin) {
    links.push({ label: 'On LinkedIn', platform: 'linkedin', url: socialLinks.value.linkedin })
  }

  return links
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

const fallbackFavicon = '/favicon.svg'
const baseFaviconHref = articleFavicon ?? fallbackFavicon
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
