'use client'

import { useState, useEffect } from 'react'
import { BlockData, BlockType } from '@/types'
import { X, ChevronDown } from 'lucide-react'

const CURRENCIES = ['NT$', 'USD', 'EUR', 'JPY', 'HKD']

interface Props {
  block: BlockData
  onSave: (id: string, title: string, content: Record<string, unknown>) => void
  onClose: () => void
}

export function EditBlockModal({ block, onSave, onClose }: Props) {
  const content = block.content as Record<string, unknown>

  // Common
  const [title, setTitle] = useState(block.title ?? '')

  // Link
  const [url, setUrl] = useState((content.url as string) ?? '')

  // Banner
  const [imageUrl, setImageUrl] = useState((content.imageUrl as string) ?? '')
  const [linkUrl, setLinkUrl] = useState((content.linkUrl as string) ?? '')
  const [alt, setAlt] = useState((content.alt as string) ?? '')

  // Heading
  const [text, setText] = useState((content.text as string) ?? '')
  const [size, setSize] = useState<string>((content.size as string) ?? 'md')

  // Product
  const [price, setPrice] = useState(String(content.price ?? ''))
  const [currency, setCurrency] = useState((content.currency as string) ?? 'NT$')
  const [productDesc, setProductDesc] = useState((content.description as string) ?? '')
  const [productImg, setProductImg] = useState((content.imageUrl as string) ?? '')

  // Email
  const [placeholder, setPlaceholder] = useState((content.placeholder as string) ?? '輸入你的 Email')
  const [buttonText, setButtonText] = useState((content.buttonText as string) ?? '訂閱')
  const [webhookUrl, setWebhookUrl] = useState((content.webhookUrl as string) ?? '')

  // Video
  const [videoUrl, setVideoUrl] = useState((content.url as string) ?? (content.embedId as string) ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let newContent: Record<string, unknown> = {}

    switch (block.type) {
      case 'link':
        newContent = { url }
        break
      case 'banner':
        newContent = { imageUrl, ...(linkUrl ? { linkUrl } : {}), ...(alt ? { alt } : {}) }
        break
      case 'heading':
        newContent = { text, size }
        break
      case 'product':
        newContent = {
          price: parseFloat(price) || 0,
          currency,
          ...(productDesc ? { description: productDesc } : {}),
          ...(productImg ? { imageUrl: productImg } : {}),
        }
        break
      case 'email_form':
        newContent = { placeholder, buttonText, ...(webhookUrl ? { webhookUrl } : {}) }
        break
      case 'video':
        newContent = parseVideoInput(videoUrl)
        break
      default:
        newContent = content
    }

    onSave(block.id, block.type === 'heading' ? text : title, newContent)
    onClose()
  }

  const inputStyle = {
    width: '100%', padding: '11px 16px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 10,
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
  }
  const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--color-primary)')
  const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = 'var(--color-border)')

  const TYPE_LABELS: Record<BlockType, string> = {
    link: '連結按鈕', banner: '橫幅看板', video: '影片',
    email_form: 'Email 表單', product: '數位商品', heading: '標題文字', social: '社群連結',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%',
        maxWidth: 480, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div className="flex items-center justify-between" style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
            編輯{TYPE_LABELS[block.type]}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── LINK ── */}
          {block.type === 'link' && (
            <>
              <Field label="標題">
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="顯示名稱" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="連結網址">
                <input value={url} onChange={e => setUrl(e.target.value)} required
                  placeholder="https://..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>
          )}

          {/* ── BANNER ── */}
          {block.type === 'banner' && (
            <>
              <Field label="標題（選填）">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="橫幅標題" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="圖片網址">
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} required
                  placeholder="https://..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="點擊連結（選填）">
                <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="Alt 文字（選填）">
                <input value={alt} onChange={e => setAlt(e.target.value)}
                  placeholder="圖片替代文字" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>
          )}

          {/* ── HEADING ── */}
          {block.type === 'heading' && (
            <>
              <Field label="標題文字">
                <input value={text} onChange={e => setText(e.target.value)} required
                  placeholder="標題文字" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="文字大小">
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setSize(s)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{
                        background: size === s ? 'var(--color-primary)' : 'white',
                        color: size === s ? 'white' : 'var(--color-text-secondary)',
                        border: `1px solid ${size === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        cursor: 'pointer',
                      }}>
                      {{ sm: '小', md: '中', lg: '大' }[s]}
                    </button>
                  ))}
                </div>
              </Field>
            </>
          )}

          {/* ── PRODUCT ── */}
          {block.type === 'product' && (
            <>
              <Field label="商品名稱">
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="例：Notion 模板包" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="商品描述（選填）">
                <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)}
                  placeholder="簡短說明…" rows={2}
                  style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
                  onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="售價">
                <div className="flex gap-2">
                  <div className="relative" style={{ flexShrink: 0 }}>
                    <select value={currency} onChange={e => setCurrency(e.target.value)}
                      style={{ ...inputStyle, width: 'auto', paddingRight: 32, appearance: 'none', cursor: 'pointer' } as React.CSSProperties}
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
              </Field>
              <Field label="商品圖片網址（選填）">
                <input value={productImg} onChange={e => setProductImg(e.target.value)}
                  placeholder="https://..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>
          )}

          {/* ── EMAIL FORM ── */}
          {block.type === 'email_form' && (
            <>
              <Field label="輸入框 placeholder">
                <input value={placeholder} onChange={e => setPlaceholder(e.target.value)}
                  placeholder="輸入你的 Email" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="按鈕文字">
                <input value={buttonText} onChange={e => setButtonText(e.target.value)}
                  placeholder="訂閱" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="Webhook 網址（選填）">
                <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>
          )}

          {/* ── VIDEO ── */}
          {block.type === 'video' && (
            <>
              <Field label="標題（選填）">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="影片標題" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="YouTube / TikTok 網址">
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required
                  placeholder="https://youtube.com/watch?v=..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: -8 }}>
                支援 youtube.com/watch, youtu.be, tiktok.com 連結
              </p>
            </>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 font-semibold text-sm"
              style={{ border: '1px solid var(--color-border)', borderRadius: 10, background: 'white', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              取消
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center"
              style={{ borderRadius: 10, padding: '10px 20px', fontSize: 14 }}>
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

/** Parse a YouTube/TikTok URL into { platform, embedId, url } */
function parseVideoInput(input: string): Record<string, unknown> {
  const trimmed = input.trim()

  // YouTube: youtube.com/watch?v=XXX or youtu.be/XXX or youtube.com/embed/XXX
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) {
    return { platform: 'youtube', embedId: ytMatch[1], url: trimmed }
  }

  // TikTok: tiktok.com/@user/video/ID
  const ttMatch = trimmed.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (ttMatch) {
    return { platform: 'tiktok', embedId: ttMatch[1], url: trimmed }
  }

  // Fallback: treat as youtube embed ID
  return { platform: 'youtube', embedId: trimmed, url: trimmed }
}
