<template>
  <ul class="postsList">
    <li v-for="post in posts" :key="post.path" class="postItem">
      <span class="postDateSlot">
        <time v-if="post.date" :datetime="post.date" class="postDate">{{ formatPostDate(post.date) }}</time>
      </span>
      <AppLink :to="post.path" class="postLink">{{ post.title }}</AppLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
type PostListItem = {
  path: string
  title: string
  date?: string | null
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
  @apply grid items-baseline gap-4;
  grid-template-columns: 6rem minmax(0, 1fr);
}

.postItem + .postItem {
  @apply mt-3 border-t border-edge-light/80 pt-3;
}

.postLink {
  @apply block w-full min-w-0 truncate;
}

.postDateSlot {
  @apply block;
}

.postDate {
  @apply block whitespace-nowrap text-xs uppercase tracking-widest text-caption;
}
</style>
