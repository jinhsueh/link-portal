'use client'

import { useState, useMemo } from 'react'
import { BlockData, BlockType } from '@/types'
import { X, ChevronDown, Upload, Eye } from 'lucide-react'
import { POPULAR_TIMEZONES, detectBrowserTimezone, localToUtcIso, utcIsoToLocal } from '@/lib/calendar'
import { ImageCropperModal } from '@/components/ui/ImageCropperModal'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { toast } from '@/components/ui/Toast'

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
  const [linkHideIcon, setLinkHideIcon] = useState(Boolean(content.hideIcon))
  const [linkBgColor, setLinkBgColor] = useState((content.bgColor as string) ?? '')
  const [linkTextColor, setLinkTextColor] = useState((content.textColor as string) ?? '')

  // Banner
  const [imageUrl, setImageUrl] = useState((content.imageUrl as string) ?? '')
  const [linkUrl, setLinkUrl] = useState((content.linkUrl as string) ?? '')
  const [alt, setAlt] = useState((content.alt as string) ?? '')
  const [bannerCaption, setBannerCaption] = useState((content.caption as string) ?? '')

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
  const [videoDescription, setVideoDescription] = useState((content.description as string) ?? '')

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

  // Calendar event icon — goes through the cropper (1:1) before uploading,
  // so brand assets fit cleanly in the 52×52 tile without manual presizing.
  const [pendingCalIcon, setPendingCalIcon] = useState<File | null>(null)
  const handleCalIconPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingCalIcon(file)
    e.target.value = ''
  }
  const uploadCroppedCalIcon = async (cropped: File) => {
    setPendingCalIcon(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', cropped)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setCalIconUrl(data.url)
    } catch { /* silent */ }
    setUploading(false)
  }

  // Block-level content images (banner / product / carousel). All free-aspect
  // (3:1 default) since these are content shots, not square logos. The crop
  // step is optional for power users who want to control framing — they can
  // also paste a URL or upload without cropping.
  type BlockImageTarget =
    | { kind: 'banner'; file: File }
    | { kind: 'product'; file: File }
    | { kind: 'carousel'; index: number; file: File }
  const [pendingBlockImage, setPendingBlockImage] = useState<BlockImageTarget | null>(null)
  const uploadCroppedBlockImage = async (cropped: File) => {
    if (!pendingBlockImage) return
    const target = pendingBlockImage
    setPendingBlockImage(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', cropped)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (target.kind === 'banner') setImageUrl(data.url)
        else if (target.kind === 'product') setProductImg(data.url)
        else if (target.kind === 'carousel') {
          const idx = target.index
          setCarouselImages(prev => prev.map((im, j) => j === idx ? { ...im, url: data.url } : im))
        }
      }
    } catch { /* silent */ }
    setUploading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let newContent: Record<string, unknown> = {}

    switch (block.type) {
      case 'link':
        newContent = {
          url,
          ...(linkDesc ? { description: linkDesc } : {}),
          ...(linkHideIcon ? { hideIcon: true } : {}),
          ...(linkBgColor ? { bgColor: linkBgColor } : {}),
          ...(linkTextColor ? { textColor: linkTextColor } : {}),
        }
        break
      case 'banner':
        newContent = {
          imageUrl,
          ...(linkUrl ? { linkUrl } : {}),
          ...(alt ? { alt } : {}),
          ...(bannerCaption ? { caption: bannerCaption } : {}),
        }
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
      case 'video': {
        const parsed = parseVideoInput(videoUrl)
        newContent = { ...parsed, ...(videoDescription ? { description: videoDescription } : {}) }
        break
      }
      case 'countdown':
        newContent = { targetDate, label: countdownLabel || undefined, expiredText: expiredText || undefined }
        break
      case 'faq':
        newContent = { items: faqItems.filter(i => i.question.trim()) }
        break
      case 'carousel':
        newContent = {
          images: carouselImages.filter(i => i.url.trim()),
          ...(carouselCaption ? { caption: carouselCaption } : {}),
        }
        break
      case 'map':
        newContent = { query: mapQuery, zoom: parseInt(mapZoom) || 15 }
        break
      case 'embed':
        newContent = { html: embedHtml, height: parseInt(embedHeight) || 300 }
        break
      case 'calendar_event': {
        const startUtc = localToUtcIso(calStart, calTimezone)
        const endUtc = calEnd ? localToUtcIso(calEnd, calTimezone) : undefined
        newContent = {
          startDate: startUtc,
          ...(endUtc ? { endDate: endUtc } : {}),
          timezone: calTimezone,
          ...(calAllDay ? { allDay: true } : {}),
          ...(calLocation ? { location: calLocation } : {}),
          ...(calDescription ? { description: calDescription } : {}),
          ...(calUrl ? { url: calUrl } : {}),
          ...(calIconUrl ? { iconUrl: calIconUrl } : {}),
        }
        break
      }
      default:
        newContent = content
    }

    onSave(block.id, block.type === 'heading' ? text : title, newContent)
    toast.success('已儲存')
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
  const [carouselImages, setCarouselImages] = useState<Array<{ url: string; linkUrl?: string; alt?: string; caption?: string }>>(
    (content.images as Array<{ url: string; linkUrl?: string; alt?: string; caption?: string }>) ?? []
  )
  const [carouselCaption, setCarouselCaption] = useState((content.caption as string) ?? '')

  // Map
  const [mapQuery, setMapQuery] = useState((content.query as string) ?? '')
  const [mapZoom, setMapZoom] = useState(String(content.zoom ?? 15))

  // Embed
  const [embedHtml, setEmbedHtml] = useState((content.html as string) ?? '')
  const [embedHeight, setEmbedHeight] = useState(String(content.height ?? 300))

  // Calendar event
  const initialTz = (content.timezone as string) || detectBrowserTimezone()
  const [calTimezone, setCalTimezone] = useState(initialTz)
  const [calAllDay, setCalAllDay] = useState(Boolean(content.allDay))
  const [calStart, setCalStart] = useState(
    content.startDate ? utcIsoToLocal(content.startDate as string, initialTz) : ''
  )
  const [calEnd, setCalEnd] = useState(
    content.endDate ? utcIsoToLocal(content.endDate as string, initialTz) : ''
  )
  const [calLocation, setCalLocation] = useState((content.location as string) ?? '')
  const [calDescription, setCalDescription] = useState((content.description as string) ?? '')
  const [calUrl, setCalUrl] = useState((content.url as string) ?? '')
  const [calIconUrl, setCalIconUrl] = useState((content.iconUrl as string) ?? '')

  const TYPE_LABELS: Record<BlockType, string> = {
    link: '連結按鈕', banner: '橫幅看板', video: '影片',
    email_form: 'Email 表單', product: '數位商品', heading: '標題文字', social: '社群連結',
    countdown: '倒數計時', faq: 'FAQ 問答', carousel: '圖片輪播', map: '地圖嵌入', embed: 'HTML 嵌入',
    calendar_event: '加入日曆',
  }

  // ── Inline preview ──
  // Mirror the same content shape that handleSubmit would generate, so the
  // rendered preview matches what saves. Only compute for block types where
  // preview is genuinely useful — for static types (heading/email/etc) the
  // form fields ARE the preview.
  const previewBlock: BlockData | null = useMemo(() => {
    const baseTitle = block.type === 'heading' ? text : title
    let previewContent: Record<string, unknown> | null = null
    switch (block.type) {
      case 'link':
        previewContent = {
          url: url || '#',
          ...(linkDesc ? { description: linkDesc } : {}),
          ...(linkHideIcon ? { hideIcon: true } : {}),
          ...(linkBgColor ? { bgColor: linkBgColor } : {}),
          ...(linkTextColor ? { textColor: linkTextColor } : {}),
        }
        break
      case 'banner':
        if (imageUrl) previewContent = {
          imageUrl,
          ...(linkUrl ? { linkUrl } : {}),
          ...(alt ? { alt } : {}),
          ...(bannerCaption ? { caption: bannerCaption } : {}),
        }
        break
      case 'heading':
        previewContent = { text: text || '標題預覽', size }
        break
      case 'video':
        if (videoUrl) {
          previewContent = { ...parseVideoInput(videoUrl), ...(videoDescription ? { description: videoDescription } : {}) }
        }
        break
      case 'product':
        previewContent = {
          price: parseFloat(price) || 0,
          currency,
          ...(productDesc ? { description: productDesc } : {}),
          ...(productImg ? { imageUrl: productImg } : {}),
        }
        break
      case 'countdown':
        if (targetDate) previewContent = { targetDate: new Date(targetDate).toISOString(), label: countdownLabel || undefined }
        break
      case 'calendar_event':
        if (calStart) {
          try {
            previewContent = {
              startDate: localToUtcIso(calStart, calTimezone),
              ...(calEnd ? { endDate: localToUtcIso(calEnd, calTimezone) } : {}),
              timezone: calTimezone,
              ...(calAllDay ? { allDay: true } : {}),
              ...(calLocation ? { location: calLocation } : {}),
              ...(calDescription ? { description: calDescription } : {}),
              ...(calIconUrl ? { iconUrl: calIconUrl } : {}),
            }
          } catch { previewContent = null }
        }
        break
      case 'carousel':
        if (carouselImages.some(i => i.url)) {
          previewContent = {
            images: carouselImages.filter(i => i.url),
            ...(carouselCaption ? { caption: carouselCaption } : {}),
          }
        }
        break
    }
    if (!previewContent) return null
    return {
      id: block.id,
      type: block.type,
      title: baseTitle,
      content: previewContent as never,
      order: block.order,
      active: true,
      clicks: 0,
      views: 0,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    block.type, title, text, size, url, linkDesc, linkHideIcon, linkBgColor, linkTextColor,
    imageUrl, linkUrl, alt, bannerCaption,
    videoUrl, videoDescription,
    price, currency, productDesc, productImg,
    targetDate, countdownLabel,
    calStart, calEnd, calTimezone, calAllDay, calLocation, calDescription, calIconUrl,
    carouselImages, carouselCaption,
  ])

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

          {/* ── Live preview ──
              Renders the exact same component as the public profile would, so
              users see colour / icon / caption / description changes as they
              type, instead of needing to save+refresh to verify. */}
          {previewBlock && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
                <Eye size={11} />
                即時預覽
              </div>
              <div className="pointer-events-none select-none">
                <BlockRenderer block={previewBlock} btnStyle="outline" />
              </div>
            </div>
          )}

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

              {/* Customization — flat instead of hidden in <details> because
                  these are core decisions: many users want them and burying
                  hides the feature entirely. */}
              <div className="space-y-3 rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={linkHideIcon}
                    onChange={e => setLinkHideIcon(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    隱藏左側 icon
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      按鈕背景色
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={linkBgColor || '#FFFFFF'}
                        onChange={e => setLinkBgColor(e.target.value)}
                        style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }} />
                      <input value={linkBgColor} onChange={e => setLinkBgColor(e.target.value)}
                        placeholder="預設" style={{ ...inputStyle, padding: '8px 10px', fontSize: 12, flex: 1 }}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      文字色
                    </label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={linkTextColor || '#1A1A2E'}
                        onChange={e => setLinkTextColor(e.target.value)}
                        style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }} />
                      <input value={linkTextColor} onChange={e => setLinkTextColor(e.target.value)}
                        placeholder="預設" style={{ ...inputStyle, padding: '8px 10px', fontSize: 12, flex: 1 }}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                  </div>
                </div>
                {(linkBgColor || linkTextColor) && (
                  <button type="button"
                    onClick={() => { setLinkBgColor(''); setLinkTextColor('') }}
                    className="text-xs font-semibold"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 0 }}>
                    重設為主題預設色
                  </button>
                )}
              </div>
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
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) setPendingBlockImage({ kind: 'banner', file: f })
                        e.target.value = ''
                      }} />
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
              <Field label="說明文字（選填）">
                <textarea value={bannerCaption} onChange={e => setBannerCaption(e.target.value)}
                  placeholder="會顯示在公開頁的圖片下方,支援換行" rows={2}
                  style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
                  onFocus={focusIn} onBlur={focusOut} />
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
                      onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) setPendingBlockImage({ kind: 'product', file: f })
                        e.target.value = ''
                      }} />
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
              <Field label="說明文字（選填）">
                <textarea value={videoDescription} onChange={e => setVideoDescription(e.target.value)}
                  placeholder="顯示在標題下方的小字說明" rows={2}
                  style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
                  onFocus={focusIn} onBlur={focusOut} />
              </Field>
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
              <Field label="說明文字（選填）">
                <textarea value={carouselCaption} onChange={e => setCarouselCaption(e.target.value)}
                  placeholder="顯示在輪播下方的說明,支援換行" rows={2}
                  style={{ ...inputStyle, resize: 'none' } as React.CSSProperties}
                  onFocus={focusIn} onBlur={focusOut} />
              </Field>
              {carouselImages.map((img, i) => (
                <div key={i} className="rounded-xl p-3 space-y-2" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>#{i + 1}</span>
                    <div className="flex gap-2 flex-1">
                      <input value={img.url} onChange={e => setCarouselImages(prev => prev.map((im, j) => j === i ? { ...im, url: e.target.value } : im))}
                        placeholder="圖片網址" style={{ ...inputStyle, flex: 1, padding: '8px 12px', fontSize: 13 }} onFocus={focusIn} onBlur={focusOut} />
                      <label className="flex-shrink-0 px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1"
                        style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', cursor: 'pointer', border: '1px solid var(--color-border)' }}>
                        <Upload size={12} />
                        {uploading ? '...' : '上傳'}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0]
                            if (f) setPendingBlockImage({ kind: 'carousel', index: i, file: f })
                            e.target.value = ''
                          }} />
                      </label>
                    </div>
                    {carouselImages.length > 1 && (
                      <button type="button" onClick={() => setCarouselImages(prev => prev.filter((_, j) => j !== i))}
                        className="text-xs" style={{ color: '#E53E3E', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                  <input value={img.linkUrl ?? ''} onChange={e => setCarouselImages(prev => prev.map((im, j) => j === i ? { ...im, linkUrl: e.target.value } : im))}
                    placeholder="點擊連結（選填）" style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }} onFocus={focusIn} onBlur={focusOut} />
                  <input value={img.caption ?? ''} onChange={e => setCarouselImages(prev => prev.map((im, j) => j === i ? { ...im, caption: e.target.value } : im))}
                    placeholder="此張圖片說明（選填,優先於整體說明）" style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }} onFocus={focusIn} onBlur={focusOut} />
                  {img.url && (
                    <img src={img.url} alt={`Preview ${i + 1}`} className="rounded-lg"
                      style={{ width: '100%', height: 80, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                  )}
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

          {/* ── CALENDAR EVENT ── */}
          {block.type === 'calendar_event' && (
            <>
              <Field label="活動名稱">
                <input value={title} onChange={e => setTitle(e.target.value)} required
                  placeholder="例：春季快閃店開張" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <div className="flex items-center gap-2" style={{ padding: '0 2px' }}>
                <input type="checkbox" id="edit-cal-allday" checked={calAllDay}
                  onChange={e => setCalAllDay(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--color-primary)' }} />
                <label htmlFor="edit-cal-allday" className="text-sm" style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  全天事件
                </label>
              </div>
              <Field label="開始時間">
                <input type={calAllDay ? 'date' : 'datetime-local'} value={calStart}
                  onChange={e => setCalStart(e.target.value)} required
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="結束時間（選填，預設 +1 小時）">
                <input type={calAllDay ? 'date' : 'datetime-local'} value={calEnd}
                  onChange={e => setCalEnd(e.target.value)}
                  style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="時區">
                <div className="relative">
                  <select value={calTimezone} onChange={e => setCalTimezone(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: 36, cursor: 'pointer' } as React.CSSProperties}
                    onFocus={focusIn} onBlur={focusOut}>
                    {!POPULAR_TIMEZONES.some(t => t.id === calTimezone) && (
                      <option value={calTimezone}>{calTimezone}</option>
                    )}
                    {POPULAR_TIMEZONES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
                </div>
              </Field>
              <Field label="地點（選填）">
                <input value={calLocation} onChange={e => setCalLocation(e.target.value)}
                  placeholder="台北 101、IG Live、Zoom 連結…" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="描述（選填）">
                <textarea value={calDescription} onChange={e => setCalDescription(e.target.value)}
                  placeholder="活動重點、注意事項…" rows={2}
                  style={{ ...inputStyle, resize: 'none' } as React.CSSProperties} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="活動連結（選填）">
                <input value={calUrl} onChange={e => setCalUrl(e.target.value)}
                  placeholder="https://…" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
              </Field>
              <Field label="活動圖示（選填,取代預設日曆 icon）">
                <div className="flex gap-2 items-center">
                  <input value={calIconUrl} onChange={e => setCalIconUrl(e.target.value)}
                    placeholder="圖片網址或上傳" style={{ ...inputStyle, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                  <label className="flex-shrink-0 px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', cursor: 'pointer', border: '1px solid var(--color-border)' }}>
                    <Upload size={14} />
                    {uploading ? '...' : '上傳'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={handleCalIconPick} />
                  </label>
                </div>
                {calIconUrl && (
                  <img src={calIconUrl} alt="Icon preview" className="mt-2 rounded-xl"
                    style={{ width: 52, height: 52, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
                )}
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  上傳後會跳出裁切視窗(1:1 正方形)
                </p>
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

      {/* Calendar event icon crop modal — 1:1 because the public renderer uses
          a 52×52 square tile. Opens when a file is picked, closes on confirm/cancel. */}
      {pendingCalIcon && (
        <ImageCropperModal
          file={pendingCalIcon}
          aspect={1}
          cropShape="rect"
          title="裁切活動圖示"
          onComplete={uploadCroppedCalIcon}
          onCancel={() => setPendingCalIcon(null)}
        />
      )}

      {/* Block content images — banner / product / carousel slides. Free-aspect
          (3:1 default for banner, 1:1 for product, 16:9 for carousel) so users
          can frame content shots however they like. */}
      {pendingBlockImage && (
        <ImageCropperModal
          file={pendingBlockImage.file}
          aspect={
            pendingBlockImage.kind === 'banner' ? 3
            : pendingBlockImage.kind === 'product' ? 1
            : 16 / 9
          }
          cropShape="rect"
          title={
            pendingBlockImage.kind === 'banner' ? '裁切橫幅圖片'
            : pendingBlockImage.kind === 'product' ? '裁切商品圖片'
            : `裁切第 ${pendingBlockImage.index + 1} 張圖片`
          }
          onComplete={uploadCroppedBlockImage}
          onCancel={() => setPendingBlockImage(null)}
        />
      )}
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
