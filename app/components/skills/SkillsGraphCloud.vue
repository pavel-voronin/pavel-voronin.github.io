<template>
  <div ref="rootRef" class="cloudRoot" :style="rootStyle">
    <div v-if="isEmpty" class="cloudEmpty">
      Skills graph is empty.
    </div>

    <div v-else class="cloudStage">
      <button
        class="cloudCenter"
        type="button"
        :style="centerStyle"
        :disabled="!props.interactive"
        :aria-label="`Center skill ${centerNode?.label ?? ''}`"
        @click="onNodeSelect(centerNode?.id)"
      >
        {{ centerNode?.label }}
      </button>

      <button
        v-for="item in laidOutNeighbors"
        :key="item.node.id"
        class="cloudNode"
        type="button"
        :style="getNeighborStyle(item)"
        :disabled="!props.interactive"
        :aria-label="`Select skill ${item.node.label}`"
        @click="onNodeSelect(item.node.id)"
      >
        {{ item.node.label }}
      </button>

      <p v-if="laidOutNeighbors.length === 0" class="cloudHint">
        No linked skills yet.
      </p>
    </div>

    <ul class="cloudSrOnly">
      <li v-for="node in resolvedNodes" :key="node.id" class="cloudSrOnlyItem">
        {{ node.label }} ({{ node.category }}, level {{ node.level }})
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DEFAULT_SKILL_EDGES, DEFAULT_SKILL_NODES } from './skills-graph.data'
import {
  computeCloudLayout,
  getCategoryColor,
  getCloudDistanceScale,
  getCloudFontSize,
  getMostConnectedNodeId,
  getNodeNeighborhood,
  normalizeSkillGraph,
} from './skills-graph.model'
import type { SkillEdge, SkillNode } from './skills-graph.types'

interface PositionedNeighbor {
  node: SkillNode
  distance: number
  reachable: boolean
  weight: number
  score: number
  fontSize: number
  x: number
  y: number
  depth: number
  scale: number
}

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

const rootRef = ref<HTMLElement | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)
const width = ref(1)
const height = ref(320)
const selectedNodeId = ref<string | null>(null)

const resolvedData = computed(() => {
  const rawNodes = props.nodes ?? DEFAULT_SKILL_NODES
  const rawEdges = props.edges ?? DEFAULT_SKILL_EDGES
  return normalizeSkillGraph(rawNodes, rawEdges)
})

const resolvedNodes = computed(() => resolvedData.value.nodes)
const resolvedEdges = computed(() => resolvedData.value.edges)
const isEmpty = computed(() => resolvedNodes.value.length === 0)

const centerNodeId = computed(() => {
  if (isEmpty.value) {
    return null
  }

  if (selectedNodeId.value && resolvedNodes.value.some((node) => node.id === selectedNodeId.value)) {
    return selectedNodeId.value
  }

  return getMostConnectedNodeId(resolvedNodes.value, resolvedEdges.value)
})

const centerNode = computed(() => {
  if (!centerNodeId.value) {
    return null
  }

  return resolvedNodes.value.find((node) => node.id === centerNodeId.value) ?? null
})

const neighborhood = computed(() => {
  if (!centerNodeId.value) {
    return []
  }

  return getNodeNeighborhood(centerNodeId.value, resolvedNodes.value, resolvedEdges.value)
})

const laidOutNeighbors = computed<PositionedNeighbor[]>(() => {
  if (neighborhood.value.length === 0) {
    return []
  }

  const layoutInput = neighborhood.value.map((item) => ({
    id: item.node.id,
    label: item.node.label,
    fontSize: Math.max(
      10,
      Math.round(
        getCloudFontSize(item.node.level, item.weight) *
          getCloudDistanceScale(item.distance, item.reachable),
      ),
    ),
    score: item.score,
  }))

  const layout = computeCloudLayout(layoutInput, width.value, height.value, centerNodeId.value ?? undefined)
  const layoutById = new Map(layout.map((item) => [item.id, item]))

  return neighborhood.value
    .map((item): PositionedNeighbor | null => {
      const positioned = layoutById.get(item.node.id)
      if (!positioned) {
        return null
      }

      return {
        ...item,
        fontSize: Math.max(
          10,
          Math.round(
            getCloudFontSize(item.node.level, item.weight) *
              getCloudDistanceScale(item.distance, item.reachable),
          ),
        ),
        x: positioned.x,
        y: positioned.y,
        depth: positioned.depth,
        scale: positioned.scale,
      }
    })
    .filter((item): item is PositionedNeighbor => Boolean(item))
})

const rootStyle = computed(() => {
  if (!props.height) {
    return undefined
  }

  return { height: `${props.height}px` }
})

const centerStyle = computed(() => {
  if (!centerNode.value) {
    return undefined
  }

  return {
    color: getCategoryColor(centerNode.value.category),
    fontSize: `${Math.round(getCloudFontSize(centerNode.value.level, 1.6) * 1.28)}px`,
  }
})

const getNeighborStyle = (item: PositionedNeighbor) => {
  const maxOpacity = item.reachable ? 1 : 0.78
  const opacity = Math.min(maxOpacity, 0.56 + item.depth * 0.52)
  return {
    left: `${item.x}px`,
    top: `${item.y}px`,
    color: getCategoryColor(item.node.category),
    fontSize: `${item.fontSize}px`,
    opacity: `${Math.round(opacity * 100) / 100}`,
    zIndex: `${Math.round(item.depth * 100)}`,
  }
}

const onNodeSelect = (nodeId?: string | null) => {
  if (!props.interactive || !nodeId) {
    return
  }

  selectedNodeId.value = nodeId
}

const updateSize = () => {
  const element = rootRef.value
  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()
  width.value = Math.max(1, Math.floor(rect.width))
  height.value = Math.max(1, Math.floor(rect.height))
}

const initializeCenterNode = () => {
  if (isEmpty.value) {
    selectedNodeId.value = null
    return
  }

  if (selectedNodeId.value && resolvedNodes.value.some((node) => node.id === selectedNodeId.value)) {
    return
  }

  selectedNodeId.value = getMostConnectedNodeId(resolvedNodes.value, resolvedEdges.value)
}

watch(
  () => [props.nodes, props.edges],
  async () => {
    await nextTick()
    updateSize()
    initializeCenterNode()
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  updateSize()
  initializeCenterNode()

  if (rootRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      updateSize()
    })
    resizeObserver.value.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver.value?.disconnect()
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.cloudRoot {
  @apply relative w-full h-[20rem] md:h-[26.25rem] overflow-hidden rounded-2xl;
}

.cloudStage {
  @apply relative h-full w-full rounded-2xl border border-edge/60 bg-surface/50;
}

.cloudCenter {
  @apply absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-center font-semibold leading-none transition-opacity disabled:cursor-default disabled:opacity-100;
}

.cloudNode {
  @apply absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 text-center leading-none transition-opacity hover:opacity-75 focus-visible:opacity-75 disabled:cursor-default disabled:opacity-100;
}

.cloudHint {
  @apply absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-muted;
}

.cloudEmpty {
  @apply flex h-full w-full items-center justify-center text-sm text-muted;
}

.cloudSrOnly {
  @apply sr-only;
}

.cloudSrOnlyItem {
  @apply sr-only;
}
</style>
