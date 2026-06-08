import type { HeatmapDataset, ABComparison } from '../types'

interface Props {
  datasets: HeatmapDataset[]
  comparison: ABComparison
  onChange: (cmp: ABComparison) => void
}

export function ABComparePanel({ datasets, comparison, onChange }: Props) {
  const update = <K extends keyof ABComparison>(key: K, value: ABComparison[K]) => {
    onChange({ ...comparison, [key]: value })
  }

  return (
    <div className="panel-section">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12
      }}>
        <h3 className="panel-title" style={{ margin: 0 }}>🔀 A/B 对比测试</h3>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          fontSize: 12
        }}>
          <div style={{
            position: 'relative',
            width: 40,
            height: 22,
            borderRadius: 11,
            background: comparison.enabled ? '#6366f1' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.2s'
          }}>
            <div style={{
              position: 'absolute',
              top: 2,
              left: comparison.enabled ? 20 : 2,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'white',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }} />
            <input
              type="checkbox"
              checked={comparison.enabled}
              onChange={e => update('enabled', e.target.checked)}
              style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
            />
          </div>
          <span style={{ color: comparison.enabled ? '#818cf8' : 'rgba(255,255,255,0.5)' }}>
            {comparison.enabled ? '已启用' : '已关闭'}
          </span>
        </label>
      </div>

      {comparison.enabled && (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#60a5fa', display: 'block', marginBottom: 4 }}>
              🅰️ 版本 A (基线)
            </label>
            <select
              value={comparison.datasetA || ''}
              onChange={e => update('datasetA', e.target.value || null)}
              style={selectStyle}
            >
              <option value="">选择数据集...</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#f97316', display: 'block', marginBottom: 4 }}>
              🅱️ 版本 B (对比)
            </label>
            <select
              value={comparison.datasetB || ''}
              onChange={e => update('datasetB', e.target.value || null)}
              style={selectStyle}
            >
              <option value="">选择数据集...</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>
              差异计算模式
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => update('diffMode', 'absolute')}
                style={{
                  ...tabStyle,
                  background: comparison.diffMode === 'absolute'
                    ? 'rgba(99, 102, 241, 0.3)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: comparison.diffMode === 'absolute' ? '#6366f1' : 'transparent'
                }}
              >
                绝对值
              </button>
              <button
                onClick={() => update('diffMode', 'percentage')}
                style={{
                  ...tabStyle,
                  background: comparison.diffMode === 'percentage'
                    ? 'rgba(99, 102, 241, 0.3)'
                    : 'rgba(255,255,255,0.05)',
                  borderColor: comparison.diffMode === 'percentage' ? '#6366f1' : 'transparent'
                }}
              >
                百分比
              </button>
            </div>
          </div>

          <div style={{
            padding: 10,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 8,
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 12, height: 12, background: 'rgba(0,150,255,0.9)', borderRadius: 2 }} />
              <span>蓝色区域：版本 A 更活跃</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, background: 'rgba(255,50,50,0.9)', borderRadius: 2 }} />
              <span>红色区域：版本 B 更活跃</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  fontSize: 12,
  outline: 'none',
  cursor: 'pointer'
}

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid',
  color: 'white',
  fontSize: 11,
  cursor: 'pointer',
  transition: 'all 0.15s'
}
