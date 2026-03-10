<template>
  <header class="articleHeader" :data-with-icon="hasIcon ? 'true' : 'false'" :style="headerInlineStyle">
    <div v-if="props.icon" class="articleIconTop">
      <Icon :name="props.icon" />
    </div>

    <p v-if="formattedDate" class="articleDate">
      {{ formattedDate }}
    </p>

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
  icon?: string
  topics?: string[]
  titleLines?: number
}>()

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formattedDate = computed(() => {
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
    ". date"
    "icon title"
    ". topics";
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
