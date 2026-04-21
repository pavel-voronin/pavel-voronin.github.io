import { isPublishedToBlock, isPublishedToTopics } from '~/composables/usePublishTo'
import { splitTopics, topicSlug } from '~/utils/topics'

type PublishDestination = 'blog' | 'topics' | 'all'

export type ContentItem = {
  path?: string
  title?: string
  date?: string | null
  icon?: string | null
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

export type DerivedContent = {
  blogPosts: BlogPost[]
  topicRegistry: TopicRegistryItem[]
  topicPostsBySlug: Record<string, BlogPost[]>
}

export const emptyDerivedContent: DerivedContent = {
  blogPosts: [],
  topicRegistry: [],
  topicPostsBySlug: {},
}

export const buildDerivedContent = (items: ContentItem[]): DerivedContent => {
  const topicRegistryMap = new Map<string, TopicRegistryItem>()
  const topicPostsBySlug: Record<string, BlogPost[]> = {}
  const blogPosts: BlogPost[] = []

  for (const item of items) {
    if (!item.path || !item.title) {
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

  return {
    blogPosts,
    topicRegistry: [...topicRegistryMap.values()].sort((left, right) => {
      return left.title.localeCompare(right.title)
    }),
    topicPostsBySlug,
  }
}
