<template>
  <nav class="languageLinks" aria-label="Article language versions">
    <span class="languageIntro">
      <Icon name="streamline-ultimate-color:messages-people-person-bubble-circle-1" class="languageGlyph" />
      <span class="languageLabel">Read in</span>
    </span>
    <div class="languageList">
      <NuxtLink
        v-for="language in languages"
        :key="language.path"
        :to="language.path"
        class="languageOption"
        :data-current="language.isCurrent ? 'true' : 'false'"
      >
        {{ language.label }}
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPath?: string
  translations?: Array<{
    language: string
    path: string
    title: string
  }> | null
}>()

const normalizedPath = computed(() => {
  return `/${(props.currentPath ?? '').replace(/^\/+|\/+$/g, '')}`
})

const languageLabel = (value: string) => {
  return value.trim().toUpperCase()
}

const languages = computed(() => {
  return (props.translations ?? []).map((translation) => {
    return {
      label: languageLabel(translation.language),
      path: translation.path,
      isCurrent: translation.path === normalizedPath.value,
    }
  })
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.languageLinks {
  @apply my-2 inline-flex flex-wrap items-center gap-2 text-sm text-body;
}

.languageIntro {
  @apply inline-flex items-center gap-1.5 font-medium text-subtle;
}

.languageGlyph {
  @apply size-6 shrink-0;
}

.languageLabel {
  @apply leading-none;
}

.languageList {
  @apply inline-flex gap-1.5;
}

.languageOption {
  @apply rounded-sm border border-edge px-3 py-1.5 font-bold leading-none no-underline text-muted transition-colors hover:border-accent-soft hover:bg-accent-surface/50 hover:text-heading;
}

.languageOption[data-current="true"] {
  @apply border-accent-soft bg-accent-surface text-accent;
}
</style>
