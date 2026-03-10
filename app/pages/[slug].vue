<template>
  <PageSection>
    <template #header>
      <div class="articleHeader" :class="{ 'articleHeader--withIcon': Boolean(page?.icon) }"
        :style="page?.icon ? { '--title-lines': page.titleLines ?? 1 } : undefined">
        <div v-if="page?.icon" class="articleIconTop">
          <Icon :name="page.icon" />
        </div>

        <p v-if="page?.date" class="articleDate">
          {{ formatPostDate(page.date) }}
        </p>

        <div v-if="page?.icon" class="articleIcon">
          <Icon :name="page.icon" />
        </div>

        <h1 class="articleHeading">
          {{ page?.title }}
        </h1>
      </div>
    </template>

    <ContentRenderer v-if="page" class="articleBody" :value="page" />

    <UtterancesComments v-if="shouldShowComments" />
  </PageSection>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: page } = await useAsyncData(`content-${slug}`, () => {
  return queryCollection('content')
    .path(`/${slug}`)
    .first()
})

const shouldShowComments = computed(() => {
  return page.value?.type === 'post' && page.value?.comments === true
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const toIconifySvgUrl = (iconName: string) => {
  const segments = iconName.split(':')
  const icon = segments.pop()
  const collection = segments.pop()

  if (!collection || !icon) {
    return null
  }

  return `https://api.iconify.design/${encodeURIComponent(collection)}/${encodeURIComponent(icon)}.svg`
}

const articleFavicon = (() => {
  if (page.value?.type !== 'post' || !page.value?.icon) {
    return null
  }

  return toIconifySvgUrl(page.value.icon)
})()

useHead(() => {
  const head = {
    title: page.value?.title ?? 'Pavel Voronin',
  }

  if (articleFavicon) {
    return {
      ...head,
      link: [{ key: 'site-favicon', rel: 'icon', type: 'image/svg+xml', href: articleFavicon }],
    }
  }

  return head
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formatPostDate = (value: string) => {
  return dateFormatter.format(new Date(value))
}
</script>

<style scoped>
@reference "~/assets/css/main.css";

.articleHeader {
  @apply flex flex-col;
}

.articleHeader--withIcon {
  @apply grid gap-x-3;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    ". date"
    "icon title";
}

.articleDate {
  grid-area: date;
  @apply m-0 mt-3 tracking-wide text-faint;
}

.articleIcon {
  grid-area: icon;
  width: calc(var(--title-lines, 1) * 2.8125rem);
  height: calc(var(--title-lines, 1) * 2.8125rem);
}

.articleIcon :deep(.iconify),
.articleIcon :deep(.nuxt-icon),
.articleIcon :deep(svg) {
  @apply block h-full w-full;
}

.articleIconTop {
  @apply hidden w-22.5 h-22.5;
}

@container content (width < 60ch) {
  .articleHeader--withIcon {
    display: flex;
    flex-direction: column;
  }

  .articleIconTop {
    display: block;
  }

  .articleIcon {
    display: none;
  }
}

@container content (min-width: 60ch) {
  .articleIconTop {
    display: none;
  }

  .articleIcon {
    display: block;
  }
}

.articleIconTop :deep(.iconify),
.articleIconTop :deep(.nuxt-icon),
.articleIconTop :deep(svg) {
  @apply block h-full w-full;
}

.articleHeading {
  grid-area: title;
  @apply m-0 text-4xl font-bold leading-tight tracking-tight text-heading;
}

.articleBody {
  @apply text-lg leading-relaxed text-body;
}
</style>
