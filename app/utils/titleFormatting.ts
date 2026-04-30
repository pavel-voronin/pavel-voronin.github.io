export type TitleSegment = {
  kind: 'text' | 'code'
  value: string
}

const pushSegment = (segments: TitleSegment[], kind: TitleSegment['kind'], value: string) => {
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

export const titleToPlainText = (value: string | null | undefined) => {
  return parseTitleSegments(value)
    .map(segment => segment.value)
    .join('')
}
