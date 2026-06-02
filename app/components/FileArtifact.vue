<template>
  <section class="fileArtifact" :data-expanded="isOpen">
    <div
      class="fileArtifactHeader"
      :data-has-description="hasDescription"
      :data-has-icon="hasIcon"
      :data-is-previewable="props.expandable"
      @click="togglePreview"
    >
      <Icon v-if="props.icon" :name="props.icon" class="fileArtifactIcon" />

      <div class="fileArtifactCopy">
        <p class="fileArtifactTitle">
          {{ props.name }}
        </p>
        <p v-if="props.description" class="fileArtifactDescription">
          {{ props.description }}
        </p>
      </div>

      <a class="fileArtifactDownload" :href="props.filename" :download="fileName" @click.stop>
        <Icon name="lucide:download" class="fileArtifactDownloadIcon" />
        <span class="fileArtifactFileName">{{ fileName }}</span>
      </a>

      <button
        v-if="props.expandable"
        class="fileArtifactToggle"
        type="button"
        :title="toggleLabel"
        @click.stop="togglePreview"
      >
        <Icon name="lucide:chevron-down" class="fileArtifactToggleIcon" />
      </button>
    </div>

    <div v-if="props.expandable && isOpen" class="fileArtifactPreview">
      <p v-if="previewStatus === 'idle' || previewStatus === 'loading'" class="fileArtifactPreviewStatus">
        Loading preview...
      </p>
      <p v-else-if="previewStatus === 'error'" class="fileArtifactPreviewStatus">
        Could not load this file preview. Download the file instead.
      </p>
      <div v-else class="fileArtifactPreviewBlock">
        <ProsePre>
          <code>{{ previewText }}</code>
        </ProsePre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type PreviewStatus = 'idle' | 'loading' | 'ready' | 'error'

const props = withDefaults(defineProps<{
  name: string
  filename: string
  description?: string
  icon?: string
  expandable?: boolean
}>(), {
  description: '',
  icon: '',
  expandable: false,
})

const previewText = ref('')
const previewStatus = ref<PreviewStatus>('idle')

const hasDescription = computed(() => {
  return props.description.trim().length > 0
})

const hasIcon = computed(() => {
  return props.icon.trim().length > 0
})

const fileName = computed(() => {
  try {
    const parsedUrl = new URL(props.filename, 'https://example.invalid')
    const lastSegment = parsedUrl.pathname.split('/').filter(Boolean).pop()

    return lastSegment ? decodeURIComponent(lastSegment) : 'download'
  }
  catch {
    return 'download'
  }
})

const isOpen = ref(false)

const toggleLabel = computed(() => {
  const action = isOpen.value ? 'Hide' : 'Show'

  return `${action} ${fileName.value}`
})

const loadPreview = async () => {
  if (!import.meta.client || !props.expandable || previewStatus.value !== 'idle') {
    return
  }

  previewStatus.value = 'loading'

  try {
    const response = await fetch(props.filename)
    if (!response.ok) {
      throw new Error(`Failed to load ${props.filename}`)
    }

    previewText.value = await response.text()
    previewStatus.value = 'ready'
  }
  catch {
    previewStatus.value = 'error'
  }
}

const togglePreview = () => {
  if (!props.expandable) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value) {
    void loadPreview()
  }
}

</script>

<style scoped>
@reference "~/assets/css/main.css";

.fileArtifact {
  @apply my-8 overflow-hidden rounded-lg border border-edge bg-surface;
}

.fileArtifactHeader {
  @apply grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4;
}

.fileArtifactHeader[data-is-previewable="true"] {
  @apply grid-cols-[minmax(0,1fr)_auto_auto] cursor-pointer;
}

.fileArtifactHeader[data-has-icon="true"] {
  @apply grid-cols-[auto_minmax(0,1fr)_auto];
}

.fileArtifactHeader[data-has-icon="true"][data-is-previewable="true"] {
  @apply grid-cols-[auto_minmax(0,1fr)_auto_auto];
}

.fileArtifactIcon {
  @apply size-12 shrink-0 self-center text-heading;
}

.fileArtifactHeader[data-has-description="true"] .fileArtifactIcon {
  @apply self-start;
}

.fileArtifactCopy {
  @apply min-w-0 self-center overflow-hidden;
}

.fileArtifactHeader[data-has-description="true"] .fileArtifactCopy {
  @apply self-start;
}

.fileArtifactTitle {
  @apply m-0 text-base font-semibold leading-snug text-heading;
}

.fileArtifactDescription {
  @apply m-0 mt-2 line-clamp-1 text-sm leading-relaxed text-subtle;
}

.fileArtifact[data-expanded="true"] .fileArtifactDescription {
  @apply line-clamp-none;
}

.fileArtifactDownload {
  @apply inline-flex min-w-0 max-w-64 items-center gap-2 rounded-lg border border-edge bg-surface px-3 py-2 text-sm font-semibold text-heading no-underline transition-colors hover:border-faint hover:text-heading hover:no-underline;
}

.fileArtifactHeader[data-has-description="true"] .fileArtifactDownload {
  @apply mt-1.5 self-start;
}

.fileArtifactDownloadIcon {
  @apply size-4 shrink-0;
}

.fileArtifactFileName {
  @apply min-w-0 truncate;
}

.fileArtifactToggle {
  @apply inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-edge bg-surface text-heading transition-colors hover:border-faint;
}

.fileArtifactHeader[data-has-description="true"] .fileArtifactToggle {
  @apply mt-1.5 self-start;
}

.fileArtifactToggleIcon {
  @apply size-4 transition-transform;
}

.fileArtifact[data-expanded="true"] .fileArtifactToggleIcon {
  @apply rotate-180;
}

.fileArtifactPreview {
  @apply border-t border-edge;
}

.fileArtifactPreviewStatus {
  @apply m-0 p-4 text-sm text-muted;
}

.fileArtifactPreview :deep(.prosePre) {
  @apply my-0 rounded-none;
}
</style>
