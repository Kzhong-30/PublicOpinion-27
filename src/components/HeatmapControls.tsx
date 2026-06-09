import type { HeatmapConfig, HeatmapMode, ColorStop } from '../types'
import { GRADIENT_PRESETS } from '../utils/gradients'

function colorStopsEqual(a: ColorStop[], b: ColorStop[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].position !== b[i].position || a[i].color !== b[i].color) return false
  }
  return true
}

interface Props {
  config: HeatmapConfig
  onChange: (config: HeatmapConfig) => void
}

const MODE_OPTIONS: { value: HeatmapMode; label: string; icon: string; desc: string }[] = [
  { value: 'click', label: '点击热图', icon: '👆', desc: '红色密集区域表示点击频繁' },
  { value: 'scroll', label: '滚动热图', icon: '📜', desc: '显示用户滚动停留时间分布' },
  { value: 'attention', label: '注意力热图', icon: '👁️', desc: '基于鼠标移动轨迹模拟' }
]

export function HeatmapControls({ config, onChange }: Props) {
  const update = <K extends keyof HeatmapConfig>(key: K, value: HeatmapConfig[K]) => {
    onChange({ ...config, [key]: value })
  }

  return (
    <div className="panel-section">
      <h3 className="panel-title">🎯 热图模式</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MODE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => update('mode', opt.value)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: config.mode === opt.value
                ? '2px solid #6366f1'
                : '2px solid transparent',
              background: config.mode === opt.value
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(255,255,255,0.04)',
              color: 'white',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              transition: 'all 0.15s'
            }}
          >
            <div style={{ fontWeight: 600 }}>
              <span style={{ marginRight: 8 }}>{opt.icon}</span>
              {opt.label}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              {opt.desc}
            </div>
          </button>
        ))}
      </div>

      <h3 className="panel-title" style={{ marginTop: 20 }}>🎨 颜色梯度</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {GRADIENT_PRESETS.map(preset => {
          const isActive = colorStopsEqual(config.gradient, preset.stops as ColorStop[])
          return (
            <button
              key={preset.name}
              onClick={() => update('gradient', preset.stops as ColorStop[])}
              style={{
                padding: 6,
                borderRadius: 8,
                border: isActive ? '2px solid #6366f1' : '2px solid transparent',
                background: 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                fontSize: 11,
                color: 'white',
                transition: 'all 0.15s'
              }}
            >
              <div
                style={{
                  height: 18,
                  borderRadius: 4,
                  background: `linear-gradient(to right, ${preset.stops
                    .map(s => `${s.color.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
                      const parts = inner.split(',').map((p: string) => p.trim())
                      if (parts.length === 4) return `rgba(${parts[0]},${parts[1]},${parts[2]},${parts[3] === '0' ? '0.3' : parts[3]})`
                      return `rgb(${inner})`
                    })} ${(s.position * 100).toFixed(0)}%`)
                    .join(', ')})`,
                  marginBottom: 4
                }}
              />
              {preset.name}
            </button>
          )
        })}
      </div>

      <h3 className="panel-title" style={{ marginTop: 20 }}>⚙️ 渲染参数</h3>

      <SliderControl
        label="透明度"
        value={config.opacity}
        min={0}
        max={1}
        step={0.05}
        onChange={v => update('opacity', v)}
        display={v => `${Math.round(v * 100)}%`}
      />

      <SliderControl
        label="热力半径"
        value={config.radius}
        min={10}
        max={120}
        step={5}
        onChange={v => update('radius', v)}
        display={v => `${v}px`}
      />

      <SliderControl
        label="模糊强度"
        value={config.blur}
        min={0}
        max={40}
        step={2}
        onChange={v => update('blur', v)}
        display={v => `${v}px`}
      />
    </div>
  )
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: (v: number) => string
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4
      }}>
        <span>{label}</span>
        <span style={{ color: '#818cf8', fontWeight: 600 }}>{display(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#6366f1',
          cursor: 'pointer'
        }}
      />
    </div>
  )
}
