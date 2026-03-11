type ReadingProgressFaviconOptions = {
  baseFaviconHref: string
  articleSelector?: string
  commentsHeadingSelector?: string
  commentsSectionSelector?: string
}

export const useReadingProgressFavicon = (options: ReadingProgressFaviconOptions) => {
  const articleSelector = options.articleSelector ?? '.articleBody'
  const commentsHeadingSelector = options.commentsHeadingSelector ?? '.commentsHeading'
  const commentsSectionSelector = options.commentsSectionSelector ?? '.commentsSection'

  const currentFaviconHref = ref(options.baseFaviconHref)
  const progressFaviconCache = new Map<number, string>()
  let rafId = 0

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max)
  }

  const createProgressFavicon = (progress: number) => {
    const cached = progressFaviconCache.get(progress)
    if (cached) {
      return cached
    }

    const fontSize = progress >= 100 ? 16 : 18
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#f8fafc"/><text x="16" y="16" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" font-weight="700" fill="#0f172a">${progress}</text></svg>`
    const url = `data:image/svg+xml,${encodeURIComponent(svg)}`

    progressFaviconCache.set(progress, url)
    return url
  }

  const calculateReadingProgress = () => {
    if (!import.meta.client || window.scrollY <= 0) {
      return 0
    }

    const commentsAnchor = document.querySelector<HTMLElement>(commentsHeadingSelector)
      ?? document.querySelector<HTMLElement>(commentsSectionSelector)
    const articleBody = document.querySelector<HTMLElement>(articleSelector)

    if (!commentsAnchor && !articleBody) {
      return 0
    }

    const targetScrollY = (() => {
      if (commentsAnchor) {
        const commentsTop = commentsAnchor.getBoundingClientRect().top + window.scrollY
        return Math.max(1, commentsTop - window.innerHeight)
      }

      if (articleBody) {
        const articleBottom = articleBody.getBoundingClientRect().bottom + window.scrollY
        return Math.max(1, articleBottom - window.innerHeight)
      }

      return 0
    })()

    if (targetScrollY <= 0) {
      return 0
    }

    if (window.scrollY >= targetScrollY - 1) {
      return 100
    }

    const progress = clamp((window.scrollY / targetScrollY) * 100, 0, 100)
    return Math.round(progress)
  }

  const updateFaviconByProgress = () => {
    const progress = calculateReadingProgress()
    currentFaviconHref.value = progress <= 0
      ? options.baseFaviconHref
      : createProgressFavicon(progress)
  }

  const scheduleFaviconUpdate = () => {
    if (!import.meta.client || rafId !== 0) {
      return
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = 0
      updateFaviconByProgress()
    })
  }

  onMounted(() => {
    scheduleFaviconUpdate()
    window.addEventListener('scroll', scheduleFaviconUpdate, { passive: true })
    window.addEventListener('resize', scheduleFaviconUpdate, { passive: true })
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) {
      return
    }

    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId)
    }

    window.removeEventListener('scroll', scheduleFaviconUpdate)
    window.removeEventListener('resize', scheduleFaviconUpdate)
    currentFaviconHref.value = options.baseFaviconHref
  })

  return {
    faviconHref: currentFaviconHref,
  }
}
