<template>
  <header class="articleHeader" :data-with-icon="hasIcon ? 'true' : 'false'" :style="headerInlineStyle">
    <div v-if="props.icon" class="articleIconTop">
      <Icon :name="props.icon" />
    </div>

    <div v-if="hasMetaRow" class="articleMeta">
      <p v-if="formattedDate" class="articleDate">
        {{ formattedDate }}
      </p>

    </div>
    <div v-if="props.icon" class="articleIcon">
      <Icon :name="props.icon" />
    </div>

    <h1 class="articleHeading">
      <ArticleTitleText :title="props.title" :title-easter-egg="props.titleEasterEgg" />
    </h1>

    <div v-if="normalizedTopics.length > 0" class="articleTopics">
      <AppLink to="/blog" silent no-visited class="articleBackLink">
        &lt;- back to blog
      </AppLink>

      <TopicBadge
        v-for="topic in normalizedTopics"
        :key="topic"
        :topic="topic"
      />

      <ArticleReadingTime
        v-if="normalizedReadingTime"
        :minutes="normalizedReadingTime.minutes"
        :fast-minutes="normalizedReadingTime.fastMinutes"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { TitleEasterEggConfig } from '~/utils/titleFormatting'

const props = defineProps<{
  title: string
  date?: string
  dateUpdated?: string
  icon?: string
  topics?: string[]
  titleLines?: number
  titleEasterEgg?: TitleEasterEggConfig | null
  readingTime?: {
    minutes?: number | null
    fastMinutes?: number | null
  } | null
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

const normalizedReadingTime = computed(() => {
  const minutes = props.readingTime?.minutes
  const fastMinutes = props.readingTime?.fastMinutes

  if (typeof minutes !== 'number' || typeof fastMinutes !== 'number') {
    return null
  }

  return {
    minutes: Math.max(1, Math.round(minutes)),
    fastMinutes: Math.max(1, Math.round(fastMinutes)),
  }
})

const hasMetaRow = computed(() => {
  return Boolean(formattedDate.value)
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

.articleBackLink {
  @apply inline-flex items-baseline gap-1 rounded-sm py-0.5 pr-2 font-medium text-faint transition-colors hover:text-body;
}
</style>
