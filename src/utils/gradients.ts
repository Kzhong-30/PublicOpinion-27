import type { GradientPreset, ColorStop } from '../types'

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: '热力红',
    stops: [
      { position: 0, color: 'rgba(0, 0, 255, 0)' },
      { position: 0.2, color: 'rgba(0, 0, 255, 0.8)' },
      { position: 0.4, color: 'rgba(0, 255, 255, 0.8)' },
      { position: 0.6, color: 'rgba(0, 255, 0, 0.8)' },
      { position: 0.8, color: 'rgba(255, 255, 0, 0.8)' },
      { position: 1.0, color: 'rgba(255, 0, 0, 0.9)' }
    ]
  },
  {
    name: '极光绿',
    stops: [
      { position: 0, color: 'rgba(0, 0, 0, 0)' },
      { position: 0.2, color: 'rgba(0, 100, 150, 0.7)' },
      { position: 0.5, color: 'rgba(0, 200, 150, 0.8)' },
      { position: 0.8, color: 'rgba(100, 255, 100, 0.85)' },
      { position: 1.0, color: 'rgba(200, 255, 100, 0.9)' }
    ]
  },
  {
    name: '夕阳橙',
    stops: [
      { position: 0, color: 'rgba(20, 10, 60, 0)' },
      { position: 0.25, color: 'rgba(80, 40, 120, 0.7)' },
      { position: 0.5, color: 'rgba(200, 80, 80, 0.8)' },
      { position: 0.75, color: 'rgba(255, 140, 50, 0.85)' },
      { position: 1.0, color: 'rgba(255, 220, 100, 0.9)' }
    ]
  },
  {
    name: '海洋蓝',
    stops: [
      { position: 0, color: 'rgba(255, 255, 255, 0)' },
      { position: 0.2, color: 'rgba(200, 230, 255, 0.6)' },
      { position: 0.4, color: 'rgba(100, 180, 255, 0.7)' },
      { position: 0.6, color: 'rgba(50, 120, 220, 0.8)' },
      { position: 0.8, color: 'rgba(30, 60, 180, 0.85)' },
      { position: 1.0, color: 'rgba(10, 20, 100, 0.9)' }
    ]
  },
  {
    name: '紫罗兰',
    stops: [
      { position: 0, color: 'rgba(255, 255, 255, 0)' },
      { position: 0.2, color: 'rgba(255, 200, 255, 0.6)' },
      { position: 0.4, color: 'rgba(220, 130, 255, 0.75)' },
      { position: 0.6, color: 'rgba(180, 80, 220, 0.8)' },
      { position: 0.8, color: 'rgba(130, 30, 180, 0.85)' },
      { position: 1.0, color: 'rgba(80, 0, 120, 0.9)' }
    ]
  },
  {
    name: '灰度图',
    stops: [
      { position: 0, color: 'rgba(255, 255, 255, 0)' },
      { position: 0.3, color: 'rgba(220, 220, 220, 0.6)' },
      { position: 0.6, color: 'rgba(150, 150, 150, 0.75)' },
      { position: 0.85, color: 'rgba(80, 80, 80, 0.85)' },
      { position: 1.0, color: 'rgba(20, 20, 20, 0.9)' }
    ]
  }
]

export function stopsToCanvasGradient(
  ctx: CanvasRenderingContext2D,
  stops: ColorStop[],
  width: number = 256,
  height: number = 1
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  stops.forEach(stop => {
    gradient.addColorStop(stop.position, stop.color)
  })
  return gradient
}

export function getGradientPalette(_ctx: CanvasRenderingContext2D, stops: ColorStop[]): Uint8ClampedArray {
  const paletteCanvas = document.createElement('canvas')
  paletteCanvas.width = 256
  paletteCanvas.height = 1
  const paletteCtx = paletteCanvas.getContext('2d')!
  const gradient = stopsToCanvasGradient(paletteCtx, stops, 256, 1)
  paletteCtx.fillStyle = gradient
  paletteCtx.fillRect(0, 0, 256, 1)
  return paletteCtx.getImageData(0, 0, 256, 1).data
}
