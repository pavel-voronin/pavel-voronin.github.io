export type SkillCategory = 'frontend' | 'backend' | 'fullstack' | 'devops' | 'data' | 'ai'

export interface SkillNode {
  id: string
  label: string
  category: SkillCategory
  level: number
  x: number
  y: number
}

export interface SkillEdge {
  source: string
  target: string
  weight?: number
}

export interface SkillGraphData {
  nodes: SkillNode[]
  edges: SkillEdge[]
}

export interface SkillNodeVisual {
  radius: number
  fontSize: number
}
