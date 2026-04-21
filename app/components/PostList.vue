<template>
  <ul class="postsList">
    <li v-for="post in posts" :key="post.path" class="postItem">
      <span class="postDateSlot">
        <time v-if="post.date" :datetime="post.date" class="postDate">{{ formatPostDate(post.date) }}</time>
      </span>
      <AppLink :to="post.path" class="postLink">
        <template v-if="post.icon" #left>
          <Icon :name="post.icon" />
        </template>
        <span class="postTitle">{{ post.title }}</span>
      </AppLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
type PostListItem = {
  path: string
  title: string
  date?: string | null
  icon?: string | null
}

withDefaults(defineProps<{
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
  @apply grid items-start gap-x-4 gap-y-0;
  grid-template-columns: 4rem minmax(0, 1fr);
}

.postItem + .postItem {
  @apply mt-3 border-t border-edge-light/80 pt-3;
}

.postLink {
  @apply inline-flex min-w-0 items-start gap-1.5;
}

.postTitle {
  @apply block min-w-0 flex-1 whitespace-normal break-words;
}

.postLink :deep(.icon) {
  @apply self-start pt-[0.22em];
}

.postDateSlot {
  @apply flex justify-center pt-[0.48em];
}

.postDate {
  @apply block whitespace-nowrap text-center text-xs uppercase tracking-widest text-caption leading-none;
}
</style>
