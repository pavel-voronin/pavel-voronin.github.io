<template>
  <nav v-if="articleLinks.length > 0" class="articleToc" :data-ready="isActiveReady ? 'true' : 'false'" aria-label="Table of contents">
    <ol class="articleTocMarkers">
      <li v-for="link in articleLinks" :key="`marker-${link.id}`" class="articleTocMarkerItem">
        <a
          :href="`#${link.id}`"
          class="articleTocMarker"
          :data-depth="link.depth"
          :data-visible="isActiveReady && isSectionVisible(link.id) ? 'true' : undefined"
          :aria-label="link.text"
        />
      </li>
    </ol>

    <div class="articleTocPanel">
      <ol class="articleTocList">
        <li v-for="link in articleLinks" :key="link.id" class="articleTocItem">
          <a
            :href="`#${link.id}`"
            class="articleTocLink"
            :data-depth="link.depth"
            :data-visible="isActiveReady && isSectionVisible(link.id) ? 'true' : undefined"
          >
            {{ link.text }}
          </a>
        </li>
      </ol>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { TocLink } from '@nuxt/content'

const props = defineProps<{
  links: TocLink[]
  introId: string
  introText: string
}>()

type ArticleTocLink = Pick<TocLink, 'id' | 'text' | 'depth'>

const visibleSectionIds = ref(new Set<string>())
const isActiveReady = ref(false)
const route = useRoute()

let headingElements: HTMLElement[] = []
let animationFrameId: number | null = null
const timeoutIds = new Set<number>()

function flattenLinks(links: TocLink[]): TocLink[] {
  return links.flatMap((link) => {
    return [link, ...flattenLinks(link.children ?? [])]
  })
}

const flatLinks = computed(() => {
  return flattenLinks(props.links)
})

const articleLinks = computed<ArticleTocLink[]>(() => {
  if (flatLinks.value.length === 0) {
    return []
  }

  return [
    {
      id: props.introId,
      text: props.introText,
      depth: 2,
    },
    ...flatLinks.value,
  ]
})

function isSectionVisible(id: string) {
  return visibleSectionIds.value.has(id)
}

function collectHeadingElements() {
  if (!import.meta.client) {
    headingElements = []
    return
  }

  headingElements = articleLinks.value
    .map(link => document.getElementById(link.id))
    .filter((heading): heading is HTMLElement => Boolean(heading))
}

function getArticleBottom() {
  return document.querySelector<HTMLElement>('.articleBody')?.getBoundingClientRect().bottom
    ?? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.scrollY
}

function syncVisibleSections(reveal = true) {
  if (!import.meta.client) {
    return
  }

  if (headingElements.length === 0) {
    visibleSectionIds.value = new Set()
    isActiveReady.value = false
    return
  }

  const viewportBottom = window.innerHeight
  const articleBottom = getArticleBottom()
  const headingRects = headingElements.map(heading => heading.getBoundingClientRect())
  const nextVisibleSectionIds = new Set<string>()

  for (const [index, heading] of headingElements.entries()) {
    const sectionTop = headingRects[index].top
    const sectionBottom = headingRects[index + 1]?.top ?? articleBottom

    if (sectionTop < viewportBottom && sectionBottom > 0) {
      nextVisibleSectionIds.add(heading.id)
    }
  }

  visibleSectionIds.value = nextVisibleSectionIds

  if (reveal) {
    isActiveReady.value = true
  }
}

function scheduleSyncVisibleSections(reveal = true) {
  if (!import.meta.client) {
    return
  }

  if (animationFrameId !== null) {
    return
  }

  animationFrameId = window.requestAnimationFrame(() => {
    animationFrameId = null
    syncVisibleSections(reveal)
  })
}

function syncAfterLayoutSettles(delayMs: number, reveal = true) {
  if (!import.meta.client) {
    return
  }

  const timeoutId = window.setTimeout(() => {
    timeoutIds.delete(timeoutId)
    collectHeadingElements()
    syncVisibleSections(reveal)
  }, delayMs)

  timeoutIds.add(timeoutId)
}

function handleViewportChange() {
  scheduleSyncVisibleSections()
}

watch(articleLinks, async () => {
  visibleSectionIds.value = new Set()
  isActiveReady.value = false
  await nextTick()
  collectHeadingElements()
  syncVisibleSections(false)
  scheduleSyncVisibleSections(false)
  syncAfterLayoutSettles(100)
  syncAfterLayoutSettles(500)
}, { immediate: true })

watch(() => route.hash, async () => {
  await nextTick()
  collectHeadingElements()
  syncVisibleSections()
  scheduleSyncVisibleSections()
  syncAfterLayoutSettles(100)
})

onMounted(() => {
  window.addEventListener('scroll', handleViewportChange, { passive: true })
  window.addEventListener('resize', handleViewportChange, { passive: true })
  window.addEventListener('load', handleViewportChange, { passive: true })
  window.addEventListener('pageshow', handleViewportChange, { passive: true })
})

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  if (animationFrameId !== null) {
    window.cancelAnimationFrame(animationFrameId)
  }

  for (const timeoutId of timeoutIds) {
    window.clearTimeout(timeoutId)
  }

  window.removeEventListener('scroll', handleViewportChange)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('load', handleViewportChange)
  window.removeEventListener('pageshow', handleViewportChange)
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.articleToc {
  @apply fixed right-8 top-1/2 z-40 hidden w-12 -translate-y-1/2 transition-[width] duration-150 toc:block;
}

.articleToc[data-ready="false"] {
  @apply pointer-events-none opacity-0;
}

.articleToc:hover,
.articleToc:focus-within {
  @apply w-72;
}

.articleTocMarkers {
  @apply flex max-h-[calc(100vh-7rem)] flex-col items-center gap-4 overflow-hidden py-2 transition-opacity duration-150;
}

.articleToc:hover .articleTocMarkers,
.articleToc:focus-within .articleTocMarkers {
  @apply opacity-0;
}

.articleTocMarkerItem {
  @apply flex justify-center;
}

.articleTocMarker {
  @apply block h-1 w-6 rounded-full bg-faint/80 transition-colors duration-100 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent;
}

.articleTocMarker[data-depth="2"] {
  @apply w-[18px];
}

.articleTocMarker[data-depth="3"] {
  @apply w-3 bg-faint/70;
}

.articleTocMarker[data-depth="4"] {
  @apply w-2.5 bg-faint/60;
}

.articleTocMarker[data-visible="true"] {
  @apply bg-heading shadow-sm shadow-overlay/20;
}

.articleTocPanel {
  @apply pointer-events-none absolute right-0 top-0 max-h-[calc(100vh-7rem)] w-72 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-sm bg-surface/95 p-4 opacity-0 shadow-xl shadow-overlay/10 ring-1 ring-edge-light backdrop-blur transition-opacity duration-150;
}

.articleToc:hover .articleTocPanel,
.articleToc:focus-within .articleTocPanel {
  @apply pointer-events-auto opacity-100;
}

.articleTocList {
  @apply m-0 flex list-none flex-col gap-1 p-0;
}

.articleTocItem {
  @apply min-w-0;
}

.articleTocLink {
  @apply block rounded-sm px-2 py-1.5 text-base leading-snug text-body no-underline transition-colors hover:bg-edge-light hover:text-heading focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent;
}

.articleTocLink[data-depth="3"] {
  @apply py-1 pl-5 text-sm text-muted;
}

.articleTocLink[data-depth="4"] {
  @apply py-1 pl-8 text-xs text-muted;
}

.articleTocLink[data-visible="true"] {
  @apply bg-edge-light text-heading;
}
</style>
