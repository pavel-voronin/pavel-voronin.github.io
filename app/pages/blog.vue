<template>
  <PageSection>
    <template #header>
      <PageHeader>
        <template #icon>
          <Icon name="streamline-ultimate-color:notes-paper-text" />
        </template>
        Blog
      </PageHeader>
    </template>
    <template #lead>Archive of all posts in chronological order.</template>

    <PostList :posts="posts" />
  </PageSection>
</template>

<script setup lang="ts">
const blogFaviconHref = (() => {
  const iconName = 'streamline-ultimate-color:notes-paper-text'
  const [collection, ...parts] = iconName.split(':')

  if (!collection || parts.length === 0) {
    return '/favicon.svg'
  }

  const icon = parts.join(':')
  return `https://api.iconify.design/${encodeURIComponent(collection)}/${encodeURIComponent(icon)}.svg`
})()

useHead({
  title: 'Blog',
  link: [{ key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: blogFaviconHref }],
})

const { data: posts } = await useAsyncData('all-posts', () => {
  return queryCollection('content')
    .order('date', 'DESC')
    .all()
    .then(items => items.filter(isPublishedToBlock))
})
</script>
