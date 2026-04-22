<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const canonicalUrl = useCanonicalUrl()
const siteImageUrl = useAbsoluteSiteUrl(SITE_OG_IMAGE_PATH)

useHead({
  titleTemplate: (titleChunk) =>
    titleChunk && titleChunk !== SITE_NAME
      ? `${titleChunk} | ${SITE_NAME}`
      : SITE_NAME,
  title: SITE_NAME,
  link: [
    { key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { key: 'canonical', rel: 'canonical', href: canonicalUrl },
  ],
})

useSeoMeta({
  description: SITE_DESCRIPTION,
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogImage: siteImageUrl,
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
  twitterSite: '@pavel_voronin',
  twitterCreator: '@pavel_voronin',
  twitterTitle: SITE_NAME,
  twitterDescription: SITE_DESCRIPTION,
  twitterImage: siteImageUrl,
})
</script>
