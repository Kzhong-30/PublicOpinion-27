import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import type { HeatmapDataset, HeatmapConfig, ColorStop } from '../types'
import { getModePixels, renderHeatmap, computeDiffPixels, exportCanvasToPNG, downloadDataURL } from '../utils/heatmapEngine'
import { calcImageRect, remapPixelsToImageRect } from '../utils/imageTransform'

export interface HeatmapCanvasHandle {
  exportPNG: (withBackground: boolean) => void
  getCanvas: () => HTMLCanvasElement | null
}

interface Props {
  backgroundImage: HTMLImageElement | null
  datasetA: HeatmapDataset | null
  datasetB: HeatmapDataset | null
  abEnabled: boolean
  diffMode: 'absolute' | 'percentage'
  config: HeatmapConfig
  pageWidth: number
  pageHeight: number
}

export const HeatmapCanvas = forwardRef<HeatmapCanvasHandle, Props>(function HeatmapCanvas(
  { backgroundImage, datasetA, datasetB, abEnabled, diffMode, config, pageWidth, pageHeight },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const heatCanvasRef = useRef<HTMLCanvasElement>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)

  useImperativeHandle(ref, () => ({
    exportPNG: (withBackground: boolean) => {
      if (!heatCanvasRef.current || !displayCanvasRef.current) return
      const dataUrl = exportCanvasToPNG(
        displayCanvasRef.current,
        withBackground ? bgCanvasRef.current || undefined : undefined
      )
      const filename = `heatmap-${config.mode}-${Date.now()}.png`
      downloadDataURL(dataUrl, filename)
    },
    getCanvas: () => displayCanvasRef.current
  }))

  useEffect(() => {
    if (!bgCanvasRef.current) return
    const ctx = bgCanvasRef.current.getContext('2d')!
    ctx.clearRect(0, 0, pageWidth, pageHeight)

    if (backgroundImage) {
      const { dx, dy, dw, dh } = calcImageRect(backgroundImage, pageWidth, pageHeight)
      ctx.drawImage(backgroundImage, dx, dy, dw, dh)
    } else {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, pageWidth, pageHeight)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      for (let x = 0; x <= pageWidth; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, pageHeight)
        ctx.stroke()
      }
      for (let y = 0; y <= pageHeight; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(pageWidth, y)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.font = 'bold 48px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('网页截图占位', pageWidth / 2, pageHeight / 2)
      ctx.font = '24px system-ui'
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.fillText('请在左侧上传网页截图以开始分析', pageWidth / 2, pageHeight / 2 + 50)
    }
  }, [backgroundImage, pageWidth, pageHeight])

  useEffect(() => {
    if (!heatCanvasRef.current || !datasetA) return
    const ctx = heatCanvasRef.current.getContext('2d')!
    ctx.clearRect(0, 0, pageWidth, pageHeight)

    let gradient: ColorStop[] = config.gradient
    const imageRect = calcImageRect(backgroundImage, pageWidth, pageHeight)
    const srcW = datasetA.pageWidth
    const srcH = datasetA.pageHeight
    let pixels = remapPixelsToImageRect(
      getModePixels(config.mode, datasetA),
      srcW,
      srcH,
      imageRect
    )

    if (abEnabled && datasetB) {
      const pixelsA = remapPixelsToImageRect(
        getModePixels(config.mode, datasetA),
        srcW,
        srcH,
        imageRect
      )
      const pixelsB = remapPixelsToImageRect(
        getModePixels(config.mode, datasetB),
        datasetB.pageWidth,
        datasetB.pageHeight,
        imageRect
      )
      pixels = computeDiffPixels(pixelsA, pixelsB, diffMode)
      gradient = [
        { position: 0, color: 'rgba(0, 150, 255, 0.9)' },
        { position: 0.25, color: 'rgba(0, 200, 255, 0.7)' },
        { position: 0.5, color: 'rgba(50, 50, 50, 0)' },
        { position: 0.75, color: 'rgba(255, 150, 0, 0.7)' },
        { position: 1, color: 'rgba(255, 50, 50, 0.9)' }
      ]
    }

    renderHeatmap(ctx, pageWidth, pageHeight, pixels, {
      radius: config.radius,
      blur: config.blur,
      opacity: config.opacity,
      gradient
    })
  }, [datasetA, datasetB, abEnabled, diffMode, config, pageWidth, pageHeight])

  useEffect(() => {
    if (!displayCanvasRef.current || !bgCanvasRef.current || !heatCanvasRef.current) return
    const ctx = displayCanvasRef.current.getContext('2d')!
    ctx.clearRect(0, 0, pageWidth, pageHeight)
    ctx.drawImage(bgCanvasRef.current, 0, 0)
    ctx.drawImage(heatCanvasRef.current, 0, 0)
  }, [backgroundImage, datasetA, datasetB, abEnabled, diffMode, config, pageWidth, pageHeight])

  return (
    <div
      ref={containerRef}
      className="heatmap-canvas-container"
      style={{
        width: '100%',
        overflow: 'auto',
        background: '#0d0d1a',
        borderRadius: 12,
        padding: 16,
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: pageWidth,
          height: pageHeight,
          margin: '0 auto',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
        }}
      >
        <canvas
          ref={bgCanvasRef}
          width={pageWidth}
          height={pageHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'none'
          }}
        />
        <canvas
          ref={heatCanvasRef}
          width={pageWidth}
          height={pageHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'none'
          }}
        />
        <canvas
          ref={displayCanvasRef}
          width={pageWidth}
          height={pageHeight}
          style={{
            display: 'block',
            cursor: 'crosshair'
          }}
        />
      </div>
    </div>
  )
})
