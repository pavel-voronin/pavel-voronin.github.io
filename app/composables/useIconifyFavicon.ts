import { addIcon, getIcon } from '@iconify/vue'
import { iconToHTML, iconToSVG, svgToData } from '@iconify/utils'
import { init as initClientBundle } from '#build/nuxt-icon-client-bundle'

const faviconCache = new Map<string, string>()

const ensureClientBundle = () => {
  initClientBundle(addIcon)
}

const iconToDataUri = (iconName: string) => {
  const cached = faviconCache.get(iconName)

  if (cached) {
    return cached
  }

  ensureClientBundle()

  const icon = getIcon(iconName)

  if (!icon) {
    return null
  }

  const { body, attributes } = iconToSVG(icon)
  const svg = iconToHTML(body, attributes)
  const dataUri = svgToData(svg)

  faviconCache.set(iconName, dataUri)

  return dataUri
}

export const createIconifyFaviconHref = (iconName: string, fallbackHref = '/favicon.svg') => {
  return iconToDataUri(iconName) ?? fallbackHref
}
