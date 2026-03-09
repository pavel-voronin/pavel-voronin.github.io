<template>
  <div class="externalLinkCard">
    <p v-if="props.label" class="externalLinkCardLabel">
      {{ props.label }}
    </p>

    <div class="externalLinkCardContent" :class="contentClass">
      <div v-if="props.icon" class="externalLinkCardIcon" :class="iconClass">
        <Icon :name="props.icon" />
      </div>

      <p v-if="props.title" class="externalLinkCardTitle">
        {{ props.title }}
      </p>

      <AppLink :href="props.url" target="_blank" class="externalLinkCardUrl">
        {{ props.url }}
      </AppLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  title?: string
  label?: string
  icon?: string
}>()

const hasTitle = computed(() => {
  return Boolean(props.title)
})

const hasIcon = computed(() => {
  return Boolean(props.icon)
})

const contentClass = computed(() => {
  return {
    'externalLinkCardContent--withIcon': hasIcon.value,
    'externalLinkCardContent--withTitle': hasTitle.value,
    'externalLinkCardContent--withoutTitle': !hasTitle.value,
  }
})

const iconClass = computed(() => {
  return hasTitle.value
    ? 'externalLinkCardIcon--double'
    : 'externalLinkCardIcon--single'
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.externalLinkCard {
  @apply my-8 rounded-xl border border-edge bg-surface px-4 py-3 text-left;
}

.externalLinkCardLabel {
  @apply m-0 mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-faint;
}

.externalLinkCardContent {
  @apply flex min-w-0 flex-col items-start gap-1;
}

.externalLinkCardContent--withIcon {
  @apply grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3;
}

.externalLinkCardContent--withIcon .externalLinkCardIcon {
  @apply col-start-1 row-start-1;
}

.externalLinkCardContent--withIcon .externalLinkCardTitle {
  @apply col-start-2 row-start-1;
}

.externalLinkCardContent--withIcon .externalLinkCardUrl {
  @apply col-start-2 row-start-2;
}

.externalLinkCardContent--withIcon.externalLinkCardContent--withTitle .externalLinkCardIcon {
  @apply row-span-2;
}

.externalLinkCardContent--withIcon.externalLinkCardContent--withoutTitle .externalLinkCardUrl {
  @apply row-start-1;
}

.externalLinkCardContent--withIcon.externalLinkCardContent--withoutTitle {
  @apply items-center;
}

.externalLinkCardIcon {
  @apply text-heading;
}

.externalLinkCardIcon--single {
  @apply h-[1em] w-[1em];
}

.externalLinkCardIcon--double {
  @apply h-12 w-12;
}

.externalLinkCardIcon :deep(.iconify),
.externalLinkCardIcon :deep(.nuxt-icon),
.externalLinkCardIcon :deep(svg) {
  @apply block h-full w-full;
}

.externalLinkCardTitle {
  @apply m-0 text-sm font-medium tracking-wide text-subtle;
}

.externalLinkCardUrl {
  @apply min-w-0 break-all;
}
</style>
