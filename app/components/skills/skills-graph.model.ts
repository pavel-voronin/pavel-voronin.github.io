import type {
  SkillCategory,
  SkillEdge,
  SkillGraphData,
  SkillNode,
  SkillNodeVisual,
} from './skills-graph.types'

export interface SkillAdjacentNode {
  id: string
  weight: number
}

export type SkillAdjacencyMap = Map<string, SkillAdjacentNode[]>

export interface SkillNeighbor {
  node: SkillNode
  weight: number
  score: number
}

export interface SkillNeighborhoodNode {
  node: SkillNode
  distance: number
  weight: number
  score: number
  reachable: boolean
}

export interface CloudLayoutInput {
  id: string
  label: string
  fontSize: number
  score: number
}

export interface CloudLayoutNode {
  id: string
  x: number
  y: number
  depth: number
  scale: number
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  frontend: '#2f76e0',
  backend: '#7f49d6',
  fullstack: '#0f9d8e',
  devops: '#29a85f',
  data: '#db8c12',
  ai: '#dc4c9a',
}

const MIN_LEVEL = 1
const MAX_LEVEL = 5

export const getCategoryColor = (category: SkillCategory): string => {
  return CATEGORY_COLORS[category]
}

export const clampSkillLevel = (level: number): number => {
  if (level < MIN_LEVEL) {
    return MIN_LEVEL
  }

  if (level > MAX_LEVEL) {
    return MAX_LEVEL
  }

  return Math.round(level)
}

export const getNodeVisual = (level: number): SkillNodeVisual => {
  const safeLevel = clampSkillLevel(level)
  const ratio = (safeLevel - MIN_LEVEL) / (MAX_LEVEL - MIN_LEVEL)

  return {
    radius: Math.round(10 + ratio * 18),
    fontSize: Math.round(11 + ratio * 11),
  }
}

export const normalizeSkillGraph = (nodes: SkillNode[], edges: SkillEdge[]): SkillGraphData => {
  const normalizedNodes = nodes.map((node, index) => {
    const fallbackX = (index % 8) * 120 - 420
    const fallbackY = Math.floor(index / 8) * 100 - 200

    return {
      ...node,
      level: clampSkillLevel(node.level),
      x: Number.isFinite(node.x) ? node.x : fallbackX,
      y: Number.isFinite(node.y) ? node.y : fallbackY,
    }
  })

  const idSet = new Set(normalizedNodes.map((node) => node.id))
  const seenEdges = new Set<string>()

  const normalizedEdges = edges
    .filter((edge) => {
      if (!idSet.has(edge.source) || !idSet.has(edge.target)) {
        return false
      }

      if (edge.source === edge.target) {
        return false
      }

      const key = [edge.source, edge.target].sort().join('::')
      if (seenEdges.has(key)) {
        return false
      }

      seenEdges.add(key)
      return true
    })
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight && Number.isFinite(edge.weight) ? Math.max(0.2, edge.weight) : 1,
    }))

  return {
    nodes: normalizedNodes,
    edges: normalizedEdges,
  }
}

export const buildAdjacencyMap = (nodes: SkillNode[], edges: SkillEdge[]): SkillAdjacencyMap => {
  const adjacencyMap: SkillAdjacencyMap = new Map()

  for (const node of nodes) {
    adjacencyMap.set(node.id, [])
  }

  for (const edge of edges) {
    const weight = edge.weight && Number.isFinite(edge.weight) ? Math.max(0.2, edge.weight) : 1
    const sourceList = adjacencyMap.get(edge.source)
    const targetList = adjacencyMap.get(edge.target)

    if (!sourceList || !targetList) {
      continue
    }

    sourceList.push({ id: edge.target, weight })
    targetList.push({ id: edge.source, weight })
  }

  return adjacencyMap
}

export const getMostConnectedNodeId = (nodes: SkillNode[], edges: SkillEdge[]): string | null => {
  if (nodes.length === 0) {
    return null
  }

  const adjacencyMap = buildAdjacencyMap(nodes, edges)
  let bestNodeId = nodes[0].id
  let bestDegree = -1
  let bestWeight = -1

  for (const node of nodes) {
    const neighbors = adjacencyMap.get(node.id) ?? []
    const degree = neighbors.length
    const weightSum = neighbors.reduce((total, item) => total + item.weight, 0)

    if (degree > bestDegree || (degree === bestDegree && weightSum > bestWeight)) {
      bestNodeId = node.id
      bestDegree = degree
      bestWeight = weightSum
    }
  }

  return bestNodeId
}

export const getNodeNeighbors = (
  centerNodeId: string,
  nodes: SkillNode[],
  edges: SkillEdge[],
): SkillNeighbor[] => {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const adjacencyMap = buildAdjacencyMap(nodes, edges)
  const neighbors = adjacencyMap.get(centerNodeId) ?? []

  return neighbors
    .map((adjacent): SkillNeighbor | null => {
      const node = nodeById.get(adjacent.id)
      if (!node) {
        return null
      }

      const score = adjacent.weight * 1.2 + node.level * 0.35
      return {
        node,
        weight: adjacent.weight,
        score,
      }
    })
    .filter((item): item is SkillNeighbor => Boolean(item))
    .sort((left, right) => right.score - left.score)
}

export const getNodeNeighborhood = (
  centerNodeId: string,
  nodes: SkillNode[],
  edges: SkillEdge[],
): SkillNeighborhoodNode[] => {
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const adjacencyMap = buildAdjacencyMap(nodes, edges)
  const distanceMap = new Map<string, number>()
  const entryWeightMap = new Map<string, number>()
  const queue: string[] = []

  distanceMap.set(centerNodeId, 0)
  queue.push(centerNodeId)

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId) {
      continue
    }

    const currentDistance = distanceMap.get(currentId) ?? 0
    const adjacentNodes = adjacencyMap.get(currentId) ?? []

    for (const adjacent of adjacentNodes) {
      if (!distanceMap.has(adjacent.id)) {
        distanceMap.set(adjacent.id, currentDistance + 1)
        entryWeightMap.set(adjacent.id, adjacent.weight)
        queue.push(adjacent.id)
        continue
      }

      if ((distanceMap.get(adjacent.id) ?? Number.POSITIVE_INFINITY) === currentDistance + 1) {
        const previousWeight = entryWeightMap.get(adjacent.id) ?? 0
        if (adjacent.weight > previousWeight) {
          entryWeightMap.set(adjacent.id, adjacent.weight)
        }
      }
    }
  }

  return nodes
    .filter((node) => node.id !== centerNodeId)
    .map((node): SkillNeighborhoodNode => {
      const distance = distanceMap.get(node.id)
      const reachable = typeof distance === 'number'

      if (!reachable) {
        return {
          node,
          distance: 99,
          weight: 0.2,
          score: node.level * 0.08,
          reachable: false,
        }
      }

      const weight = entryWeightMap.get(node.id) ?? 1
      const distancePenalty = 1 / (1 + Math.max(0, distance - 1) * 0.55)
      const score = (weight * 1.25 + node.level * 0.4) * distancePenalty

      return {
        node,
        distance,
        weight,
        score,
        reachable: true,
      }
    })
    .sort((left, right) => {
      if (left.reachable !== right.reachable) {
        return left.reachable ? -1 : 1
      }

      if (left.distance !== right.distance) {
        return left.distance - right.distance
      }

      return right.score - left.score
    })
}

export const getCloudFontSize = (level: number, weight: number): number => {
  const safeWeight = Number.isFinite(weight) ? Math.max(0.2, weight) : 1
  const levelSize = getNodeVisual(level).fontSize
  const weightRatio = Math.min(1, Math.max(0, (safeWeight - 0.2) / 1.8))
  return Math.round(levelSize * 0.74 + 6 + weightRatio * 6)
}

export const getCloudDistanceScale = (distance: number, reachable: boolean): number => {
  if (!reachable) {
    return 0.56
  }

  if (distance <= 1) {
    return 1
  }

  if (distance === 2) {
    return 0.84
  }

  if (distance === 3) {
    return 0.74
  }

  return 0.66
}

export const computeCloudLayout = (
  nodes: CloudLayoutInput[],
  containerWidth: number,
  containerHeight: number,
  centerId?: string,
): CloudLayoutNode[] => {
  if (nodes.length === 0) {
    return []
  }

  const width = Math.max(1, containerWidth)
  const height = Math.max(1, containerHeight)
  const centerX = width / 2
  const centerY = height / 2
  const minSide = Math.min(width, height)
  const globeRadius = minSide * 0.42
  const visibleDepthThreshold = 0.03
  const padding = 8
  const centerVector = getStableSpherePoint(centerId ?? 'center')

  const items = nodes
    .map((node) => {
      const point = rotatePointToFront(getStableSpherePoint(node.id), centerVector)
      if (point.z <= visibleDepthThreshold) {
        return null
      }

      const perspective = 0.56 + point.z * 0.56
      const projectedX = centerX + point.x * globeRadius * perspective
      const projectedY = centerY + point.y * globeRadius * perspective * 0.88
      const scale = 0.62 + point.z * 0.58
      const displayFontSize = Math.max(10, Math.round(node.fontSize * scale))
      const widthEstimate = Math.max(42, node.label.length * displayFontSize * 0.58 + 12)
      const heightEstimate = Math.max(18, displayFontSize * 1.34)
      const priority = node.score * (0.7 + point.z * 0.9)

      return {
        ...node,
        depth: point.z,
        scale,
        priority,
        widthEstimate,
        heightEstimate,
        targetX: projectedX,
        targetY: projectedY,
        x: projectedX,
        y: projectedY,
      }
    })
    .filter((item) => Boolean(item))

  const positionedItems = items as Array<{
    id: string
    label: string
    fontSize: number
    score: number
    depth: number
    scale: number
    priority: number
    widthEstimate: number
    heightEstimate: number
    targetX: number
    targetY: number
    x: number
    y: number
  }>

  const passes = 12
  for (let pass = 0; pass < passes; pass += 1) {
    for (let index = 0; index < positionedItems.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < positionedItems.length; nextIndex += 1) {
        const first = positionedItems[index]
        const second = positionedItems[nextIndex]
        const dx = second.x - first.x
        const dy = second.y - first.y
        const allowX = (first.widthEstimate + second.widthEstimate) / 2 + padding
        const allowY = (first.heightEstimate + second.heightEstimate) / 2 + padding
        const overlapX = allowX - Math.abs(dx)
        const overlapY = allowY - Math.abs(dy)

        if (overlapX <= 0 || overlapY <= 0) {
          continue
        }

        const totalPriority = Math.max(0.001, first.priority + second.priority)
        const firstShare = second.priority / totalPriority
        const secondShare = first.priority / totalPriority
        const shiftX = overlapX * 0.5
        const shiftY = overlapY * 0.5
        const xDirection = dx >= 0 ? 1 : -1
        const yDirection = dy >= 0 ? 1 : -1

        first.x -= shiftX * xDirection * firstShare
        second.x += shiftX * xDirection * secondShare
        first.y -= shiftY * yDirection * firstShare
        second.y += shiftY * yDirection * secondShare
      }
    }

    for (const item of positionedItems) {
      const spring = 0.16
      item.x += (item.targetX - item.x) * spring
      item.y += (item.targetY - item.y) * spring
      const halfWidth = item.widthEstimate / 2
      const halfHeight = item.heightEstimate / 2
      item.x = Math.min(width - halfWidth - 8, Math.max(halfWidth + 8, item.x))
      item.y = Math.min(height - halfHeight - 8, Math.max(halfHeight + 8, item.y))
    }
  }

  const kept: typeof positionedItems = []
  const sortedByPriority = [...positionedItems].sort((left, right) => right.priority - left.priority)

  for (const candidate of sortedByPriority) {
    const isOverlapping = kept.some((placed) => {
      const deltaX = Math.abs(placed.x - candidate.x)
      const deltaY = Math.abs(placed.y - candidate.y)
      const limitX = (placed.widthEstimate + candidate.widthEstimate) / 2 + 2
      const limitY = (placed.heightEstimate + candidate.heightEstimate) / 2 + 2
      return deltaX < limitX && deltaY < limitY
    })

    if (!isOverlapping) {
      kept.push(candidate)
    }
  }

  return kept.map((item) => ({
    id: item.id,
    x: Math.round(item.x * 10) / 10,
    y: Math.round(item.y * 10) / 10,
    depth: item.depth,
    scale: item.scale,
  }))
}

const hashSeed = (value: string, salt: number): number => {
  let hash = 2166136261 ^ salt
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const hashToUnit = (value: string, salt: number): number => {
  return hashSeed(value, salt) / 4294967295
}

const getStableSpherePoint = (id: string): { x: number; y: number; z: number } => {
  const u = hashToUnit(id, 11)
  const v = hashToUnit(id, 29)
  const theta = 2 * Math.PI * u
  const z = 2 * v - 1
  const radius = Math.sqrt(Math.max(0, 1 - z * z))
  return {
    x: radius * Math.cos(theta),
    y: radius * Math.sin(theta),
    z,
  }
}

const rotateAroundAxis = (
  point: { x: number; y: number; z: number },
  axis: { x: number; y: number; z: number },
  cosAngle: number,
  sinAngle: number,
) => {
  const dot = point.x * axis.x + point.y * axis.y + point.z * axis.z
  return {
    x:
      point.x * cosAngle +
      (axis.y * point.z - axis.z * point.y) * sinAngle +
      axis.x * dot * (1 - cosAngle),
    y:
      point.y * cosAngle +
      (axis.z * point.x - axis.x * point.z) * sinAngle +
      axis.y * dot * (1 - cosAngle),
    z:
      point.z * cosAngle +
      (axis.x * point.y - axis.y * point.x) * sinAngle +
      axis.z * dot * (1 - cosAngle),
  }
}

const rotatePointToFront = (
  point: { x: number; y: number; z: number },
  center: { x: number; y: number; z: number },
) => {
  const target = { x: 0, y: 0, z: 1 }
  const dot = center.x * target.x + center.y * target.y + center.z * target.z

  if (dot > 0.9999) {
    return point
  }

  if (dot < -0.9999) {
    return { x: point.x, y: -point.y, z: -point.z }
  }

  const axis = {
    x: center.y * target.z - center.z * target.y,
    y: center.z * target.x - center.x * target.z,
    z: center.x * target.y - center.y * target.x,
  }
  const axisLength = Math.hypot(axis.x, axis.y, axis.z)
  if (axisLength < 0.00001) {
    return point
  }

  const normalizedAxis = {
    x: axis.x / axisLength,
    y: axis.y / axisLength,
    z: axis.z / axisLength,
  }
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)))
  return rotateAroundAxis(point, normalizedAxis, Math.cos(angle), Math.sin(angle))
}
