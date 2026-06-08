import { useState, useRef } from 'react'

interface Props {
  onImageLoad: (img: HTMLImageElement) => void
  currentImage: HTMLImageElement | null
}

export function ImageUploader({ onImageLoad, currentImage }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件 (PNG, JPG, WebP)')
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        onImageLoad(img)
      }
      img.onerror = () => {
        setError('图片加载失败')
      }
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      setError('文件读取失败')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="panel-section">
      <h3 className="panel-title">📷 网页截图上传</h3>

      <div
        onDragOver={e => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
          borderRadius: 10,
          padding: 24,
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.03)',
          transition: 'all 0.2s',
          marginBottom: 12
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>
          {currentImage ? '✅' : '📁'}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          {currentImage ? '已加载截图，点击更换' : '拖拽图片到此处或点击上传'}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          支持 PNG / JPG / WebP 格式
        </div>
      </div>

      {currentImage && (
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(34, 197, 94, 0.15)',
          borderRadius: 8,
          fontSize: 12
        }}>
          <span style={{ color: '#4ade80' }}>
            ✓ {currentImage.width} × {currentImage.height}
          </span>
          <button
            onClick={e => {
              e.stopPropagation()
              onImageLoad(null as unknown as HTMLImageElement)
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 11
            }}
          >
            清除
          </button>
        </div>
      )}

      {error && (
        <div style={{
          color: '#f87171',
          fontSize: 12,
          padding: 8,
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: 6,
          marginTop: 8
        }}>
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
