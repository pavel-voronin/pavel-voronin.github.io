import { isPublishedToBlock, isPublishedToTopics } from '~/composables/usePublishTo'
import { splitTopics, topicSlug } from '~/utils/topics'

type PublishDestination = 'blog' | 'topics' | 'all'

export type ContentItem = {
  path?: string
  title?: string
  date?: string | null
  icon?: string | null
  language?: string | null
  translationKey?: string | null
  topics?: string | string[] | null
  'publish-to'?: PublishDestination | null
}

export type BlogPost = {
  path: string
  title: string
  date?: string | null
  icon?: string | null
}

export type TopicRegistryItem = {
  title: string
  slug: string
  count: number
}

export type ArticleTranslation = {
  language: string
  path: string
  title: string
}

export type DerivedContent = {
  blogPosts: BlogPost[]
  topicRegistry: TopicRegistryItem[]
  topicPostsBySlug: Record<string, BlogPost[]>
  articleTranslationsByPath: Record<string, ArticleTranslation[]>
}

export const emptyDerivedContent: DerivedContent = {
  blogPosts: [],
  topicRegistry: [],
  topicPostsBySlug: {},
  articleTranslationsByPath: {},
}

const normalizeLanguage = (value: string | null | undefined) => {
  const normalizedValue = value?.trim().toLowerCase()
  return normalizedValue || 'en'
}

const isCanonicalLanguage = (item: ContentItem) => {
  return normalizeLanguage(item.language) === 'en'
}

export const buildDerivedContent = (items: ContentItem[]): DerivedContent => {
  const topicRegistryMap = new Map<string, TopicRegistryItem>()
  const topicPostsBySlug: Record<string, BlogPost[]> = {}
  const blogPosts: BlogPost[] = []
  const translationsByKey = new Map<string, ArticleTranslation[]>()

  for (const item of items) {
    if (!item.path || !item.title) {
      continue
    }

    const translationKey = item.translationKey?.trim()

    if (translationKey) {
      const translations = translationsByKey.get(translationKey) ?? []

      translations.push({
        language: normalizeLanguage(item.language),
        path: item.path,
        title: item.title,
      })

      translationsByKey.set(translationKey, translations)
    }

    if (!isCanonicalLanguage(item)) {
      continue
    }

    const blogPost = {
      path: item.path,
      title: item.title,
      date: item.date ?? null,
      icon: item.icon ?? null,
    }

    if (isPublishedToBlock(item)) {
      blogPosts.push(blogPost)
    }

    if (!isPublishedToTopics(item)) {
      continue
    }

    const topicSlugs = [...new Set(splitTopics(item.topics).map(topic => topicSlug(topic)).filter(Boolean))]

    for (const slug of topicSlugs) {
      const existing = topicRegistryMap.get(slug)

      if (existing) {
        existing.count += 1
      }
      else {
        topicRegistryMap.set(slug, {
          title: splitTopics(item.topics).find(topic => topicSlug(topic) === slug) ?? slug,
          slug,
          count: 1,
        })
      }

      if (!topicPostsBySlug[slug]) {
        topicPostsBySlug[slug] = []
      }

      topicPostsBySlug[slug].push(blogPost)
    }
  }

  const sortByDateDesc = (left: BlogPost, right: BlogPost) => {
    const leftTime = left.date ? new Date(left.date).getTime() : 0
    const rightTime = right.date ? new Date(right.date).getTime() : 0

    return rightTime - leftTime
  }

  blogPosts.sort(sortByDateDesc)

  for (const posts of Object.values(topicPostsBySlug)) {
    posts.sort(sortByDateDesc)
  }

  const languagePriority = (language: string) => {
    if (language === 'en') {
      return 0
    }

    if (language === 'ru') {
      return 1
    }

    return 2
  }

  const articleTranslationsByPath: Record<string, ArticleTranslation[]> = {}

  for (const translations of translationsByKey.values()) {
    if (translations.length < 2) {
      continue
    }

    translations.sort((left, right) => {
      const priorityDelta = languagePriority(left.language) - languagePriority(right.language)

      if (priorityDelta !== 0) {
        return priorityDelta
      }

      return left.language.localeCompare(right.language)
    })

    for (const translation of translations) {
      articleTranslationsByPath[translation.path] = translations
    }
  }

  return {
    blogPosts,
    topicRegistry: [...topicRegistryMap.values()].sort((left, right) => {
      return left.title.localeCompare(right.title)
    }),
    topicPostsBySlug,
    articleTranslationsByPath,
  }
}
