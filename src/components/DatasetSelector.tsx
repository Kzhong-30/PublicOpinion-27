import type { HeatmapDataset } from '../types'

interface Props {
  datasets: HeatmapDataset[]
  selectedId: string
  onSelect: (id: string) => void
}

export function DatasetSelector({ datasets, selectedId, onSelect }: Props) {
  return (
    <div className="panel-section">
      <h3 className="panel-title">📊 数据集 (Mock 数据)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {datasets.map(dataset => {
          const isSelected = dataset.id === selectedId
          const totalClicks = dataset.clicks.reduce((s, c) => s + c.count, 0)
          const totalSessions = dataset.scrolls.length

          return (
            <button
              key={dataset.id}
              onClick={() => onSelect(dataset.id)}
              style={{
                padding: 10,
                borderRadius: 8,
                border: isSelected
                  ? '2px solid #6366f1'
                  : '2px solid transparent',
                background: isSelected
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                {dataset.name}
              </div>
              <div style={{
                display: 'flex',
                gap: 12,
                marginTop: 4,
                fontSize: 11,
                color: 'rgba(255,255,255,0.5)'
              }}>
                <span>👆 {totalClicks} 点击</span>
                <span>📜 {totalSessions} 滚动点</span>
                <span>👁️ {dataset.attentions.length} 注意力</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
