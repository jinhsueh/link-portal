'use client'

import { useState, useRef } from 'react'
import { BlockData, BlockType } from '@/types'
import { X, ChevronDown, Upload } from 'lucide-react'

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
  const [linkDesc, setLinkDesc] = useState((content.description as string) ?? '')

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

  // Upload
  const [uploading, setUploading] = useState(false)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setter(data.url)
    } catch { /* silent */ }
    setUploading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let newContent: Record<string, unknown> = {}

    switch (block.type) {
      case 'link':
        newContent = { url, ...(linkDesc ? { description: linkDesc } : {}) }
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
      case 'countdown':
        newContent = { targetDate, label: countdownLabel || undefined, expiredText: expiredText || undefined }
        break
      case 'faq':
        newContent = { items: faqItems.filter(i => i.question.trim()) }
        break
      case 'carousel':
        newContent = { images: carouselImages.filter(i => i.url.trim()) }
        break
      case 'map':
        newContent = { query: mapQuery, zoom: parseInt(mapZoom) || 15 }
        break
      case 'embed':
        newContent = { html: embedHtml, height: parseInt(embedHeight) || 300 }
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

  // Countdown
  const [targetDate, setTargetDate] = useState((content.targetDate as string) ?? '')
  const [countdownLabel, setCountdownLabel] = useState((content.label as string) ?? '')
  const [expiredText, setExpiredText] = useState((content.expiredText as string) ?? '')

  // FAQ
  const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>(
    (content.items as Array<{ question: string; answer: string }>) ?? [{ question: '', answer: '' }]
  )

  // Carousel
  const [carouselImages, setCarouselImages] = useState<Array<{ url: string; linkUrl?: string; alt?: string }>>(
    (content.images as Array<{ url: string; linkUrl?: string; alt?: string }>) ?? []
  )

  // Map
  const [mapQuery, setMapQuery] = useState((content.query as string) ?? '')
  const [mapZoom, setMapZoom] = useState(String(content.zoom ?? 15))

  // Embed
  const [embedHtml, setEmbedHtml] = useState((content.html as string) ?? '')
  const [embedHeight, setEmbedHeight] = useState(String(content.height ?? 300))

  const TYPE_LABELS: Record<BlockType, string> = {
    link: '連結按鈕', banner: '橫幅看板', video: '影片',
    email_form: 'Email 表單', product: '數位商品', heading: '標題文字', social: '社群連結',
    countdown: '倒數計時', faq: 'FAQ 問答', carousel: '圖片輪播', map: '地圖嵌入', embed: 'HTML 嵌入',
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
              <Field label="描述（選填）">
                <input value={linkDesc} onChange={e => setLinkDesc(e.target.value)}
                  placeholder="簡短描述文字" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
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
              <Field label="橫幅圖片">
                <div className="flex gap-2 items-center">
                  <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} required
                    placeholder="圖片網址或上傳" style={{ ...inputStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                  <label className="flex-shrink-0 px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', cursor: 'pointer', border: '1px solid var(--color-border)' }}>
                    <Upload size={14} />
                    {uploading ? '...' : '上傳'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleFileUpload(e, setImageUrl)} />
                  </label>
                </div>
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="mt-2 rounded-lg"
                    style={{ width: '100%', height: 80, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                )}
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
              <Field label="商品圖片（選填）">
                <div className="flex gap-2 items-center">
                  <input value={productImg} onChange={e => setProductImg(e.target.value)}
                    placeholder="圖片網址或上傳" style={{ ...inputStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                  <label className="flex-shrink-0 px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', cursor: 'pointer', border: '1px solid var(--color-border)' }}>
                    <Upload size={14} />
                    {uploading ? '...' : '上傳'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => handleFileUpload(e, setProductImg)} />
                  </label>
                </div>
                {productImg && (
                  <img src={productImg} alt="Preview" className="mt-2 rounded-lg"
                    style={{ width: '100%', height: 80, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                )}
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
              <Field label="YouTube / TikTok / Spotify 網址">
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required
                  placeholder="https://youtube.com/watch?v=..." style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', marginTop: -8 }}>
                支援 youtube.com, youtu.be, tiktok.com, open.spotify.com 連結
              </p>
            </>
          )}

          {/* ── COUNTDOWN ── */}
          {block.type === 'countdown' && (
            <>
              <Field label="標題">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="倒數標題" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="目標時間">
                <input type="datetime-local" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                  required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="倒數標籤（選填）">
                <input value={countdownLabel} onChange={e => setCountdownLabel(e.target.value)}
                  placeholder="即將開始" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="結束後顯示文字（選填）">
                <input value={expiredText} onChange={e => setExpiredText(e.target.value)}
                  placeholder="已結束" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>
          )}

          {/* ── FAQ ── */}
          {block.type === 'faq' && (
            <>
              <Field label="標題（選填）">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="常見問題" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              {faqItems.map((item, i) => (
                <div key={i} className="rounded-xl p-3" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>問題 {i + 1}</span>
                    {faqItems.length > 1 && (
                      <button type="button" onClick={() => setFaqItems(prev => prev.filter((_, j) => j !== i))}
                        className="text-xs" style={{ color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer' }}>刪除</button>
                    )}
                  </div>
                  <input value={item.question} onChange={e => setFaqItems(prev => prev.map((it, j) => j === i ? { ...it, question: e.target.value } : it))}
                    placeholder="問題" style={{ ...inputStyle, marginBottom: 8 }} onFocus={focusIn} onBlur={focusOut} />
                  <textarea value={item.answer} onChange={e => setFaqItems(prev => prev.map((it, j) => j === i ? { ...it, answer: e.target.value } : it))}
                    placeholder="答案" rows={2} style={{ ...inputStyle, resize: 'none' } as React.CSSProperties} onFocus={focusIn} onBlur={focusOut} />
                </div>
              ))}
              <button type="button" onClick={() => setFaqItems(prev => [...prev, { question: '', answer: '' }])}
                className="w-full py-2 text-sm font-semibold rounded-lg"
                style={{ border: '1px dashed var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                + 新增問答
              </button>
            </>
          )}

          {/* ── CAROUSEL ── */}
          {block.type === 'carousel' && (
            <>
              <Field label="標題（選填）">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="圖片輪播" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              {carouselImages.map((img, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input value={img.url} onChange={e => setCarouselImages(prev => prev.map((im, j) => j === i ? { ...im, url: e.target.value } : im))}
                      placeholder="圖片網址" style={{ ...inputStyle, marginBottom: 4 }} onFocus={focusIn} onBlur={focusOut} />
                    <input value={img.linkUrl ?? ''} onChange={e => setCarouselImages(prev => prev.map((im, j) => j === i ? { ...im, linkUrl: e.target.value } : im))}
                      placeholder="連結網址（選填）" style={{ ...inputStyle, fontSize: 12 }} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <button type="button" onClick={() => setCarouselImages(prev => prev.filter((_, j) => j !== i))}
                    className="mt-2 text-xs" style={{ color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setCarouselImages(prev => [...prev, { url: '' }])}
                className="w-full py-2 text-sm font-semibold rounded-lg"
                style={{ border: '1px dashed var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                + 新增圖片
              </button>
            </>
          )}

          {/* ── MAP ── */}
          {block.type === 'map' && (
            <>
              <Field label="標題（選填）">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="地點名稱" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="地點或地址">
                <input value={mapQuery} onChange={e => setMapQuery(e.target.value)}
                  required placeholder="台北 101" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="縮放等級">
                <input type="number" min="1" max="20" value={mapZoom} onChange={e => setMapZoom(e.target.value)}
                  style={{ ...inputStyle, width: 100 }} onFocus={focusIn} onBlur={focusOut} />
              </Field>
            </>
          )}

          {/* ── EMBED ── */}
          {block.type === 'embed' && (
            <>
              <Field label="標題（選填）">
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="嵌入內容" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="HTML / iframe 程式碼">
                <textarea value={embedHtml} onChange={e => setEmbedHtml(e.target.value)}
                  required placeholder='<iframe src="..." />' rows={4}
                  style={{ ...inputStyle, resize: 'none', fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties}
                  onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="高度 (px)">
                <input type="number" min="100" max="800" value={embedHeight} onChange={e => setEmbedHeight(e.target.value)}
                  style={{ ...inputStyle, width: 120 }} onFocus={focusIn} onBlur={focusOut} />
              </Field>
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

  // Spotify: open.spotify.com/track/XXX or /playlist/XXX or /album/XXX
  const spMatch = trimmed.match(/open\.spotify\.com\/(track|playlist|album|episode|show)\/([a-zA-Z0-9]+)/)
  if (spMatch) {
    return { platform: 'spotify', embedId: `${spMatch[1]}/${spMatch[2]}`, url: trimmed }
  }

  // Fallback: treat as youtube embed ID
  return { platform: 'youtube', embedId: trimmed, url: trimmed }
}
