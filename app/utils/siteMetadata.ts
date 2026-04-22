export const SITE_NAME = 'Pavel Voronin'

export const SITE_DESCRIPTION =
  'A personal blog about AI, people, tech, and everything in between. Exploring together how to navigate life in a new reality.'

export const SITE_OG_IMAGE_PATH = '/og-image.jpg'

export const resolveAbsoluteUrl = (value: string | null | undefined, siteOrigin: string) => {
  if (!value) {
    return null
  }

  try {
    return new URL(value, siteOrigin).href
  }
  catch {
    return null
  }
}

const hasUriScheme = (value: string) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)

export const resolveArticleImageUrl = (
  value: string | null | undefined,
  articlePath: string | null | undefined,
  siteOrigin: string,
) => {
  if (!value) {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  if (hasUriScheme(trimmedValue) || trimmedValue.startsWith('//')) {
    return trimmedValue.startsWith('//')
      ? new URL(trimmedValue, siteOrigin).href
      : trimmedValue
  }

  if (trimmedValue.startsWith('/')) {
    return new URL(trimmedValue, siteOrigin).href
  }

  const normalizedArticlePath = articlePath?.trim().replace(/^\/+|\/+$/g, '')
  const articleDirectory = normalizedArticlePath ? `/${normalizedArticlePath}/` : '/'

  return new URL(trimmedValue, new URL(articleDirectory, siteOrigin)).href
}
