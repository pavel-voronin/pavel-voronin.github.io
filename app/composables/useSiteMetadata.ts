export const useSiteOrigin = () => {
  const runtimeConfig = useRuntimeConfig()

  return computed(() => {
    const configuredOrigin = runtimeConfig.public.siteUrl?.trim()

    if (configuredOrigin) {
      return configuredOrigin.replace(/\/+$/, '')
    }

    if (import.meta.client) {
      return window.location.origin
    }

    return useRequestURL().origin
  })
}

export const useCanonicalUrl = () => {
  const route = useRoute()
  const siteOrigin = useSiteOrigin()

  return computed(() => new URL(route.path, siteOrigin.value).href)
}

export const useAbsoluteSiteUrl = (value: string | null | undefined) => {
  const siteOrigin = useSiteOrigin()

  return computed(() => resolveAbsoluteUrl(value, siteOrigin.value))
}

