import { queryCollection } from '@nuxt/content/server'
import type { Feed } from 'nuxt-module-feed'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import { buildDerivedContent, type BlogPost } from '~/utils/derivedContent'
import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE_PATH } from '~/utils/siteMetadata'
import { titleToPlainText } from '~/utils/titleFormatting'
import { topicSlug } from '~/utils/topics'

type FeedSource = {
  path: string
  type: 'rss2' | 'atom1' | 'json1'
  cacheTime: number
}

type FeedGenerateContext = {
  feed: Feed
  options: FeedSource
}

const FEED_PATHS = new Set(['/rss.xml', '/atom.xml', '/feed.json'])
// nuxt-module-feed's hook has no H3 event; Nuxt Content falls back to global $fetch when event is undefined.
const CONTENT_QUERY_EVENT = undefined as unknown as Parameters<typeof queryCollection>[0]

const toValidDate = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const latestPostDate = (posts: BlogPost[]) => {
  return posts.reduce<Date | null>((latestDate, post) => {
    const postDate = toValidDate(post.date_updated) ?? toValidDate(post.date)

    if (!postDate) {
      return latestDate
    }

    if (!latestDate || postDate.getTime() > latestDate.getTime()) {
      return postDate
    }

    return latestDate
  }, null)
}

const toFeedCategory = (topic: string) => {
  const term = topicSlug(topic) || topic

  return {
    name: topic,
    term,
  }
}

const resolveSiteOrigin = (value: string | null | undefined) => {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return 'http://localhost:3000'
  }

  try {
    return new URL(trimmedValue).href.replace(/\/+$/, '')
  }
  catch {
    return 'http://localhost:3000'
  }
}

const createFeed = async (feed: Feed, source: FeedSource) => {
  const runtimeConfig = useRuntimeConfig()
  const siteOrigin = resolveSiteOrigin(runtimeConfig.public.siteUrl)
  const siteUrl = new URL('/', siteOrigin).href
  const feedUrl = new URL(source.path, siteOrigin).href
  const imageUrl = new URL(SITE_OG_IMAGE_PATH, siteOrigin).href
  const contentItems = await queryCollection(CONTENT_QUERY_EVENT, 'content').all()
  const { blogPosts } = buildDerivedContent(contentItems)
  const feedLinks = {
    rss: new URL('/rss.xml', siteOrigin).href,
    atom: new URL('/atom.xml', siteOrigin).href,
    json: new URL('/feed.json', siteOrigin).href,
  }
  const author = {
    name: SITE_NAME,
    link: siteUrl,
  }

  feed.options = {
    id: siteUrl,
    title: SITE_NAME,
    link: siteUrl,
    description: SITE_DESCRIPTION,
    language: 'en',
    image: imageUrl,
    favicon: new URL('/favicon.svg', siteOrigin).href,
    copyright: `Copyright ${new Date().getUTCFullYear()} ${SITE_NAME}`,
    feed: feedUrl,
    feedLinks,
    ttl: Math.max(1, Math.ceil(source.cacheTime / 60)),
    author,
    updated: latestPostDate(blogPosts) ?? undefined,
  }

  for (const post of blogPosts) {
    const publishedDate = toValidDate(post.date)

    if (!publishedDate) {
      continue
    }

    const updatedDate = toValidDate(post.date_updated) ?? publishedDate
    const link = new URL(post.path, siteOrigin).href
    const title = titleToPlainText(post.title) || SITE_NAME
    const description = post.description ?? SITE_DESCRIPTION

    feed.addItem({
      title,
      id: link,
      link,
      description,
      content: description,
      date: updatedDate,
      published: publishedDate,
      category: post.topics.map(toFeedCategory),
    })
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('feed:generate', async ({ feed, options }: FeedGenerateContext) => {
    if (!FEED_PATHS.has(options.path)) {
      return
    }

    await createFeed(feed, options)
  })
})
