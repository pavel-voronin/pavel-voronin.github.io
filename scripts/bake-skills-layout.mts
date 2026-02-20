import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { DEFAULT_SKILL_EDGES, DEFAULT_SKILL_NODES } from '../app/components/skills/skills-graph.data'
import { normalizeSkillGraph } from '../app/components/skills/skills-graph.model'
import type { SkillEdge, SkillNode } from '../app/components/skills/skills-graph.types'

interface BakeNode extends SimulationNodeDatum, SkillNode {
  homeX: number
  homeY: number
}

interface BakeEdge extends SimulationLinkDatum<BakeNode> {
  source: string | BakeNode
  target: string | BakeNode
  weight: number
}

const DATA_FILE = resolve(process.cwd(), 'app/components/skills/skills-graph.data.ts')

const toDataModule = (nodes: SkillNode[], edges: SkillEdge[]) => {
  const nodeLines = nodes
    .map((node) => {
      return `  { id: '${node.id}', label: '${node.label}', category: '${node.category}', level: ${node.level}, x: ${node.x}, y: ${node.y} },`
    })
    .join('\n')

  const edgeLines = edges
    .map((edge) => {
      const weight = typeof edge.weight === 'number' ? edge.weight : 1
      return `  { source: '${edge.source}', target: '${edge.target}', weight: ${weight} },`
    })
    .join('\n')

  return `import type { SkillEdge, SkillNode } from './skills-graph.types'\n\nexport const DEFAULT_SKILL_NODES: SkillNode[] = [\n${nodeLines}\n]\n\nexport const DEFAULT_SKILL_EDGES: SkillEdge[] = [\n${edgeLines}\n]\n`
}

const bakeLayout = () => {
  const data = normalizeSkillGraph(DEFAULT_SKILL_NODES, DEFAULT_SKILL_EDGES)

  const nodes: BakeNode[] = data.nodes.map((node) => ({
    ...node,
    homeX: node.x,
    homeY: node.y,
    x: node.x,
    y: node.y,
  }))

  const edges: BakeEdge[] = data.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    weight: edge.weight ?? 1,
  }))

  const simulation = forceSimulation<BakeNode>(nodes)
    .alpha(1)
    .alphaDecay(0.03)
    .force('charge', forceManyBody().strength(-80))
    .force(
      'link',
      forceLink<BakeNode, BakeEdge>(edges)
        .id((node) => node.id)
        .distance((edge) => 95 / (edge.weight ?? 1))
        .strength((edge) => Math.min(0.22, 0.06 + (edge.weight ?? 1) * 0.08)),
    )
    .force('collision', forceCollide<BakeNode>().radius((node) => 20 + node.level * 2))
    .force('home-x', forceX<BakeNode>((node) => node.homeX).strength(0.07))
    .force('home-y', forceY<BakeNode>((node) => node.homeY).strength(0.07))

  for (let tick = 0; tick < 420; tick += 1) {
    simulation.tick()
  }

  simulation.stop()

  const bakedNodes: SkillNode[] = nodes.map((node) => ({
    id: node.id,
    label: node.label,
    category: node.category,
    level: node.level,
    x: Math.round((node.x ?? node.homeX) * 10) / 10,
    y: Math.round((node.y ?? node.homeY) * 10) / 10,
  }))

  writeFileSync(DATA_FILE, toDataModule(bakedNodes, data.edges), 'utf-8')
}

bakeLayout()
console.log('skills-graph.data.ts has been updated with baked coordinates.')
