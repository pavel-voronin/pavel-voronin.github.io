<template>
  <section class="commentsSection">
    <h2 class="commentsHeading">
      Comments
    </h2>
    <div ref="commentsEmbed" class="commentsEmbed" />
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const commentsEmbed = ref<HTMLElement | null>(null)

const props = defineProps<{
  issueTerm: string
}>()

const mountCommentsWidget = () => {
  if (!import.meta.client || !commentsEmbed.value) {
    return
  }

  commentsEmbed.value.innerHTML = ''

  const script = document.createElement('script')
  script.src = 'https://utteranc.es/client.js'
  script.setAttribute('repo', 'pavel-voronin/pavel-voronin.github.io')
  script.setAttribute('issue-term', props.issueTerm)
  script.setAttribute('label', 'comment')
  script.setAttribute('theme', 'github-light')
  script.setAttribute('crossorigin', 'anonymous')
  script.async = true

  commentsEmbed.value.append(script)
}

onMounted(async () => {
  await nextTick()
  mountCommentsWidget()
})

watch(() => [route.path, props.issueTerm], async () => {
  await nextTick()
  mountCommentsWidget()
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.commentsSection {
  @apply mt-12;
}

.commentsHeading {
  @apply m-0 mb-4 text-2xl font-bold leading-tight tracking-tight text-heading;
}

.commentsEmbed {
  @apply mt-2;
}
</style>
