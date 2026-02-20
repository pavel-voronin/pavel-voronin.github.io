import type {
  SkillCategory,
  SkillEdge,
  SkillGraphData,
  SkillNode,
  SkillNodeVisual,
} from './skills-graph.types'

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
