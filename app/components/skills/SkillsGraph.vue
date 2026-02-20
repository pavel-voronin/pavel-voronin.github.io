<template>
  <div class="skillsRoot" :style="rootStyle">
    <ClientOnly fallback-tag="div" fallback=" ">
      <div class="skillsMobile">
        <component
          :is="mobileFocusedD3Component"
          class="skillsMount"
          :nodes="props.nodes"
          :edges="props.edges"
          :height="props.height"
          :interactive="props.interactive"
        />
      </div>

      <div class="skillsDesktop">
        <component
          :is="d3Component"
          class="skillsMount"
          :nodes="props.nodes"
          :edges="props.edges"
          :height="props.height"
          :interactive="props.interactive"
        />
      </div>

      <template #fallback>
        <div class="skillsFallback" aria-hidden="true" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import type { SkillEdge, SkillNode } from './skills-graph.types'

const props = withDefaults(
  defineProps<{
    nodes?: SkillNode[]
    edges?: SkillEdge[]
    height?: number
    interactive?: boolean
  }>(),
  {
    nodes: undefined,
    edges: undefined,
    height: undefined,
    interactive: true,
  },
)

const d3Component = defineAsyncComponent(() => import('./SkillsGraphD3Canvas.client.vue'))
const mobileFocusedD3Component = defineAsyncComponent(() => import('./SkillsGraphD3Focused.client.vue'))

const rootStyle = computed(() => {
  if (!props.height) {
    return undefined
  }

  return { height: `${props.height}px` }
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.skillsRoot {
  @apply w-full h-[20rem] md:h-[26.25rem] my-6;
}

.skillsMount {
  @apply block w-full h-full;
}

.skillsMobile {
  @apply block h-full w-full lg:hidden;
}

.skillsDesktop {
  @apply hidden h-full w-full lg:block;
}

.skillsFallback {
  @apply block w-full h-full rounded-2xl border border-edge/60;
}
</style>
