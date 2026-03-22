<template>
  <PageSection>
    <template #header>
      <ArticleHeader :title="page?.title ?? ''" :date="page?.date" :icon="page?.icon" :topics="topicTags"
        :title-lines="page?.titleLines" :publication-links="publicationLinks" />
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
  if (!page.value?.icon) {
    return null
  }

  return toIconifySvgUrl(page.value.icon)
})()

const fallbackFavicon = '/favicon.svg'
const baseFaviconHref = articleFavicon ?? fallbackFavicon
const { faviconHref } = useReadingProgressFavicon({
  baseFaviconHref,
})

useHead(() => {
  const head = {
    title: page.value?.title ?? 'Pavel Voronin',
  }

  if (baseFaviconHref) {
    return {
      ...head,
      link: [{ key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: faviconHref.value }],
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
