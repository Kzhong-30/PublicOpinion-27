import type {
  HeatmapDataset,
  HeatmapConfig,
  ClickData,
  ScrollData,
  AttentionPoint,
  HotSpot,
  ColorStop
} from '../types'
import { getGradientPalette } from './gradients'

export interface HeatmapPixel {
  x: number
  y: number
  value: number
}

export function clicksToPixels(clicks: ClickData[]): HeatmapPixel[] {
  return clicks.map(c => ({ x: c.x, y: c.y, value: c.count }))
}

export function scrollsToPixels(
  scrolls: ScrollData[],
  pageWidth: number,
  viewportHeight: number
): HeatmapPixel[] {
  const durationMap = new Map<number, number>()
  const gridSize = 20

  scrolls.forEach(s => {
    const startRow = Math.floor(s.scrollTop / gridSize)
    const endRow = Math.floor((s.scrollTop + viewportHeight * 0.9) / gridSize)
    const weight = s.duration / 1000

    for (let row = startRow; row <= endRow; row++) {
      const progress = (row - startRow) / Math.max(1, endRow - startRow)
      const viewportFactor = progress < 0.3 ? 1.2 : progress < 0.7 ? 1.0 : 0.7
      durationMap.set(row, (durationMap.get(row) || 0) + weight * viewportFactor)
    }
  })

  const pixels: HeatmapPixel[] = []
  durationMap.forEach((value, row) => {
    const y = row * gridSize + gridSize / 2
    const cols = Math.ceil(pageWidth / gridSize)
    for (let col = 0; col < cols; col++) {
      const x = col * gridSize + gridSize / 2
      const centerFactor = 1 - Math.abs(col - cols / 2) / (cols / 2) * 0.3
      pixels.push({ x, y, value: value * centerFactor })
    }
  })

  return pixels
}

export function attentionsToPixels(attentions: AttentionPoint[]): HeatmapPixel[] {
  return attentions.map(a => ({
    x: a.x,
    y: a.y,
    value: a.duration / 100
  }))
}

export function getModePixels(
  mode: HeatmapConfig['mode'],
  dataset: HeatmapDataset
): HeatmapPixel[] {
  switch (mode) {
    case 'click':
      return clicksToPixels(dataset.clicks)
    case 'scroll':
      return scrollsToPixels(dataset.scrolls, dataset.pageWidth, 800)
    case 'attention':
      return attentionsToPixels(dataset.attentions)
  }
}

export function normalizeValues(pixels: HeatmapPixel[]): { pixels: HeatmapPixel[]; maxValue: number } {
  if (pixels.length === 0) return { pixels, maxValue: 0 }

  let maxValue = 0
  pixels.forEach(p => {
    if (p.value > maxValue) maxValue = p.value
  })

  if (maxValue === 0) return { pixels, maxValue: 0 }

  return {
    pixels: pixels.map(p => ({ ...p, value: p.value / maxValue })),
    maxValue
  }
}

export function computeDiffPixels(
  pixelsA: HeatmapPixel[],
  pixelsB: HeatmapPixel[],
  width: number,
  height: number,
  mode: 'absolute' | 'percentage'
): HeatmapPixel[] {
  const gridSize = 20
  const grid = new Map<string, { a: number; b: number }>()

  const getKey = (x: number, y: number) =>
    `${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`

  pixelsA.forEach(p => {
    const key = getKey(p.x, p.y)
    const entry = grid.get(key) || { a: 0, b: 0 }
    entry.a += p.value
    grid.set(key, entry)
  })

  pixelsB.forEach(p => {
    const key = getKey(p.x, p.y)
    const entry = grid.get(key) || { a: 0, b: 0 }
    entry.b += p.value
    grid.set(key, entry)
  })

  const result: HeatmapPixel[] = []
  let maxAbsDiff = 0

  grid.forEach(({ a, b }, key) => {
    const [gx, gy] = key.split(',').map(Number)
    const x = gx * gridSize + gridSize / 2
    const y = gy * gridSize + gridSize / 2

    let diff: number
    if (mode === 'absolute') {
      diff = b - a
    } else {
      diff = a === 0 ? (b > 0 ? 1 : 0) : (b - a) / a
    }
    maxAbsDiff = Math.max(maxAbsDiff, Math.abs(diff))
    result.push({ x, y, value: diff })
  })

  if (maxAbsDiff > 0) {
    result.forEach(p => {
      p.value = (p.value / maxAbsDiff + 1) / 2
    })
  }

  void width
  void height
  return result
}

export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixels: HeatmapPixel[],
  config: {
    radius: number
    blur: number
    opacity: number
    gradient: ColorStop[]
  }
): void {
  const { pixels: normalizedPixels } = normalizeValues(pixels)
  const palette = getGradientPalette(ctx, config.gradient)

  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = width
  shadowCanvas.height = height
  const shadowCtx = shadowCanvas.getContext('2d')!
  shadowCtx.clearRect(0, 0, width, height)

  const effectiveRadius = config.radius
  shadowCtx.filter = `blur(${config.blur}px)`

  normalizedPixels.forEach(pixel => {
    const alpha = Math.min(1, pixel.value) * 0.85
    const r = effectiveRadius * (0.6 + pixel.value * 0.6)

    const gradient = shadowCtx.createRadialGradient(pixel.x, pixel.y, 0, pixel.x, pixel.y, r)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.4})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    shadowCtx.fillStyle = gradient
    shadowCtx.beginPath()
    shadowCtx.arc(pixel.x, pixel.y, r, 0, Math.PI * 2)
    shadowCtx.fill()
  })

  shadowCtx.filter = 'none'
  const shadowData = shadowCtx.getImageData(0, 0, width, height).data

  const outImage = ctx.createImageData(width, height)
  const outData = outImage.data
  const globalOpacity = config.opacity

  for (let i = 0, j = 0; i < shadowData.length; i += 4, j += 4) {
    const intensity = shadowData[i + 3]
    if (intensity === 0) continue

    const paletteIndex = Math.min(255, Math.floor((intensity / 255) * 255)) * 4
    outData[j] = palette[paletteIndex]
    outData[j + 1] = palette[paletteIndex + 1]
    outData[j + 2] = palette[paletteIndex + 2]
    outData[j + 3] = Math.floor(palette[paletteIndex + 3] * (intensity / 255) * globalOpacity)
  }

  ctx.putImageData(outImage, 0, 0)
}

export function findTopHotSpots(
  pixels: HeatmapPixel[],
  topN: number = 10
): HotSpot[] {
  const gridSize = 40
  const grid = new Map<string, { value: number; count: number; x: number; y: number }>()

  pixels.forEach(p => {
    const gx = Math.floor(p.x / gridSize)
    const gy = Math.floor(p.y / gridSize)
    const key = `${gx},${gy}`
    const entry = grid.get(key) || { value: 0, count: 0, x: 0, y: 0 }
    entry.value += p.value
    entry.count += 1
    entry.x += p.x * p.value
    entry.y += p.y * p.value
    grid.set(key, entry)
  })

  const spots: Array<{ x: number; y: number; value: number }> = []
  grid.forEach(entry => {
    if (entry.value > 0) {
      spots.push({
        x: Math.round(entry.x / entry.value),
        y: Math.round(entry.y / entry.value),
        value: entry.value
      })
    }
  })

  return spots
    .sort((a, b) => b.value - a.value)
    .slice(0, topN)
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

export function exportCanvasToPNG(
  canvas: HTMLCanvasElement,
  backgroundCanvas?: HTMLCanvasElement
): string {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = canvas.width
  exportCanvas.height = canvas.height
  const ctx = exportCanvas.getContext('2d')!

  if (backgroundCanvas) {
    ctx.drawImage(backgroundCanvas, 0, 0)
  }
  ctx.drawImage(canvas, 0, 0)

  return exportCanvas.toDataURL('image/png')
}

export function downloadDataURL(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
