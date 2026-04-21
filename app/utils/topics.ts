type TopicInput = string | string[] | null | undefined

const TOPIC_SEPARATOR_PATTERN = /[\s_-]+/g
const NON_SLUG_PATTERN = /[^a-z0-9-]/g
const DIACRITIC_PATTERN = /[\u0300-\u036f]/g

export const normalizeTopic = (value: string) => {
  return value.trim()
}

export const splitTopics = (value: TopicInput) => {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => normalizeTopic(item))
      .filter(Boolean)
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => normalizeTopic(item))
      .filter(Boolean)
  }

  return []
}

export const topicSlug = (value: string) => {
  return normalizeTopic(value)
    .normalize('NFKD')
    .replace(DIACRITIC_PATTERN, '')
    .toLowerCase()
    .replace(TOPIC_SEPARATOR_PATTERN, '-')
    .replace(NON_SLUG_PATTERN, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const topicPath = (value: string) => {
  return `/topics/${topicSlug(value)}`
}
