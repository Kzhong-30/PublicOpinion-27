import { useState, useRef, useMemo } from 'react'
import type { HeatmapConfig, HeatmapDataset, ABComparison } from './types'
import { PRESET_DATASETS, generateMockDataset } from './utils/mockData'
import { GRADIENT_PRESETS } from './utils/gradients'
import { HeatmapCanvas, type HeatmapCanvasHandle } from './components/HeatmapCanvas'
import { ImageUploader } from './components/ImageUploader'
import { HeatmapControls } from './components/HeatmapControls'
import { DatasetSelector } from './components/DatasetSelector'
import { ABComparePanel } from './components/ABComparePanel'
import { ReportPanel } from './components/ReportPanel'
import './App.css'

const PAGE_WIDTH = 1200
const PAGE_HEIGHT = 2400

function App() {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [datasets, setDatasets] = useState<HeatmapDataset[]>(PRESET_DATASETS)
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(PRESET_DATASETS[0].id)

  const [config, setConfig] = useState<HeatmapConfig>({
    mode: 'click',
    opacity: 0.75,
    radius: 50,
    blur: 20,
    gradient: GRADIENT_PRESETS[0].stops,
    showLegend: true
  })

  const [comparison, setComparison] = useState<ABComparison>({
    enabled: false,
    datasetA: null,
    datasetB: null,
    diffMode: 'absolute'
  })

  const canvasRef = useRef<HeatmapCanvasHandle>(null)

  const selectedDataset = useMemo(
    () => datasets.find(d => d.id === selectedDatasetId) || null,
    [datasets, selectedDatasetId]
  )

  const datasetA = useMemo(
    () => (comparison.enabled && comparison.datasetA
      ? datasets.find(d => d.id === comparison.datasetA) || null
      : selectedDataset),
    [datasets, comparison, selectedDataset]
  )

  const datasetB = useMemo(
    () => (comparison.enabled && comparison.datasetB
      ? datasets.find(d => d.id === comparison.datasetB) || null
      : null),
    [datasets, comparison]
  )

  const addNewDataset = () => {
    const newSeed = Math.floor(Math.random() * 10000)
    const newId = `custom-${Date.now()}`
    const newDataset = generateMockDataset(
      newId,
      `自定义数据集 ${datasets.length + 1}`,
      newSeed,
      PAGE_WIDTH,
      PAGE_HEIGHT
    )
    setDatasets([...datasets, newDataset])
    setSelectedDatasetId(newId)
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">🔥</div>
          <div>
            <h1 className="brand-title">Heatmap Studio</h1>
            <p className="brand-subtitle">网页交互热图分析工具 · React 18 + TypeScript</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={addNewDataset}
            className="btn-secondary"
          >
            ➕ 生成新数据集
          </button>
          <button
            onClick={() => canvasRef.current?.exportPNG(false)}
            className="btn-secondary"
          >
            🖼️ 导出热图
          </button>
          <button
            onClick={() => canvasRef.current?.exportPNG(true)}
            className="btn-primary"
          >
            ⬇️ 导出合成图
          </button>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar sidebar-left">
          <ImageUploader
            onImageLoad={setBackgroundImage}
            currentImage={backgroundImage}
          />

          <DatasetSelector
            datasets={datasets}
            selectedId={selectedDatasetId}
            onSelect={setSelectedDatasetId}
          />

          <HeatmapControls
            config={config}
            onChange={setConfig}
          />
        </aside>

        <main className="main-content">
          <div className="canvas-toolbar">
            <div className="toolbar-info">
              <span className="info-tag" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                {comparison.enabled ? '🔀 A/B 对比模式' : config.mode === 'click' ? '👆 点击热图' : config.mode === 'scroll' ? '📜 滚动热图' : '👁️ 注意力热图'}
              </span>
              {comparison.enabled && datasetA && datasetB && (
                <>
                  <span className="info-sep">vs</span>
                  <span className="info-tag" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                    🅰️ {datasetA.name}
                  </span>
                  <span className="info-tag" style={{ background: 'rgba(249,115,22,0.2)', color: '#fb923c' }}>
                    🅱️ {datasetB.name}
                  </span>
                </>
              )}
              {!comparison.enabled && selectedDataset && (
                <span className="info-tag" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                  📊 {selectedDataset.name}
                </span>
              )}
            </div>
            <div className="toolbar-meta">
              <span>画布: {PAGE_WIDTH} × {PAGE_HEIGHT}</span>
            </div>
          </div>

          <HeatmapCanvas
            ref={canvasRef}
            backgroundImage={backgroundImage}
            datasetA={datasetA}
            datasetB={datasetB}
            abEnabled={comparison.enabled}
            diffMode={comparison.diffMode}
            config={config}
            pageWidth={PAGE_WIDTH}
            pageHeight={PAGE_HEIGHT}
          />
        </main>

        <aside className="sidebar sidebar-right">
          <ABComparePanel
            datasets={datasets}
            comparison={comparison}
            onChange={setComparison}
          />

          <ReportPanel
            dataset={comparison.enabled ? datasetB || datasetA : selectedDataset}
            mode={config.mode}
          />

          <div className="panel-section">
            <h3 className="panel-title">💡 使用指南</h3>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7
            }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong style={{ color: '#a5b4fc' }}>①</strong> 上传你要分析的网页截图
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong style={{ color: '#a5b4fc' }}>②</strong> 选择或生成用户行为数据集
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong style={{ color: '#a5b4fc' }}>③</strong> 切换三种热图模式查看不同维度
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong style={{ color: '#a5b4fc' }}>④</strong> 启用 A/B 对比查看版本差异
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#a5b4fc' }}>⑤</strong> 导出 PNG 热图或 CSV 报告
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default App
