<template>
  <ul class="postsList">
    <li v-for="post in normalizedPosts" :key="post.path" class="postItem">
      <span class="postDateSlot">
        <time v-if="post.date" :datetime="post.date" class="postDate">{{ formatPostDate(post.date) }}</time>
      </span>
      <span class="postContent">
        <NuxtLink :to="post.path" class="postLink">
          <span v-if="post.icon" class="postIcon">
            <Icon :name="post.icon" />
          </span>
          <span class="postTitle">
            <ArticleTitleText :title="post.title" />
          </span>
        </NuxtLink>&nbsp;<span class="postLanguageJoin" :aria-label="post.languageLabel">
          <span class="postLanguageTags">
            <NuxtLink
              v-for="language in post.languageLinks"
              :key="`${language.code}-${language.path}`"
              :to="language.path"
              class="postLanguageTag"
              :aria-label="language.label"
            >
              {{ language.code }}
            </NuxtLink>
          </span>
        </span>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
type PostLanguageLink = {
  language: string
  path: string
}

type PostListItem = {
  path: string
  title: string
  date?: string | null
  icon?: string | null
  languageLinks: [PostLanguageLink, ...PostLanguageLink[]]
}

const props = withDefaults(defineProps<{
  posts?: PostListItem[] | null
}>(), {
  posts: () => [],
})

const FULL_DATE_WINDOW_MS = 365 * 24 * 60 * 60 * 1000

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})

const recentDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
})

const toLanguageCode = (value: string) => {
  return value.trim().toUpperCase()
}

const toLanguageLinkLabel = (postTitle: string, languageCode: string) => {
  return `Read ${postTitle} in ${languageCode}`
}

const normalizedPosts = computed(() => {
  return (props.posts ?? []).map((post) => {
    const languageLinks = post.languageLinks.map((languageLink) => {
      const code = toLanguageCode(languageLink.language)

      return {
        code,
        path: languageLink.path,
        label: toLanguageLinkLabel(post.title, code),
      }
    })

    return {
      ...post,
      languageLinks,
      languageLabel: `Available languages: ${languageLinks.map(languageLink => languageLink.code).join(', ')}`,
    }
  })
})

const formatPostDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const isRecent = Date.now() - date.getTime() < FULL_DATE_WINDOW_MS
  return (isRecent ? recentDateFormatter : fullDateFormatter).format(date)
}
</script>

<style scoped>
@reference "~/assets/css/main.css";

.postsList {
  @apply m-0 list-none p-0;
}

.postItem {
  @apply grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-x-0 gap-y-0;
}

.postItem + .postItem {
  @apply mt-3 border-t border-edge-light/80 pt-3;
}

.postContent {
  @apply block min-w-0 text-pretty;
}

.postLink {
  @apply inline text-accent underline underline-offset-2 hover:text-accent-soft;
}

.postIcon {
  @apply mr-1.5 inline-flex align-middle *:size-[1em];
}

.postTitle {
  @apply inline whitespace-normal wrap-break-word;
}

.postLanguageJoin {
  @apply whitespace-nowrap opacity-0 transition-opacity duration-150;
}

.postItem:hover .postLanguageJoin,
.postItem:focus-within .postLanguageJoin {
  @apply opacity-100;
}

.postLanguageTags {
  @apply inline-flex items-center gap-1 align-baseline;
}

.postLanguageTag {
  @apply inline-flex h-[0.95rem] items-center rounded-[0.1875rem] border border-edge bg-transparent px-1 text-[0.625rem] font-bold uppercase leading-none text-caption no-underline transition-colors hover:border-accent-soft hover:bg-accent-surface/70 hover:text-accent focus-visible:border-accent-soft focus-visible:bg-accent-surface/70 focus-visible:text-accent focus-visible:outline-none;
}

.postDateSlot {
  @apply flex justify-start pt-[0.46em];
}

.postDate {
  @apply block whitespace-nowrap text-left text-xs uppercase tracking-widest text-caption leading-none;
}
</style>
