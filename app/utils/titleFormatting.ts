export type TitleSegment = {
  kind: 'text' | 'code'
  value: string
}

export type TitleEasterEggConfig = {
  from?: string | null
  to?: string | null
  delayMs?: number | null
  shakeMs?: number | null
}

export type TitleEasterEggSegment = {
  kind: 'easterEgg'
  value: string
  replacement: string
  delayMs: number
  shakeMs: number
}

export type DecoratedTitleSegment = TitleSegment | TitleEasterEggSegment

const DEFAULT_EASTER_EGG_DELAY_MS = 1000
const DEFAULT_EASTER_EGG_SHAKE_MS = 2000

const pushSegment = (segments: DecoratedTitleSegment[], kind: TitleSegment['kind'], value: string) => {
  if (!value) {
    return
  }

  const previous = segments[segments.length - 1]
  if (previous?.kind === kind) {
    previous.value += value
    return
  }

  segments.push({ kind, value })
}

const readBacktickRun = (value: string, startIndex: number) => {
  let endIndex = startIndex

  while (value[endIndex] === '`') {
    endIndex += 1
  }

  return value.slice(startIndex, endIndex)
}

export const parseTitleSegments = (value: string | null | undefined): TitleSegment[] => {
  const source = value ?? ''
  const segments: TitleSegment[] = []
  let cursor = 0

  while (cursor < source.length) {
    const openingIndex = source.indexOf('`', cursor)

    if (openingIndex === -1) {
      pushSegment(segments, 'text', source.slice(cursor))
      break
    }

    pushSegment(segments, 'text', source.slice(cursor, openingIndex))

    const delimiter = readBacktickRun(source, openingIndex)
    const codeStartIndex = openingIndex + delimiter.length
    const closingIndex = source.indexOf(delimiter, codeStartIndex)

    if (closingIndex === -1) {
      pushSegment(segments, 'text', source.slice(openingIndex))
      break
    }

    pushSegment(segments, 'code', source.slice(codeStartIndex, closingIndex))
    cursor = closingIndex + delimiter.length
  }

  return segments
}

const normalizeDuration = (value: number | null | undefined, fallback: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  return Math.max(0, Math.round(value))
}

export const decorateTitleSegments = (
  value: string | null | undefined,
  easterEgg: TitleEasterEggConfig | null | undefined,
): DecoratedTitleSegment[] => {
  const segments = parseTitleSegments(value)
  const source = easterEgg?.from?.trim() ?? ''
  const replacement = easterEgg?.to?.trim() ?? ''

  if (!source || !replacement) {
    return segments
  }

  const targetIndex = segments.findIndex((segment) => {
    return segment.kind === 'text' && segment.value.includes(source)
  })

  if (targetIndex === -1) {
    return segments
  }

  const targetSegment = segments[targetIndex]
  const sourceIndex = targetSegment.value.indexOf(source)
  const nextSegments: DecoratedTitleSegment[] = []

  for (const [index, segment] of segments.entries()) {
    if (index !== targetIndex || segment.kind !== 'text') {
      nextSegments.push(segment)
      continue
    }

    pushSegment(nextSegments, 'text', segment.value.slice(0, sourceIndex))
    nextSegments.push({
      kind: 'easterEgg',
      value: source,
      replacement,
      delayMs: normalizeDuration(easterEgg?.delayMs, DEFAULT_EASTER_EGG_DELAY_MS),
      shakeMs: normalizeDuration(easterEgg?.shakeMs, DEFAULT_EASTER_EGG_SHAKE_MS),
    })
    pushSegment(nextSegments, 'text', segment.value.slice(sourceIndex + source.length))
  }

  return nextSegments
}

export const titleToPlainText = (value: string | null | undefined) => {
  return parseTitleSegments(value)
    .map(segment => segment.value)
    .join('')
}
