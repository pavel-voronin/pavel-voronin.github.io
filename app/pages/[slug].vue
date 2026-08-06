<template>
  <PageSection>
    <template v-if="isArticleValid" #header>
      <ArticleHeader :title="page?.title ?? ''" :date="page?.date" :date-updated="page?.date_updated" :icon="page?.icon" :topics="topicTags"
        :title-lines="titleLines" :title-easter-egg="page?.titleEasterEgg" :reading-time="readingTime" />
    </template>

    <ArticleLanguageLinks v-if="isArticleValid && translationLinks.length > 1" :current-path="page?.path" :translations="translationLinks" />

    <ArticleTableOfContents v-if="isArticleValid" :links="tocLinks" intro-id="article-intro" :intro-text="tocIntroText" />

    <ContentRenderer v-if="page" id="article-intro" class="articleBody" :value="page" />

    <UtterancesComments v-if="shouldShowComments" :issue-term="commentsIssueTerm" />
  </PageSection>
</template>

<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import { splitTopics } from '~/utils/topics'

const route = useRoute()
const slug = computed(() => {
  return Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug
})

const { data: page } = await useAsyncData(() => `content-${slug.value}`, () => {
  return queryCollection('content')
    .path(`/${slug.value}`)
    .first()
}, { watch: [slug] })

const derivedContent = await useDerivedContent()

const isArticleValid = computed(() => {
  return page.value?.articleValid !== false
})

const translationLinks = computed(() => {
  if (!isArticleValid.value || !page.value?.path) {
    return []
  }

  return derivedContent.articleTranslationsByPath[page.value.path] ?? []
})

const commentsIssueTerm = computed(() => {
  return translationLinks.value.find(translation => translation.language === 'en')?.path
    ?? page.value?.path
    ?? `/${slug.value}`
})

const shouldShowComments = computed(() => {
  return isArticleValid.value && page.value?.comments === true
})

const topicTags = computed(() => {
  if (!isArticleValid.value) {
    return []
  }

  return splitTopics(page.value?.topics)
})

const tocLinks = computed<TocLink[]>(() => {
  if (!isArticleValid.value) {
    return []
  }

  return page.value?.body?.toc?.links ?? []
})

const tocIntroText = computed(() => {
  return page.value?.language === 'ru' ? 'Начало' : 'Intro'
})

const titleLines = computed(() => {
  const rawValue = page.value?.titleLines
  const parsedValue = typeof rawValue === 'string' ? Number.parseInt(rawValue, 10) : rawValue

  if (typeof parsedValue !== 'number' || Number.isNaN(parsedValue)) {
    return 1
  }

  return Math.min(6, Math.max(1, parsedValue))
})

const readingTime = computed(() => {
  if (!isArticleValid.value) {
    return null
  }

  return estimateReadingTime(page.value?.readingTime, page.value?.language)
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const canonicalUrl = useCanonicalUrl()
const siteOrigin = useSiteOrigin()
const siteImageUrl = useAbsoluteSiteUrl(SITE_OG_IMAGE_PATH)
const articleImageUrl = computed(() => {
  if (!isArticleValid.value) {
    return siteImageUrl.value
  }

  return resolveArticleImageUrl(page.value?.image, page.value?.path, siteOrigin.value) ?? siteImageUrl.value
})

const articleDescription = computed(() => {
  if (!isArticleValid.value) {
    return SITE_DESCRIPTION
  }

  return page.value?.description ?? SITE_DESCRIPTION
})

const articleTitle = computed(() => {
  if (!isArticleValid.value) {
    return SITE_NAME
  }

  return titleToPlainText(page.value?.title) || SITE_NAME
})

const articleOgTitle = computed(() => {
  return `${articleTitle.value} | ${SITE_NAME}`
})

const articleFavicon = (() => {
  if (!isArticleValid.value || !page.value?.icon) {
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
  ogType: computed(() => isArticleValid.value ? 'article' : 'website'),
  ogImage: articleImageUrl,
  ogUrl: canonicalUrl,
  twitterTitle: articleOgTitle,
  twitterDescription: articleDescription,
  twitterImage: articleImageUrl,
})

useHead(() => {
  const head = {
    htmlAttrs: {
      lang: page.value?.language?.trim() || 'en',
    },
    title: articleTitle.value,
    link: [
      { key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: faviconHref.value },
      ...translationLinks.value.map((translation) => {
        return {
          key: `alternate-${translation.language}`,
          rel: 'alternate',
          hreflang: translation.language,
          href: new URL(translation.path, siteOrigin.value).href,
        }
      }),
    ],
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
