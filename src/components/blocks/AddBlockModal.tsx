'use client'

import { useState } from 'react'
import { BlockType } from '@/types'
import { X, ExternalLink, Image, Video, Mail, ShoppingBag, AlignLeft } from 'lucide-react'

const BLOCK_TYPES: { type: BlockType; icon: React.ElementType; label: string; description: string }[] = [
  { type: 'link',       icon: ExternalLink, label: '連結按鈕', description: '加入任意連結' },
  { type: 'banner',     icon: Image,        label: '橫幅看板', description: '圖片橫幅區塊' },
  { type: 'heading',    icon: AlignLeft,    label: '標題文字', description: '分頁標題或說明' },
  { type: 'email_form', icon: Mail,         label: 'Email 表單', description: '蒐集粉絲名單' },
  { type: 'product',    icon: ShoppingBag,  label: '數位商品', description: '販售數位產品' },
  { type: 'video',      icon: Video,        label: '影片',     description: '嵌入 YouTube' },
]

interface Props {
  onAdd: (type: BlockType, title: string, content: Record<string, unknown>) => void
  onClose: () => void
}

export function AddBlockModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<'pick' | 'fill'>('pick')
  const [selected, setSelected] = useState<BlockType | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    let content: Record<string, unknown> = {}
    if (selected === 'link')       content = { url }
    if (selected === 'banner')     content = { imageUrl: url }
    if (selected === 'heading')    content = { text: title }
    if (selected === 'email_form') content = { placeholder: '輸入你的 Email', buttonText: '訂閱' }
    if (selected === 'product')    content = { price: 0, currency: 'NT$', checkoutUrl: url }
    if (selected === 'video')      content = { platform: 'youtube', embedId: url }
    onAdd(selected, title, content)
    onClose()
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 10,
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {step === 'pick' ? '新增區塊' : '設定區塊'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {step === 'pick' ? (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {BLOCK_TYPES.map(({ type, icon: Icon, label, description }) => (
              <button key={type} onClick={() => { setSelected(type); setStep('fill') }}
                className="flex flex-col items-center gap-2 text-center transition-all"
                style={{ padding: 16, borderRadius: 12, border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.background = 'white' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--gradient-blue)' }}>
                  <Icon size={18} color="white" />
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selected !== 'email_form' && (
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  {selected === 'heading' ? '文字內容' : '標題'}
                </label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  required placeholder={selected === 'heading' ? '標題文字' : '顯示名稱'}
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'}
                />
              </div>
            )}
            {['link', 'banner', 'product', 'video'].includes(selected ?? '') && (
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  {selected === 'banner' ? '圖片網址' : selected === 'video' ? 'YouTube 網址' : '連結網址'}
                </label>
                <input value={url} onChange={e => setUrl(e.target.value)}
                  required placeholder="https://..."
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'}
                />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('pick')}
                className="flex-1 py-2.5 font-semibold text-sm transition-colors"
                style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'white', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                返回
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center"
                style={{ borderRadius: 10, padding: '10px 20px', fontSize: 14 }}>
                新增
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
