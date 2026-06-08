import type { ClickData, ScrollData, AttentionPoint, HeatmapDataset } from '../types'

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function gaussianRandom(rand: () => number, mean: number, std: number): number {
  const u1 = rand()
  const u2 = rand()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * std
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function generateHotZones(rand: () => number, count: number, width: number, height: number) {
  const zones = []
  for (let i = 0; i < count; i++) {
    zones.push({
      cx: gaussianRandom(rand, width / 2, width / 4),
      cy: gaussianRandom(rand, height / 3, height / 4),
      sigmaX: 50 + rand() * 150,
      sigmaY: 40 + rand() * 120,
      weight: 0.5 + rand() * 1.5
    })
  }
  return zones
}

export function generateMockClicks(
  seed: number,
  pageWidth: number,
  pageHeight: number,
  count: number = 500
): ClickData[] {
  const rand = seededRandom(seed)
  const hotZones = generateHotZones(rand, 5, pageWidth, pageHeight)
  const clickMap = new Map<string, number>()

  for (let i = 0; i < count; i++) {
    let x: number, y: number
    const zoneSelector = rand()

    if (zoneSelector < 0.7) {
      const zone = hotZones[Math.floor(rand() * hotZones.length)]
      x = gaussianRandom(rand, zone.cx, zone.sigmaX) * zone.weight
      y = gaussianRandom(rand, zone.cy, zone.sigmaY) * zone.weight
    } else {
      x = rand() * pageWidth
      y = rand() * pageHeight
    }

    x = clamp(x, 0, pageWidth - 1)
    y = clamp(y, 0, pageHeight - 1)

    const gridX = Math.floor(x / 10) * 10
    const gridY = Math.floor(y / 10) * 10
    const key = `${gridX},${gridY}`
    clickMap.set(key, (clickMap.get(key) || 0) + 1)
  }

  const result: ClickData[] = []
  clickMap.forEach((count, key) => {
    const [x, y] = key.split(',').map(Number)
    result.push({
      x: x + 5,
      y: y + 5,
      count,
      timestamp: Date.now() + Math.floor(rand() * 86400000)
    })
  })

  return result.sort((a, b) => b.count - a.count)
}

export function generateMockScrolls(
  seed: number,
  pageHeight: number,
  viewportHeight: number = 800,
  sessions: number = 100
): ScrollData[] {
  const rand = seededRandom(seed + 1000)
  const result: ScrollData[] = []
  const maxScroll = pageHeight - viewportHeight

  for (let s = 0; s < sessions; s++) {
    const depthFactor = 0.3 + rand() * 0.7
    const maxReached = maxScroll * depthFactor
    let currentScroll = 0
    const steps = 5 + Math.floor(rand() * 15)

    for (let i = 0; i < steps; i++) {
      const target = clamp(
        currentScroll + (rand() - 0.3) * (maxReached / 3),
        0,
        maxReached
      )
      const duration = 500 + rand() * 8000
      result.push({
        scrollTop: Math.floor(target),
        viewportHeight,
        duration: Math.floor(duration)
      })
      currentScroll = target
    }
  }

  return result
}

export function generateMockAttentions(
  seed: number,
  pageWidth: number,
  pageHeight: number,
  sessions: number = 50
): AttentionPoint[] {
  const rand = seededRandom(seed + 2000)
  const hotZones = generateHotZones(rand, 4, pageWidth, pageHeight)
  const result: AttentionPoint[] = []

  for (let s = 0; s < sessions; s++) {
    let x = pageWidth / 2
    let y = pageHeight / 4
    const points = 20 + Math.floor(rand() * 60)

    for (let p = 0; p < points; p++) {
      const selector = rand()
      if (selector < 0.6) {
        const zone = hotZones[Math.floor(rand() * hotZones.length)]
        x = gaussianRandom(rand, zone.cx, zone.sigmaX * 0.5)
        y = gaussianRandom(rand, zone.cy, zone.sigmaY * 0.5)
      } else {
        x += (rand() - 0.5) * 200
        y += (rand() - 0.4) * 150
      }

      x = clamp(x, 0, pageWidth - 1)
      y = clamp(y, 0, pageHeight - 1)

      result.push({
        x: Math.floor(x),
        y: Math.floor(y),
        duration: 100 + Math.floor(rand() * 2000),
        timestamp: Date.now() + Math.floor(rand() * 86400000)
      })
    }
  }

  return result
}

export function generateMockDataset(
  id: string,
  name: string,
  seed: number,
  pageWidth: number = 1200,
  pageHeight: number = 2400
): HeatmapDataset {
  return {
    id,
    name,
    clicks: generateMockClicks(seed, pageWidth, pageHeight, 400 + Math.floor(seededRandom(seed)() * 400)),
    scrolls: generateMockScrolls(seed, pageHeight),
    attentions: generateMockAttentions(seed, pageWidth, pageHeight),
    pageWidth,
    pageHeight,
    createdAt: Date.now() - seed * 60000
  }
}

export const PRESET_DATASETS: HeatmapDataset[] = [
  generateMockDataset('a', '版本 A - 原设计', 42),
  generateMockDataset('b', '版本 B - 优化版', 99),
  generateMockDataset('c', '版本 C - 实验版', 157)
]
