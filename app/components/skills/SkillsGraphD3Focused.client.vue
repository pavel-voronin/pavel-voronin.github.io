<template>
  <div class="focusRoot" :style="rootStyle">
    <div v-if="isEmpty" class="focusEmpty">
      Skills graph is empty.
    </div>

    <canvas
      v-else
      ref="canvasRef"
      class="focusCanvas"
      aria-label="Interactive focused skills graph"
      @pointerdown="onPointerDown"
    />

    <ul class="focusSrOnly">
      <li v-for="node in resolvedNodes" :key="node.id" class="focusSrOnlyItem">
        {{ node.label }} ({{ node.category }}, level {{ node.level }})
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DEFAULT_SKILL_EDGES, DEFAULT_SKILL_NODES } from './skills-graph.data'
import { getCategoryColor, getMostConnectedNodeId, getNodeVisual, normalizeSkillGraph } from './skills-graph.model'
import type { SkillEdge, SkillNode } from './skills-graph.types'

interface FocusNode extends SimulationNodeDatum, SkillNode {
  homeX: number
  homeY: number
}

interface FocusEdge extends SimulationLinkDatum<FocusNode> {
  source: string | FocusNode
  target: string | FocusNode
  weight: number
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

const canvasRef = ref<HTMLCanvasElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)
const simulation = ref<Simulation<FocusNode, FocusEdge> | null>(null)
const simulationNodes = ref<FocusNode[]>([])
const simulationEdges = ref<FocusEdge[]>([])
const selectedNodeId = ref<string | null>(null)
const distanceMap = ref<Map<string, number>>(new Map())

const dpr = ref(1)
const width = ref(1)
const height = ref(320)
const transform = ref({ x: 0, y: 0, k: 1 })

const resolvedData = computed(() => {
  const rawNodes = props.nodes ?? DEFAULT_SKILL_NODES
  const rawEdges = props.edges ?? DEFAULT_SKILL_EDGES
  return normalizeSkillGraph(rawNodes, rawEdges)
})

const resolvedNodes = computed(() => resolvedData.value.nodes)
const isEmpty = computed(() => resolvedNodes.value.length === 0)

const rootStyle = computed(() => {
  if (!props.height) {
    return undefined
  }

  return { height: `${props.height}px` }
})

const centerSelection = () => {
  if (simulationNodes.value.length === 0) {
    selectedNodeId.value = null
    return
  }

  if (selectedNodeId.value && simulationNodes.value.some((node) => node.id === selectedNodeId.value)) {
    return
  }

  selectedNodeId.value = getMostConnectedNodeId(resolvedData.value.nodes, resolvedData.value.edges)
}

const updateDistanceMap = () => {
  const centerId = selectedNodeId.value
  const nextMap = new Map<string, number>()
  if (!centerId) {
    distanceMap.value = nextMap
    return
  }

  const adjacency = new Map<string, string[]>()
  for (const node of simulationNodes.value) {
    adjacency.set(node.id, [])
  }
  for (const edge of simulationEdges.value) {
    const source = typeof edge.source === 'string' ? edge.source : edge.source.id
    const target = typeof edge.target === 'string' ? edge.target : edge.target.id
    adjacency.get(source)?.push(target)
    adjacency.get(target)?.push(source)
  }

  const queue: string[] = [centerId]
  nextMap.set(centerId, 0)

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) {
      continue
    }
    const currentDistance = nextMap.get(current) ?? 0
    for (const neighborId of adjacency.get(current) ?? []) {
      if (nextMap.has(neighborId)) {
        continue
      }
      nextMap.set(neighborId, currentDistance + 1)
      queue.push(neighborId)
    }
  }

  distanceMap.value = nextMap
}

const updateTransform = () => {
  transform.value = {
    x: width.value / 2,
    y: height.value / 2,
    k: Math.min(1.25, Math.max(0.78, Math.min(width.value, height.value) / 410)),
  }
}

const toWorldPoint = (clientX: number, clientY: number) => {
  const canvas = canvasRef.value
  if (!canvas) {
    return { x: 0, y: 0 }
  }

  const rect = canvas.getBoundingClientRect()
  return {
    x: (clientX - rect.left - transform.value.x) / transform.value.k,
    y: (clientY - rect.top - transform.value.y) / transform.value.k,
  }
}

const getNodeAtPosition = (clientX: number, clientY: number): FocusNode | null => {
  const world = toWorldPoint(clientX, clientY)

  for (let index = simulationNodes.value.length - 1; index >= 0; index -= 1) {
    const node = simulationNodes.value[index]
    const fontSize = getRenderedFontSize(node)
    const nodeX = node.x ?? 0
    const nodeY = node.y ?? 0
    const textWidth = Math.max(18, node.label.length * fontSize * 0.58)
    const textHalfWidth = textWidth / 2 + 4
    const textHalfHeight = fontSize * 0.66 + 4
    const inText =
      world.x >= nodeX - textHalfWidth &&
      world.x <= nodeX + textHalfWidth &&
      world.y >= nodeY - textHalfHeight &&
      world.y <= nodeY + textHalfHeight

    if (inText) {
      return node
    }
  }

  return null
}

const render = () => {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.setTransform(dpr.value, 0, 0, dpr.value, 0, 0)
  context.translate(transform.value.x, transform.value.y)
  context.scale(transform.value.k, transform.value.k)

  const ordered = [...simulationNodes.value].sort((left, right) => {
    if (left.id === selectedNodeId.value) {
      return 1
    }
    if (right.id === selectedNodeId.value) {
      return -1
    }
    return (left.level ?? 1) - (right.level ?? 1)
  })

  for (const node of ordered) {
    const isSelected = node.id === selectedNodeId.value
    const nodeX = node.x ?? 0
    const nodeY = node.y ?? 0
    const fontSize = getRenderedFontSize(node)
    const labelColor = getCategoryColor(node.category)

    context.font = `${isSelected ? '700' : '500'} ${fontSize}px Inter, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = labelColor
    context.fillText(node.label, nodeX, nodeY)
  }
}

const getRenderedFontSize = (node: FocusNode): number => {
  const baseSize = getNodeVisual(node.level).fontSize
  const isSelected = node.id === selectedNodeId.value
  return Math.round(baseSize * (isSelected ? 1.28 : 1))
}

const estimateLabelBox = (node: FocusNode) => {
  const fontSize = getRenderedFontSize(node)
  const widthEstimate = Math.max(18, node.label.length * fontSize * 0.58) + 10
  const heightEstimate = fontSize * 1.34 + 8
  return {
    width: widthEstimate,
    height: heightEstimate,
  }
}

const getCollisionRadius = (node: FocusNode): number => {
  const visuals = getNodeVisual(node.level)
  const box = estimateLabelBox(node)
  const labelRadius = Math.sqrt((box.width * 0.5) ** 2 + (box.height * 0.5) ** 2)
  return Math.max(visuals.radius + 14, labelRadius + 4)
}

const runAnimatedSettle = () => {
  const currentSimulation = simulation.value
  if (!currentSimulation) {
    return
  }

  currentSimulation.velocityDecay(0.44)
  currentSimulation.alphaDecay(0.07)
  currentSimulation.alphaTarget(0)
  currentSimulation.alpha(0.96)
  currentSimulation.restart()
}

const configureFocusForces = () => {
  const currentSimulation = simulation.value
  const centerId = selectedNodeId.value
  if (!currentSimulation || !centerId) {
    return
  }

  updateDistanceMap()

  for (const node of simulationNodes.value) {
    if (node.id === centerId) {
      node.fx = 0
      node.fy = 0
    } else {
      node.fx = null
      node.fy = null
    }
  }

  currentSimulation
    .force(
      'focus-radial',
      forceRadial<FocusNode>((node) => {
        const distance = distanceMap.value.get(node.id)
        if (typeof distance !== 'number') {
          return 210
        }
        if (distance === 0) {
          return 0
        }
        return 26 + distance * 42
      }, 0, 0).strength(1),
    )
    .force('center', forceCenter(0, 0))
    .alpha(1)
}

const initializeGraph = async () => {
  await nextTick()

  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  simulation.value?.stop()

  simulationNodes.value = resolvedData.value.nodes.map((node) => ({
    ...node,
    homeX: node.x,
    homeY: node.y,
    x: node.x,
    y: node.y,
  }))

  simulationEdges.value = resolvedData.value.edges.map((edge) => ({
    ...edge,
    weight: edge.weight ?? 1,
  }))

  centerSelection()

  simulation.value = forceSimulation<FocusNode>(simulationNodes.value)
    .alphaDecay(0.07)
    .velocityDecay(0.44)
    .force('charge', forceManyBody().strength(-28))
    .force(
      'link',
      forceLink<FocusNode, FocusEdge>(simulationEdges.value)
        .id((node) => node.id)
        .distance((edge) => Math.max(18, 66 / (edge.weight ?? 1)))
        .strength((edge) => Math.min(1, 0.72 + (edge.weight ?? 1) * 0.22)),
    )
    .force(
      'collision',
      forceCollide<FocusNode>()
        .radius((node) => getCollisionRadius(node))
        .strength(1)
        .iterations(3),
    )
    .force('center', forceCenter(0, 0))
    .on('tick', render)

  configureFocusForces()
  runAnimatedSettle()
}

const updateCanvasSize = () => {
  const canvas = canvasRef.value
  if (!canvas || !rootRef.value) {
    return
  }

  const rect = rootRef.value.getBoundingClientRect()
  width.value = Math.max(1, Math.floor(rect.width))
  height.value = Math.max(1, Math.floor(rect.height))
  dpr.value = window.devicePixelRatio || 1

  canvas.width = Math.floor(width.value * dpr.value)
  canvas.height = Math.floor(height.value * dpr.value)
  canvas.style.width = `${width.value}px`
  canvas.style.height = `${height.value}px`

  updateTransform()
  render()
}

const onPointerDown = (event: PointerEvent) => {
  if (!props.interactive || isEmpty.value) {
    return
  }

  const node = getNodeAtPosition(event.clientX, event.clientY)
  if (!node || node.id === selectedNodeId.value) {
    return
  }

  event.preventDefault()
  selectedNodeId.value = node.id
  configureFocusForces()
  runAnimatedSettle()
}

onMounted(async () => {
  rootRef.value = canvasRef.value?.parentElement ?? null
  updateCanvasSize()
  await initializeGraph()

  if (rootRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      updateCanvasSize()
    })
    resizeObserver.value.observe(rootRef.value)
  }
})

watch(
  () => [props.nodes, props.edges],
  async () => {
    if (isEmpty.value) {
      return
    }

    await initializeGraph()
    updateCanvasSize()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  simulation.value?.stop()
  resizeObserver.value?.disconnect()
})
</script>

<style scoped>
@reference "~/assets/css/main.css";

.focusRoot {
  @apply relative w-full h-[20rem] md:h-[26.25rem] overflow-hidden rounded-2xl;
}

.focusCanvas {
  @apply block w-full h-full bg-transparent touch-pan-y;
}

.focusEmpty {
  @apply flex h-full w-full items-center justify-center text-sm text-muted;
}

.focusSrOnly {
  @apply sr-only;
}

.focusSrOnlyItem {
  @apply sr-only;
}
</style>
