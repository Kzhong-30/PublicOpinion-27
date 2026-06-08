import { useState, useEffect } from 'react'
import type { HeatmapDataset, HeatmapMode, ReportData } from '../types'
import { generateReport, downloadCSV } from '../utils/reportGenerator'

interface Props {
  dataset: HeatmapDataset | null
  mode: HeatmapMode
}

export function ReportPanel({ dataset, mode }: Props) {
  const [report, setReport] = useState<ReportData | null>(null)

  useEffect(() => {
    if (dataset) {
      setReport(generateReport(dataset, mode))
    } else {
      setReport(null)
    }
  }, [dataset, mode])

  if (!report || !dataset) {
    return (
      <div className="panel-section">
        <h3 className="panel-title">📈 热力数据报告</h3>
        <div style={{
          padding: 24,
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12
        }}>
          选择数据集后生成报告
        </div>
      </div>
    )
  }

  const modeLabel = mode === 'click' ? '点击次数' : mode === 'scroll' ? '停留时长' : '注意力时长'

  return (
    <div className="panel-section">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
      }}>
        <h3 className="panel-title" style={{ margin: 0 }}>📈 热力数据报告</h3>
        <button
          onClick={() => downloadCSV(report, mode)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: 'none',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
        >
          ⬇️ 导出 CSV
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        marginBottom: 16
      }}>
        <StatCard label="总点击" value={report.totalClicks.toLocaleString()} color="#818cf8" />
        <StatCard label="平均滚动深度" value={`${report.avgScrollDepth}%`} color="#22d3ee" />
        <StatCard
          label="注意力峰值"
          value={`${(report.maxAttentionDuration / 1000).toFixed(1)}s`}
          color="#f59e0b"
        />
      </div>

      <h4 style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        margin: '0 0 8px 0'
      }}>
        🏆 Top10 热点区域 ({modeLabel})
      </h4>

      <div style={{
        maxHeight: 320,
        overflowY: 'auto',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{
              background: 'rgba(255,255,255,0.05)',
              position: 'sticky',
              top: 0
            }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>坐标</th>
              <th style={thStyle}>{modeLabel}</th>
              <th style={thStyle}>强度</th>
            </tr>
          </thead>
          <tbody>
            {report.topSpots.map((spot, idx) => {
              const maxVal = report.topSpots[0]?.value || 1
              const intensity = spot.value / maxVal
              const rankColors = ['#fbbf24', '#d1d5db', '#d97706']
              const rankColor = idx < 3 ? rankColors[idx] : '#6b7280'

              return (
                <tr
                  key={spot.rank}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'
                  }}
                >
                  <td style={{
                    ...tdStyle,
                    fontWeight: 700,
                    color: rankColor,
                    width: 36
                  }}>
                    {spot.rank <= 3 ? ['🥇', '🥈', '🥉'][spot.rank - 1] : spot.rank}
                  </td>
                  <td style={tdStyle}>
                    <code style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: '#a5b4fc',
                      fontSize: 11
                    }}>
                      ({spot.x}, {spot.y})
                    </code>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#e2e8f0' }}>
                    {spot.value.toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, width: 80 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <div style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${intensity * 100}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, #6366f1, #ec4899)`,
                          borderRadius: 3,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <span style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.5)',
                        width: 30,
                        textAlign: 'right'
                      }}>
                        {Math.round(intensity * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: 12,
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'right'
      }}>
        数据集: {report.datasetName} · 生成于 {new Date(report.generatedAt).toLocaleString('zh-CN')}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: 10,
      borderRadius: 8,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color,
        letterSpacing: -0.5
      }}>
        {value}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  textAlign: 'left',
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 500,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: 0.5
}

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  color: 'rgba(255,255,255,0.8)'
}
