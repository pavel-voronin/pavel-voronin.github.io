<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) =>
    titleChunk && titleChunk !== "Pavel Voronin"
      ? `${titleChunk} | Pavel Voronin`
      : "Pavel Voronin",
  link: [{ key: "site-favicon", rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
})
</script>
