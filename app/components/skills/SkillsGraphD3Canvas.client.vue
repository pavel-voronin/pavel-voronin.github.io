<template>
  <div class="graphRoot" :style="rootStyle">
    <div v-if="isEmpty" class="graphEmpty">
      Skills graph is empty.
    </div>

    <canvas
      v-else
      ref="canvasRef"
      class="graphCanvas"
      aria-label="Interactive skills graph"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    />

    <ul class="graphSrOnly">
      <li v-for="node in resolvedNodes" :key="node.id" class="graphSrOnlyItem">
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
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DEFAULT_SKILL_EDGES, DEFAULT_SKILL_NODES } from './skills-graph.data'
import { getCategoryColor, getNodeVisual, normalizeSkillGraph } from './skills-graph.model'
import type { SkillEdge, SkillNode } from './skills-graph.types'

interface CanvasNode extends SimulationNodeDatum, SkillNode {
  homeX: number
  homeY: number
}

interface CanvasEdge extends SimulationLinkDatum<CanvasNode> {
  source: string | CanvasNode
  target: string | CanvasNode
  weight: number
}

const DESKTOP_FONT_SCALE = 1.2

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
const simulation = ref<Simulation<CanvasNode, CanvasEdge> | null>(null)
const resizeObserver = ref<ResizeObserver | null>(null)
const dpr = ref(1)
const width = ref(1)
const height = ref(320)
const transform = ref({ x: 0, y: 0, k: 1 })

const activePointer = ref<number | null>(null)
const draggedNode = ref<CanvasNode | null>(null)

const resolvedData = computed(() => {
  const rawNodes = props.nodes ?? DEFAULT_SKILL_NODES
  const rawEdges = props.edges ?? DEFAULT_SKILL_EDGES
  return normalizeSkillGraph(rawNodes, rawEdges)
})

const resolvedNodes = computed(() => resolvedData.value.nodes)
const isEmpty = computed(() => resolvedData.value.nodes.length === 0)

const rootStyle = computed(() => {
  if (!props.height) {
    return undefined
  }

  return { height: `${props.height}px` }
})

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

const getNodeAtPosition = (clientX: number, clientY: number): CanvasNode | null => {
  const world = toWorldPoint(clientX, clientY)

  for (let index = simulationNodes.value.length - 1; index >= 0; index -= 1) {
    const node = simulationNodes.value[index]
    const visuals = getNodeVisual(node.level)
    const nodeX = node.x ?? 0
    const nodeY = node.y ?? 0
    const dx = nodeX - world.x
    const dy = nodeY - world.y
    const inCircle = Math.sqrt(dx * dx + dy * dy) <= visuals.radius + 6

    const scaledFontSize = visuals.fontSize * DESKTOP_FONT_SCALE
    const textWidth = Math.max(18, node.label.length * scaledFontSize * 0.58)
    const textHalfWidth = textWidth / 2
    const textHalfHeight = scaledFontSize * 0.62
    const inText =
      world.x >= nodeX - textHalfWidth &&
      world.x <= nodeX + textHalfWidth &&
      world.y >= nodeY - textHalfHeight &&
      world.y <= nodeY + textHalfHeight

    if (inCircle || inText) {
      return node
    }
  }

  return null
}

const simulationNodes = ref<CanvasNode[]>([])
const simulationEdges = ref<CanvasEdge[]>([])

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

  context.globalAlpha = 0.4
  context.lineWidth = 1

  for (const edge of simulationEdges.value) {
    const source = typeof edge.source === 'string' ? null : edge.source
    const target = typeof edge.target === 'string' ? null : edge.target

    if (!source || !target) {
      continue
    }

    context.strokeStyle = '#A5ADBA'
    context.beginPath()
    context.moveTo(source.x ?? 0, source.y ?? 0)
    context.lineTo(target.x ?? 0, target.y ?? 0)
    context.stroke()
  }

  context.globalAlpha = 1

  for (const node of simulationNodes.value) {
    const visuals = getNodeVisual(node.level)
    const nodeX = node.x ?? 0
    const nodeY = node.y ?? 0

    context.font = `${Math.round(visuals.fontSize * DESKTOP_FONT_SCALE)}px Inter, sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = getCategoryColor(node.category)
    context.fillText(node.label, nodeX, nodeY)
  }
}

const fitGraphToViewport = () => {
  if (simulationNodes.value.length === 0) {
    transform.value = {
      x: width.value / 2,
      y: height.value / 2,
      k: 1,
    }
    return
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const node of simulationNodes.value) {
    const visuals = getNodeVisual(node.level)
    const nodeX = node.x ?? node.homeX
    const nodeY = node.y ?? node.homeY
    const scaledRadius = visuals.radius * (1 + (DESKTOP_FONT_SCALE - 1) * 0.6)
    minX = Math.min(minX, nodeX - scaledRadius)
    maxX = Math.max(maxX, nodeX + scaledRadius)
    minY = Math.min(minY, nodeY - scaledRadius)
    maxY = Math.max(maxY, nodeY + scaledRadius)
  }

  const graphWidth = Math.max(1, maxX - minX)
  const graphHeight = Math.max(1, maxY - minY)
  const viewportPadding = 28
  const fitScaleX = (width.value - viewportPadding * 2) / graphWidth
  const fitScaleY = (height.value - viewportPadding * 2) / graphHeight
  const nextScale = Math.min(2.2, Math.max(0.2, Math.min(fitScaleX, fitScaleY) * 0.98))
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  transform.value = {
    x: width.value / 2 - centerX * nextScale,
    y: height.value / 2 - centerY * nextScale,
    k: nextScale,
  }
}

const restartSimulation = () => {
  simulation.value?.alpha(0.9).restart()
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

  simulation.value = forceSimulation<CanvasNode>(simulationNodes.value)
    .force('charge', forceManyBody().strength(-75))
    .force(
      'link',
      forceLink<CanvasNode, CanvasEdge>(simulationEdges.value)
        .id((node) => node.id)
        .distance((edge) => 95 / (edge.weight ?? 1))
        .strength((edge) => Math.min(0.22, 0.06 + (edge.weight ?? 1) * 0.08)),
    )
    .force(
      'collision',
      forceCollide<CanvasNode>().radius(
        (node) => getNodeVisual(node.level).radius * (1 + (DESKTOP_FONT_SCALE - 1) * 0.5) + 10,
      ),
    )
    .force('center', forceCenter(0, 0))
    .force('home-x', forceX<CanvasNode>((node) => node.homeX).strength(0.07))
    .force('home-y', forceY<CanvasNode>((node) => node.homeY).strength(0.07))
    .on('tick', render)

  fitGraphToViewport()

  restartSimulation()
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

  fitGraphToViewport()

  render()
}

const onPointerDown = (event: PointerEvent) => {
  if (!props.interactive || isEmpty.value) {
    return
  }

  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const node = getNodeAtPosition(event.clientX, event.clientY)
  if (!node) {
    return
  }

  draggedNode.value = node
  activePointer.value = event.pointerId
  canvas.setPointerCapture(event.pointerId)

  const world = toWorldPoint(event.clientX, event.clientY)
  node.fx = world.x
  node.fy = world.y
  simulation.value?.alphaTarget(0.28).restart()
}

const onPointerMove = (event: PointerEvent) => {
  if (!props.interactive || activePointer.value !== event.pointerId || isEmpty.value) {
    return
  }

  if (draggedNode.value) {
    const world = toWorldPoint(event.clientX, event.clientY)
    draggedNode.value.fx = world.x
    draggedNode.value.fy = world.y
  }
}

const onPointerUp = (event: PointerEvent) => {
  if (activePointer.value !== event.pointerId) {
    return
  }

  const canvas = canvasRef.value
  if (canvas && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId)
  }

  activePointer.value = null

  if (draggedNode.value) {
    draggedNode.value.fx = null
    draggedNode.value.fy = null
    draggedNode.value = null
    simulation.value?.alphaTarget(0.08).restart()

    window.setTimeout(() => {
      simulation.value?.alphaTarget(0)
    }, 350)
  }
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

.graphRoot {
  @apply relative w-full h-[20rem] md:h-[26.25rem] overflow-hidden rounded-2xl;
}

.graphCanvas {
  @apply block w-full h-full bg-transparent touch-none;
}

.graphEmpty {
  @apply flex h-full w-full items-center justify-center text-sm text-muted;
}

.graphSrOnly {
  @apply sr-only;
}

.graphSrOnlyItem {
  @apply sr-only;
}
</style>
