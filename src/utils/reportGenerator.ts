import type { HeatmapDataset, ReportData, HeatmapMode, HotSpot } from '../types'
import { getModePixels, findTopHotSpots, normalizeValues } from './heatmapEngine'

export function generateReport(
  dataset: HeatmapDataset,
  mode: HeatmapMode
): ReportData {
  const pixels = getModePixels(mode, dataset)
  const { pixels: normalized, maxValue } = normalizeValues(pixels)
  const topSpots = findTopHotSpots(
    normalized.map(p => ({ ...p, value: p.value * maxValue })),
    10
  )

  const totalClicks = dataset.clicks.reduce((sum, c) => sum + c.count, 0)

  const totalDuration = dataset.scrolls.reduce((sum, s) => sum + s.duration, 0)
  let weightedDepth = 0
  dataset.scrolls.forEach(s => {
    weightedDepth += s.scrollTop * s.duration
  })
  const avgScrollDepth = totalDuration > 0
    ? (weightedDepth / totalDuration) / (dataset.pageHeight - 800) * 100
    : 0

  const maxAttentionDuration = dataset.attentions.reduce(
    (max, a) => Math.max(max, a.duration),
    0
  )

  const modeLabel = mode === 'click' ? '点击次数' : mode === 'scroll' ? '停留时长(秒)' : '注意力时长(秒)'
  const finalSpots: HotSpot[] = topSpots.map(s => ({
    ...s,
    value: Math.round(s.value * (mode === 'click' ? 1 : 10)) / 10
  }))

  return {
    totalClicks,
    avgScrollDepth: Math.round(avgScrollDepth * 10) / 10,
    maxAttentionDuration,
    topSpots: finalSpots,
    datasetName: dataset.name,
    generatedAt: Date.now()
  }

  void modeLabel
}

export function formatReportAsCSV(report: ReportData, mode: HeatmapMode): string {
  const modeLabel = mode === 'click' ? '点击次数' : mode === 'scroll' ? '停留秒数' : '注意力秒数'
  const lines = [
    `热图数据报告 - ${report.datasetName}`,
    `生成时间,${new Date(report.generatedAt).toLocaleString('zh-CN')}`,
    `热图模式,${mode === 'click' ? '点击热图' : mode === 'scroll' ? '滚动热图' : '注意力热图'}`,
    '',
    '=== 汇总数据 ===',
    `总点击数,${report.totalClicks}`,
    `平均滚动深度,${report.avgScrollDepth}%`,
    `最大注意力时长(ms),${report.maxAttentionDuration}`,
    '',
    `=== Top10 热点区域 (${modeLabel}) ===`,
    '排名,X坐标,Y坐标,数值'
  ]

  report.topSpots.forEach(spot => {
    lines.push(`${spot.rank},${spot.x},${spot.y},${spot.value}`)
  })

  return lines.join('\n')
}

export function downloadCSV(report: ReportData, mode: HeatmapMode): void {
  const csv = formatReportAsCSV(report, mode)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `heatmap-report-${report.datasetName}-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
