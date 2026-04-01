<template>
  <header class="articleHeader" :data-with-icon="hasIcon ? 'true' : 'false'" :style="headerInlineStyle">
    <div v-if="props.icon" class="articleIconTop">
      <Icon :name="props.icon" />
    </div>

    <div v-if="hasMetaRow" class="articleMeta">
      <p v-if="formattedDate" class="articleDate">
        {{ formattedDate }}
      </p>

      <div v-if="normalizedPublicationLinks.length > 0" class="articleExternalLinks">
        <a
          v-for="(link, index) in normalizedPublicationLinks"
          :key="`${link.url}-${index}`"
          class="articlePlatformLink"
          :data-platform="link.platform"
          :href="link.url"
          :title="link.label"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HackerNewsIcon v-if="link.platform === 'hacker-news'" />
          <Icon v-else-if="link.iconName" :name="link.iconName" />
        </a>
      </div>
    </div>
    <div v-if="props.icon" class="articleIcon">
      <Icon :name="props.icon" />
    </div>

    <h1 class="articleHeading">
      {{ props.title }}
    </h1>

    <div v-if="normalizedTopics.length > 0" class="articleTopics">
      <TopicBadge
        v-for="topic in normalizedTopics"
        :key="topic"
        :topic="topic"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  date?: string
  dateUpdated?: string
  icon?: string
  topics?: string[]
  titleLines?: number
  publicationLinks?: Array<{
    label: string
    platform?: string
    url: string
  }>
}>()

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formattedDate = computed(() => {
  if (props.dateUpdated) {
    return `${dateFormatter.format(new Date(props.dateUpdated))} (updated)`
  }

  if (!props.date) {
    return null
  }

  return dateFormatter.format(new Date(props.date))
})

const normalizedTopics = computed(() => {
  return (props.topics ?? [])
    .map(topic => topic.trim())
    .filter(Boolean)
})

const normalizedPublicationLinks = computed(() => {
  const iconByPlatform: Record<string, string> = {
    x: 'simple-icons:x',
    twitter: 'simple-icons:x',
    'hacker-news': '',
    lobsters: 'simple-icons:lobsters',
    reddit: 'simple-icons:reddit',
    linkedin: 'simple-icons:linkedin',
  }

  return (props.publicationLinks ?? [])
    .filter(link => Boolean(link.url))
    .map(link => {
      const normalizedLabel = link.label.trim()
      const normalizedPlatform = link.platform?.trim().toLowerCase()
      const normalizedIcon = iconByPlatform[normalizedPlatform || '']

      return {
        label: normalizedLabel,
        platform: normalizedPlatform || 'default',
        iconName: normalizedIcon,
        url: link.url,
      }
    })
    .filter(link => Boolean(link.label && (link.platform === 'hacker-news' || link.iconName)))
})

const hasMetaRow = computed(() => {
  return Boolean(formattedDate.value || normalizedPublicationLinks.value.length > 0)
})

const normalizedTitleLines = computed(() => {
  const value = props.titleLines ?? 1
  return Math.min(6, Math.max(1, value))
})

const hasIcon = computed(() => {
  return Boolean(props.icon)
})

const headerStyle = computed(() => {
  return { '--title-lines': String(normalizedTitleLines.value) }
})

const headerInlineStyle = computed(() => {
  if (!hasIcon.value) {
    return undefined
  }

  return headerStyle.value
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.articleHeader {
  @apply flex flex-col;
}

.articleHeader[data-with-icon="true"] {
  @apply grid gap-x-3;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    ". meta"
    "icon title"
    ". topics";
}

.articleMeta {
  grid-area: meta;
  @apply m-0 mt-3 flex min-h-4 flex-wrap items-center gap-x-3 gap-y-1 leading-none;
}

.articleDate {
  @apply m-0 text-base leading-none tracking-wide text-faint;
}

.articleExternalLinks {
  @apply ml-auto flex items-center gap-2 leading-none;
}

.articlePlatformLink {
  @apply inline-flex items-center leading-none no-underline text-subtle transition-colors hover:text-body;
}

.articlePlatformLink :deep(.iconify),
.articlePlatformLink :deep(.nuxt-icon),
.articlePlatformLink :deep(svg) {
  @apply block size-4;
}

.articlePlatformLink[data-platform="x"] {
  @apply text-black hover:text-zinc-700;
}

.articlePlatformLink[data-platform="hacker-news"] {
  @apply text-orange-600 hover:text-orange-500;
}

.articlePlatformLink[data-platform="lobsters"] {
  @apply text-rose-600 hover:text-rose-500;
}

.articlePlatformLink[data-platform="reddit"] {
  @apply text-orange-600 hover:text-orange-500;
}

.articlePlatformLink[data-platform="linkedin"] {
  @apply text-blue-700 hover:text-blue-600;
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
  .articleHeader[data-with-icon="true"] {
    @apply flex flex-col;
  }

  .articleIconTop {
    @apply block;
  }

  .articleIcon {
    @apply hidden;
  }
}

@container content (min-width: 60ch) {
  .articleIconTop {
    @apply hidden;
  }

  .articleIcon {
    @apply block;
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

.articleTopics {
  grid-area: topics;
  @apply mt-3 flex flex-wrap gap-2 text-xs;
}
</style>
