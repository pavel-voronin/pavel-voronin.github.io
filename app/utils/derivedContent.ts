import { isPublishedToBlock, isPublishedToTopics } from '~/composables/usePublishTo'
import { splitTopics, topicSlug } from '~/utils/topics'

type PublishDestination = 'blog' | 'topics' | 'all'

export type ContentItem = {
  path?: string
  title?: string
  description?: string | null
  date?: string | null
  date_updated?: string | null
  icon?: string | null
  language?: string | null
  translationKey?: string | null
  topics?: string | string[] | null
  'publish-to'?: PublishDestination | null
  articleValid?: boolean | null
}

export type BlogPost = {
  path: string
  title: string
  description?: string | null
  date?: string | null
  date_updated?: string | null
  icon?: string | null
  languageLinks: ArticleLanguageLinks
  topics: string[]
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

export type ArticleLanguageLink = {
  language: string
  path: string
}

export type ArticleLanguageLinks = [ArticleLanguageLink, ...ArticleLanguageLink[]]

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
    if (item.articleValid === false) {
      continue
    }

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

    const topics = splitTopics(item.topics)
    const blogPost: BlogPost = {
      path: item.path,
      title: item.title,
      description: item.description ?? null,
      date: item.date ?? null,
      date_updated: item.date_updated ?? null,
      icon: item.icon ?? null,
      languageLinks: [{
        language: normalizeLanguage(item.language),
        path: item.path,
      }],
      topics,
    }

    if (isPublishedToBlock(item)) {
      blogPosts.push(blogPost)
    }

    if (!isPublishedToTopics(item)) {
      continue
    }

    const topicSlugs = [...new Set(topics.map(topic => topicSlug(topic)).filter(Boolean))]

    for (const slug of topicSlugs) {
      const existing = topicRegistryMap.get(slug)

      if (existing) {
        existing.count += 1
      }
      else {
        topicRegistryMap.set(slug, {
          title: topics.find(topic => topicSlug(topic) === slug) ?? slug,
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

  for (const post of blogPosts) {
    const [firstTranslation, ...otherTranslations] = articleTranslationsByPath[post.path] ?? []

    if (!firstTranslation) {
      continue
    }

    post.languageLinks = [
      {
        language: firstTranslation.language,
        path: firstTranslation.path,
      },
      ...otherTranslations.map((translation) => {
        return {
          language: translation.language,
          path: translation.path,
        }
      }),
    ]
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
