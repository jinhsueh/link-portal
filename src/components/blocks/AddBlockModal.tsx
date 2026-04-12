'use client'

import { useState, useRef } from 'react'
import { BlockType } from '@/types'
import { X, ExternalLink, Image, Video, Mail, ShoppingBag, AlignLeft, ChevronDown, Upload, Timer, HelpCircle, Images, MapPin, Code } from 'lucide-react'

const RECOMMENDED_TYPES: { type: BlockType; icon: React.ElementType; label: string; description: string }[] = [
  { type: 'link',       icon: ExternalLink, label: '連結按鈕', description: '加入 IG、YouTube 等連結' },
  { type: 'product',    icon: ShoppingBag,  label: '數位商品', description: '販售課程、模板等產品' },
  { type: 'email_form', icon: Mail,         label: 'Email 表單', description: '蒐集粉絲名單' },
]

const MORE_TYPES: { type: BlockType; icon: React.ElementType; label: string; description: string }[] = [
  { type: 'banner',     icon: Image,        label: '橫幅看板', description: '圖片橫幅區塊' },
  { type: 'heading',    icon: AlignLeft,    label: '標題文字', description: '分頁標題或說明' },
  { type: 'video',      icon: Video,        label: '影片',     description: '嵌入 YouTube / Spotify' },
  { type: 'countdown',  icon: Timer,        label: '倒數計時', description: '活動或限時優惠' },
  { type: 'faq',        icon: HelpCircle,   label: 'FAQ 問答', description: '常見問題摺疊' },
  { type: 'carousel',   icon: Images,       label: '圖片輪播', description: '多張圖滑動展示' },
  { type: 'map',        icon: MapPin,       label: '地圖嵌入', description: 'Google Maps' },
  { type: 'embed',      icon: Code,         label: 'HTML 嵌入', description: '自訂 iframe / HTML' },
]

const BLOCK_TYPES = [...RECOMMENDED_TYPES, ...MORE_TYPES]

const CURRENCIES = ['NT$', 'USD', 'EUR', 'JPY', 'HKD']

interface Props {
  onAdd: (type: BlockType, title: string, content: Record<string, unknown>) => void
  onClose: () => void
}

export function AddBlockModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<'pick' | 'fill'>('pick')
  const [selected, setSelected] = useState<BlockType | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // product-specific
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('NT$')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'url' | 'imageUrl') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (target === 'url') setUrl(data.url)
        else setImageUrl(data.url)
      }
    } catch { /* silent */ }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    let content: Record<string, unknown> = {}
    if (selected === 'link')       content = { url }
    if (selected === 'banner')     content = { imageUrl: url }
    if (selected === 'heading')    content = { text: title }
    if (selected === 'email_form') content = { placeholder: '輸入你的 Email', buttonText: '訂閱' }
    if (selected === 'video')      content = parseVideoUrl(url)
    if (selected === 'countdown')  content = { targetDate: url, label: title || '即將開始' }
    if (selected === 'faq')        content = { items: [{ question: title || '問題？', answer: '答案...' }] }
    if (selected === 'carousel')   content = { images: url ? [{ url }] : [] }
    if (selected === 'map')        content = { query: url || title, zoom: 15 }
    if (selected === 'embed')      content = { html: url, height: 300 }
    if (selected === 'product') {
      content = {
        price: parseFloat(price) || 0,
        currency,
        ...(description ? { description } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      }
    }
    onAdd(selected, title, content)
    onClose()
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 10,
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
  }
  const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--color-primary)')
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--color-border)')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%',
        maxWidth: selected === 'product' ? 480 : 420,
        boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto',
      }}>

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
          <div style={{ padding: 16 }}>
            {/* Recommended */}
            <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
              style={{ color: 'var(--color-primary)' }}>
              推薦
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {RECOMMENDED_TYPES.map(({ type, icon: Icon, label, description }) => (
                <button key={type} onClick={() => { setSelected(type); setStep('fill') }}
                  className="flex flex-col items-center gap-2 text-center transition-all"
                  style={{ padding: 16, borderRadius: 12, border: '2px solid var(--color-primary)', background: 'var(--color-primary-light)', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#dbeafe' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--gradient-blue)' }}>
                    <Icon size={18} color="white" />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</span>
                </button>
              ))}
            </div>
            {/* More block types */}
            <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1"
              style={{ color: 'var(--color-text-muted)' }}>
              更多區塊
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {MORE_TYPES.map(({ type, icon: Icon, label, description }) => (
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── PRODUCT block ── */}
            {selected === 'product' ? (
              <>
                {/* Stripe notice banner */}
                <div className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
                  <ShoppingBag size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} />
                  <p className="text-xs" style={{ color: 'var(--color-primary)', lineHeight: 1.6 }}>
                    付款由 <strong>Stripe</strong> 處理。請確認已在 <code>.env.local</code> 設定
                    <code> STRIPE_SECRET_KEY</code>。
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>商品名稱 *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required
                    placeholder="例：Notion 模板包" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>商品描述</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="簡短說明商品內容…" rows={2}
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={focusIn} onBlur={focusOut} />
                </div>

                {/* Price + currency row */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>售價 *</label>
                  <div className="flex gap-2">
                    {/* Currency selector */}
                    <div className="relative" style={{ flexShrink: 0 }}>
                      <select value={currency} onChange={e => setCurrency(e.target.value)}
                        style={{ ...inputStyle, width: 'auto', paddingRight: 32, appearance: 'none', cursor: 'pointer' }}
                        onFocus={focusIn} onBlur={focusOut}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
                    </div>
                    <input type="number" min="0" step="1" value={price}
                      onChange={e => setPrice(e.target.value)} required
                      placeholder="299" style={{ ...inputStyle, flex: 1 }}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>商品圖片（選填）</label>
                  <div className="flex gap-2 items-center">
                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                      placeholder="圖片網址或上傳" style={{ ...inputStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                    <label className="flex-shrink-0 px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', cursor: 'pointer', border: '1px solid var(--color-border)' }}>
                      <Upload size={14} />
                      {uploading ? '...' : '上傳'}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => handleFileUpload(e, 'imageUrl')} />
                    </label>
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg"
                      style={{ width: '100%', height: 80, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* ── All other blocks ── */}
                {selected !== 'email_form' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                      {selected === 'heading' ? '文字內容' : '標題'}
                    </label>
                    <input value={title} onChange={e => setTitle(e.target.value)}
                      required placeholder={selected === 'heading' ? '標題文字' : '顯示名稱'}
                      style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                )}
                {['link', 'video'].includes(selected ?? '') && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                      {selected === 'video' ? 'YouTube / Spotify 網址' : '連結網址'}
                    </label>
                    <input value={url} onChange={e => setUrl(e.target.value)}
                      required placeholder="https://..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                )}
                {selected === 'countdown' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>目標時間</label>
                    <input type="datetime-local" value={url} onChange={e => setUrl(e.target.value)}
                      required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                )}
                {selected === 'map' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>地點或地址</label>
                    <input value={url} onChange={e => setUrl(e.target.value)}
                      required placeholder="台北 101、25.0330,121.5654" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                )}
                {selected === 'embed' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>HTML / iframe 程式碼</label>
                    <textarea value={url} onChange={e => setUrl(e.target.value)}
                      required placeholder='<iframe src="..." />' rows={3}
                      style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', fontSize: 12 }}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>
                )}
                {selected === 'banner' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                      橫幅圖片
                    </label>
                    {url ? (
                      <div className="relative rounded-xl overflow-hidden mb-2" style={{ border: '1px solid var(--color-border)' }}>
                        <img src={url} alt="Banner preview" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                        <button type="button" onClick={() => setUrl('')}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer' }}>
                          <X size={12} color="white" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-6 rounded-xl"
                        style={{ border: '2px dashed var(--color-border)', background: 'var(--color-surface)' }}>
                        <Upload size={24} style={{ color: 'var(--color-text-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {uploading ? '上傳中...' : '上傳圖片或輸入網址'}
                        </p>
                        <div className="flex gap-2">
                          <label className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                            style={{ background: 'var(--color-primary)', color: 'white', cursor: 'pointer' }}>
                            選擇圖片
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                              onChange={e => handleFileUpload(e, 'url')} />
                          </label>
                        </div>
                      </div>
                    )}
                    <input value={url} onChange={e => setUrl(e.target.value)}
                      placeholder="或貼上圖片網址 https://..." style={{ ...inputStyle, marginTop: 8 }}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('pick')}
                className="flex-1 py-2.5 font-semibold text-sm"
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

function parseVideoUrl(input: string): Record<string, unknown> {
  const trimmed = input.trim()
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) return { platform: 'youtube', embedId: ytMatch[1], url: trimmed }

  const ttMatch = trimmed.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (ttMatch) return { platform: 'tiktok', embedId: ttMatch[1], url: trimmed }

  return { platform: 'youtube', embedId: trimmed, url: trimmed }
}
