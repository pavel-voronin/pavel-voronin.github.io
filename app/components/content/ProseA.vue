<template>
  <AppLink :to="to" :href="href" :target="props.target">
    <slot />
  </AppLink>
</template>

<script setup lang="ts">
const props = defineProps({
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: undefined,
    required: false,
  },
})

const isExternal = computed(() => {
  return /^(https?:\/\/|mailto:|tel:|\/\/)/.test(props.href)
})

const isHash = computed(() => {
  return props.href.startsWith('#')
})

const to = computed(() => {
  return !isExternal.value && !isHash.value ? props.href : undefined
})

const href = computed(() => {
  return isExternal.value || isHash.value ? props.href : undefined
})
</script>
