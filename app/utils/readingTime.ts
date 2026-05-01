const DEFAULT_READING_LANGUAGE = 'en'

const READING_WORDS_PER_MINUTE_BY_LANGUAGE = {
  en: {
    regular: 240,
    fast: 300,
  },
  ru: {
    regular: 190,
    fast: 240,
  },
} as const

export const REGULAR_READING_WORDS_PER_MINUTE = READING_WORDS_PER_MINUTE_BY_LANGUAGE.en.regular
export const FAST_READING_WORDS_PER_MINUTE = READING_WORDS_PER_MINUTE_BY_LANGUAGE.en.fast

type ReadingLanguage = keyof typeof READING_WORDS_PER_MINUTE_BY_LANGUAGE

type ReadingTimeSource = {
  wordCount?: number | null
  minutes?: number | null
  fastMinutes?: number | null
} | null | undefined

export type EstimatedReadingTime = {
  minutes: number
  fastMinutes: number
}

const normalizeMinutes = (value: number) => {
  return Math.max(1, Math.ceil(value))
}

const normalizeLanguage = (value: string | null | undefined): ReadingLanguage => {
  const normalizedValue = value?.trim().toLowerCase()

  if (normalizedValue === 'ru') {
    return 'ru'
  }

  return DEFAULT_READING_LANGUAGE
}

export const estimateReadingTime = (source: ReadingTimeSource, language?: string | null): EstimatedReadingTime | null => {
  if (typeof source?.wordCount === 'number') {
    const readingSpeed = READING_WORDS_PER_MINUTE_BY_LANGUAGE[normalizeLanguage(language)]

    return {
      minutes: normalizeMinutes(source.wordCount / readingSpeed.regular),
      fastMinutes: normalizeMinutes(source.wordCount / readingSpeed.fast),
    }
  }

  if (typeof source?.minutes === 'number' && typeof source?.fastMinutes === 'number') {
    return {
      minutes: normalizeMinutes(source.minutes),
      fastMinutes: normalizeMinutes(source.fastMinutes),
    }
  }

  return null
}
