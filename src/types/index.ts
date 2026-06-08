export type HeatmapMode = 'click' | 'scroll' | 'attention'

export interface ClickData {
  x: number
  y: number
  count: number
  timestamp?: number
}

export interface ScrollData {
  scrollTop: number
  duration: number
  viewportHeight: number
}

export interface AttentionPoint {
  x: number
  y: number
  duration: number
  timestamp?: number
}

export interface HeatmapDataset {
  id: string
  name: string
  clicks: ClickData[]
  scrolls: ScrollData[]
  attentions: AttentionPoint[]
  pageWidth: number
  pageHeight: number
  createdAt: number
}

export interface ColorStop {
  position: number
  color: string
}

export interface GradientPreset {
  name: string
  stops: ColorStop[]
}

export interface HeatmapConfig {
  mode: HeatmapMode
  opacity: number
  radius: number
  blur: number
  gradient: ColorStop[]
  showLegend: boolean
}

export interface HotSpot {
  x: number
  y: number
  value: number
  rank: number
}

export interface ReportData {
  totalClicks: number
  avgScrollDepth: number
  maxAttentionDuration: number
  topSpots: HotSpot[]
  datasetName: string
  generatedAt: number
}

export interface ABComparison {
  enabled: boolean
  datasetA: string | null
  datasetB: string | null
  diffMode: 'absolute' | 'percentage'
}
