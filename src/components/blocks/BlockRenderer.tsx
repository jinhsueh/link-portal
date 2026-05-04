'use client'

import { BlockData, CalendarEventContent, LinkContent, BannerContent, CarouselContent, VideoContent } from '@/types'
import { ChevronRight, ShoppingBag, Loader2, CalendarPlus, MapPin as MapPinIcon, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { buildGoogleCalendarUrl, downloadIcs, formatEventDisplay } from '@/lib/calendar'


function ensureUrl(url: string): string {
  if (!url) return url
  if (/^https?:\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#') || url.startsWith('/')) return url
  return `https://${url}`
}

function trackClick(blockId: string, pageId?: string) {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'click', blockId, pageId: pageId ?? '',
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      utmSource: params?.get('utm_source') || undefined,
      utmMedium: params?.get('utm_medium') || undefined,
    }),
  }).catch(() => {})
  // Subtle haptic confirmation on supported phones — feels premium without
  // being intrusive. Vibrate is a no-op on desktop / unsupported browsers.
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(8) } catch { /* silent */ }
  }
}

function LinkBlock({ block, pageId, btnStyle = 'outline' }: { block: BlockData; pageId?: string; btnStyle?: string }) {
  const content = block.content as LinkContent
  const customBg = content.bgColor
  const customText = content.textColor
  const hasCustomBg = !!customBg

  const [favicon, setFavicon] = useState<string | null>(() => {
    if (content.hideIcon) return null
    if (content.thumbnail) return content.thumbnail
    if (content.url) {
      try {
        const domain = new URL(content.url).hostname
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      } catch { /* invalid url */ }
    }
    return null
  })

  // Resolve text color: custom override → filled style white → theme text
  const resolvedTextColor = customText
    ?? (btnStyle === 'filled' || hasCustomBg ? '#ffffff' : 'var(--theme-text, var(--color-text-primary))')
  const resolvedSecondaryColor = customText
    ?? (btnStyle === 'filled' || hasCustomBg ? 'rgba(255,255,255,0.8)' : 'var(--theme-text-secondary, var(--color-text-secondary))')
  const resolvedChevronColor = customText
    ?? (btnStyle === 'filled' || hasCustomBg ? 'rgba(255,255,255,0.6)' : 'var(--theme-text-muted, var(--color-text-muted))')

  return (
    <a href={ensureUrl(content.url)} target="_blank" rel="noopener noreferrer"
      onClick={() => trackClick(block.id, pageId)}
      className="flex items-center gap-3 w-full transition-all group link-block"
      style={{
        padding: '16px 20px',
        background: customBg
          ?? (btnStyle === 'filled' ? 'var(--theme-primary, var(--color-primary))' : 'var(--theme-card-bg, white)'),
        color: resolvedTextColor,
        border: (btnStyle === 'filled' || hasCustomBg) ? 'none' : `1px solid var(--theme-border, var(--color-border))`,
        borderRadius: 'var(--theme-radius, 12px)',
        textDecoration: 'none',
        boxShadow: (btnStyle === 'filled' || hasCustomBg) ? 'none' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        if (btnStyle !== 'filled' && !hasCustomBg) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-primary, var(--color-primary))'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
        } else {
          (e.currentTarget as HTMLElement).style.opacity = '0.9'
        }
      }}
      onMouseLeave={e => {
        if (btnStyle !== 'filled' && !hasCustomBg) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-border, var(--color-border))'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
        } else {
          (e.currentTarget as HTMLElement).style.opacity = '1'
        }
      }}>
      {!content.hideIcon && favicon && (
        <img src={favicon} alt="" width={20} height={20} className="flex-shrink-0 rounded"
          style={{ objectFit: 'contain' }}
          onError={() => setFavicon(null)} />
      )}
      {/* When the icon is hidden, center the text — leaves a stable visual without
          the asymmetric "icon on left, text in middle" gap. The chevron also goes
          away to let the title own the entire width. */}
      <div className={`flex-1 min-w-0 ${content.hideIcon ? 'text-center' : ''}`}>
        <span className="font-semibold text-sm block truncate" style={{ color: resolvedTextColor }}>
          {block.title}
        </span>
        {content.description && (
          <span className="text-xs block truncate mt-0.5" style={{ color: resolvedSecondaryColor }}>
            {content.description}
          </span>
        )}
      </div>
      {!content.hideIcon && (
        <ChevronRight size={16} className="flex-shrink-0" style={{ color: resolvedChevronColor }} />
      )}
    </a>
  )
}

function BannerBlock({ block }: { block: BlockData }) {
  const content = block.content as BannerContent
  const hasText = !!(block.title || content.caption)

  // If there's no caption/title, render the bare image (legacy behavior — keeps
  // pixel-perfect look for banners that intentionally only have an image).
  if (!hasText) {
    const bareImg = (
      <img src={content.imageUrl} alt={content.alt ?? block.title ?? ''}
        className="w-full object-cover" style={{ borderRadius: 12 }} />
    )
    return content.linkUrl
      ? <a href={ensureUrl(content.linkUrl)} target="_blank" rel="noopener noreferrer" className="block">{bareImg}</a>
      : <div>{bareImg}</div>
  }

  // With text: image-on-top card with title + caption below.
  const card = (
    <div className="w-full overflow-hidden" style={{
      background: 'var(--theme-card-bg, white)',
      border: '1px solid var(--theme-border, var(--color-border))',
      borderRadius: 'var(--theme-radius, 12px)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <img src={content.imageUrl} alt={content.alt ?? block.title ?? ''}
        className="w-full object-cover" style={{ display: 'block' }} />
      <div style={{ padding: '14px 18px' }}>
        {block.title && (
          <p className="font-bold text-sm" style={{ color: 'var(--theme-text, var(--color-text-primary))' }}>
            {block.title}
          </p>
        )}
        {content.caption && (
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary, var(--color-text-secondary))', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {content.caption}
          </p>
        )}
      </div>
    </div>
  )
  return content.linkUrl
    ? <a href={ensureUrl(content.linkUrl)} target="_blank" rel="noopener noreferrer" className="block w-full" style={{ textDecoration: 'none' }}>{card}</a>
    : <div className="w-full">{card}</div>
}

function HeadingBlock({ block }: { block: BlockData }) {
  const content = block.content as { text: string; size?: string }
  const size = content.size === 'lg' ? 18 : content.size === 'sm' ? 13 : 15
  return (
    <p className="text-center font-semibold px-2"
      style={{ color: 'var(--color-text-secondary)', fontSize: size }}>
      {content.text ?? block.title}
    </p>
  )
}

function ProductBlock({ block, pageId }: { block: BlockData; pageId?: string }) {
  const content = block.content as {
    price?: number; currency?: string; description?: string; imageUrl?: string
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const displayPrice = content.price ?? 0
  const displayCurrency = content.currency ?? 'NT$'

  const handleBuy = async () => {
    setLoading(true)
    setError('')
    trackClick(block.id, pageId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId: block.id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? '結帳失敗，請稍後再試'); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError('網路錯誤，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <div className="w-full" style={{
      background: 'white', border: '1px solid var(--color-border)',
      borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Product image */}
      {content.imageUrl && (
        <img src={content.imageUrl} alt={block.title ?? ''}
          className="w-full object-cover" style={{ maxHeight: 200 }} />
      )}

      <div style={{ padding: '16px 20px' }}>
        {/* Title + price row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{block.title}</p>
            {content.description && (
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {content.description}
              </p>
            )}
          </div>
          <span className="font-bold text-base flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
            {displayCurrency}{displayPrice.toLocaleString()}
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs mt-2" style={{ color: '#E53E3E' }}>{error}</p>
        )}

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={loading || displayPrice <= 0}
          className="btn-primary w-full justify-center mt-4"
          style={{ fontSize: 14, padding: '11px 20px', opacity: (loading || displayPrice <= 0) ? 0.7 : 1 }}>
          {loading
            ? <><Loader2 size={15} className="animate-spin" />處理中…</>
            : <><ShoppingBag size={15} />立即購買</>}
        </button>

        {displayPrice <= 0 && (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            商品尚未設定價格
          </p>
        )}
      </div>
    </div>
  )
}

function VideoBlock({ block }: { block: BlockData }) {
  const content = block.content as VideoContent & { platform?: string }
  const platform = content.platform ?? 'youtube'
  const embedId = content.embedId ?? ''

  // Shared header: title (bold sm) + description (xs muted) — separate sizes
  // so the heading no longer dominates the embed.
  const renderHeader = () => (block.title || content.description) ? (
    <div className="px-3 py-2.5" style={{
      background: 'var(--theme-card-bg, white)',
      borderBottom: '1px solid var(--theme-border, var(--color-border))',
    }}>
      {block.title && (
        <p className="text-sm font-bold leading-snug" style={{ color: 'var(--theme-text, var(--color-text-primary))' }}>
          {block.title}
        </p>
      )}
      {content.description && (
        <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary, var(--color-text-secondary))', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
          {content.description}
        </p>
      )}
    </div>
  ) : null

  if (platform === 'youtube' && embedId) {
    return (
      <div className="w-full" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {renderHeader()}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${embedId}`}
            title={block.title ?? 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    )
  }

  if (platform === 'tiktok' && embedId) {
    return (
      <div className="w-full" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {renderHeader()}
        <div style={{ position: 'relative', paddingBottom: '177%', height: 0 }}>
          <iframe
            src={`https://www.tiktok.com/embed/v2/${embedId}`}
            title={block.title ?? 'TikTok video'}
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    )
  }

  if (platform === 'spotify' && embedId) {
    // embedId is the full path like "track/xxx" or "playlist/xxx"
    return (
      <div className="w-full" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {renderHeader()}
        <iframe
          src={`https://open.spotify.com/embed/${embedId}`}
          title={block.title ?? 'Spotify'}
          allow="encrypted-media"
          style={{ width: '100%', height: embedId.startsWith('track') ? 152 : 352, border: 'none' }}
        />
      </div>
    )
  }

  // Fallback: link to original URL
  return (
    <a href={ensureUrl(content.url ?? '#')} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between w-full"
      style={{ padding: '16px 20px', background: 'white', border: '1px solid var(--color-border)', borderRadius: 12, textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}>
      <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
        🎬 {block.title ?? '觀看影片'}
      </span>
      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
    </a>
  )
}

function EmailFormBlock({ block, pageId }: { block: BlockData; pageId?: string }) {
  const content = block.content as { placeholder?: string; buttonText?: string; webhookUrl?: string }
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Store in DB
    fetch('/api/subscribers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, blockId: block.id, pageId: pageId ?? '' }),
    }).catch(() => {})
    // Also fire webhook if configured
    if (content.webhookUrl) {
      fetch(content.webhookUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {})
    }
    trackClick(block.id, pageId)
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="w-full text-center px-5 py-4 font-semibold text-sm rounded-xl"
      style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #C3D9FF' }}>
      ✓ 已成功訂閱！
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="w-full flex gap-2">
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder={content.placeholder ?? '輸入你的 Email'}
        className="flex-1 text-sm px-4 py-3 focus:outline-none"
        style={{ border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-primary)' }} />
      <button type="submit" className="btn-primary text-sm" style={{ padding: '10px 20px', borderRadius: 12 }}>
        {content.buttonText ?? '訂閱'}
      </button>
    </form>
  )
}

function CountdownBlock({ block }: { block: BlockData }) {
  const content = block.content as { targetDate: string; label?: string; expiredText?: string }
  const [remaining, setRemaining] = useState('')
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const update = () => {
      const target = new Date(content.targetDate).getTime()
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) { setExpired(true); setRemaining(content.expiredText ?? '已結束'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${d > 0 ? d + '天 ' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full text-center" style={{
      padding: '24px 20px', background: 'var(--theme-card-bg, white)',
      border: '1px solid var(--theme-border, var(--color-border))', borderRadius: 'var(--theme-radius, 12px)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {(block.title || content.label) && (
        <p className="font-semibold text-sm mb-2" style={{ color: 'var(--theme-text, var(--color-text-primary))' }}>
          {block.title || content.label}
        </p>
      )}
      <p className="font-extrabold text-3xl tabular-nums" style={{
        color: expired ? 'var(--theme-text-muted, var(--color-text-muted))' : 'var(--theme-primary, var(--color-primary))',
        fontFamily: 'var(--font-display)',
      }}>
        {remaining}
      </p>
    </div>
  )
}

function FaqBlock({ block }: { block: BlockData }) {
  const content = block.content as { items: Array<{ question: string; answer: string }> }
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="w-full" style={{
      border: '1px solid var(--theme-border, var(--color-border))', borderRadius: 'var(--theme-radius, 12px)',
      overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
    }}>
      {block.title && (
        <p className="font-semibold text-sm px-4 py-3" style={{
          background: 'var(--theme-card-bg, white)', color: 'var(--theme-text, var(--color-text-primary))',
          borderBottom: '1px solid var(--theme-border, var(--color-border))',
        }}>{block.title}</p>
      )}
      {(content.items ?? []).map((item, i) => (
        <div key={i} style={{ borderBottom: i < content.items.length - 1 ? '1px solid var(--theme-border, var(--color-border))' : 'none' }}>
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between text-left text-sm font-semibold"
            style={{ padding: '14px 16px', background: 'var(--theme-card-bg, white)', border: 'none', cursor: 'pointer', color: 'var(--theme-text, var(--color-text-primary))' }}>
            <span>{item.question}</span>
            <span style={{ transition: 'transform 0.2s', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)', color: 'var(--theme-text-muted, var(--color-text-muted))' }}>▾</span>
          </button>
          {openIndex === i && (
            <div className="text-sm" style={{ padding: '0 16px 14px', color: 'var(--theme-text-secondary, var(--color-text-secondary))', lineHeight: 1.7 }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function CarouselBlock({ block }: { block: BlockData }) {
  const content = block.content as CarouselContent
  const [current, setCurrent] = useState(0)
  const images = content.images ?? []
  if (images.length === 0) return null

  const goTo = (i: number) => setCurrent((i + images.length) % images.length)
  const img = images[current]
  // Resolved caption for the *current* slide — per-image overrides the carousel-
  // level caption, falling back to the carousel default if a slide doesn't have
  // its own. This is what makes per-slide narratives possible.
  const activeCaption = img.caption || content.caption
  const hasText = !!(block.title || activeCaption)

  const carouselInner = (
    <div className="relative w-full" style={{
      borderRadius: hasText ? 0 : 'var(--theme-radius, 12px)',
      overflow: 'hidden',
      boxShadow: hasText ? 'none' : 'var(--shadow-sm)',
    }}>
      <img src={img.url} alt={img.alt ?? ''} className="w-full object-cover" style={{ maxHeight: 280, display: 'block' }} />
      {images.length > 1 && (
        <>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(current - 1) }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>‹</button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(current + 1) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
                className="w-2 h-2 rounded-full" style={{ background: i === current ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  )

  // Wrap in card with title/caption when either exists.
  const inner = hasText ? (
    <div className="w-full overflow-hidden" style={{
      background: 'var(--theme-card-bg, white)',
      border: '1px solid var(--theme-border, var(--color-border))',
      borderRadius: 'var(--theme-radius, 12px)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {carouselInner}
      <div style={{ padding: '14px 18px' }}>
        {block.title && (
          <p className="font-bold text-sm" style={{ color: 'var(--theme-text, var(--color-text-primary))' }}>
            {block.title}
          </p>
        )}
        {activeCaption && (
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary, var(--color-text-secondary))', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {activeCaption}
          </p>
        )}
      </div>
    </div>
  ) : carouselInner

  return img.linkUrl
    ? <a href={ensureUrl(img.linkUrl)} target="_blank" rel="noopener noreferrer" className="block w-full" style={{ textDecoration: 'none' }}>{inner}</a>
    : <div className="w-full">{inner}</div>
}

function MapBlock({ block }: { block: BlockData }) {
  const content = block.content as { query: string; zoom?: number }
  const q = encodeURIComponent(content.query ?? '')
  return (
    <div className="w-full" style={{ borderRadius: 'var(--theme-radius, 12px)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {block.title && (
        <p className="text-sm font-semibold px-3 py-2" style={{
          background: 'var(--theme-card-bg, white)', color: 'var(--theme-text, var(--color-text-primary))',
          borderBottom: '1px solid var(--theme-border, var(--color-border))',
        }}>{block.title}</p>
      )}
      <iframe
        src={`https://maps.google.com/maps?q=${q}&z=${content.zoom ?? 15}&output=embed`}
        title={block.title ?? 'Map'}
        style={{ width: '100%', height: 200, border: 'none' }}
        loading="lazy"
      />
    </div>
  )
}

function EmbedBlock({ block }: { block: BlockData }) {
  const content = block.content as { html: string; height?: number }
  return (
    <div className="w-full" style={{ borderRadius: 'var(--theme-radius, 12px)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {block.title && (
        <p className="text-sm font-semibold px-3 py-2" style={{
          background: 'var(--theme-card-bg, white)', color: 'var(--theme-text, var(--color-text-primary))',
          borderBottom: '1px solid var(--theme-border, var(--color-border))',
        }}>{block.title}</p>
      )}
      <div
        style={{ height: content.height ?? 300 }}
        dangerouslySetInnerHTML={{ __html: sanitizeEmbed(content.html ?? '') }}
      />
    </div>
  )
}

/** Only allow iframe tags with https:// src to prevent XSS */
function sanitizeEmbed(html: string): string {
  const match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i)
    || html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*\/>/i)
  if (match) {
    const src = match[1]
    if (!src.startsWith('https://')) return ''
    return `<iframe src="${encodeURI(src)}" style="width:100%;height:100%;border:none" loading="lazy" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`
  }
  // If plain URL provided, only allow https://
  if (html.startsWith('https://')) {
    return `<iframe src="${encodeURI(html)}" style="width:100%;height:100%;border:none" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`
  }
  return ''
}

function CalendarEventBlock({ block, pageId }: { block: BlockData; pageId?: string }) {
  const content = block.content as CalendarEventContent
  if (!content?.startDate || !content?.timezone) return null

  const startText = formatEventDisplay(content.startDate, content.timezone, content.allDay)
  const endText = content.endDate ? formatEventDisplay(content.endDate, content.timezone, content.allDay) : null
  const sameDay = content.endDate
    ? content.startDate.slice(0, 10) === content.endDate.slice(0, 10)
    : true

  const handleGoogle = () => {
    trackClick(block.id, pageId)
    const url = buildGoogleCalendarUrl(content, block.title ?? undefined)
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer')
  }
  const handleIcs = () => {
    trackClick(block.id, pageId)
    downloadIcs(content, block.title ?? undefined)
  }

  return (
    <div className="w-full" style={{
      background: 'var(--theme-card-bg, white)',
      border: '1px solid var(--theme-border, var(--color-border))',
      borderRadius: 'var(--theme-radius, 12px)',
      boxShadow: 'var(--shadow-sm)',
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div className="flex items-start gap-3">
        {content.iconUrl ? (
          <img src={content.iconUrl} alt={content.eventTitle ?? block.title ?? ''}
            className="flex-shrink-0 object-cover"
            style={{ width: 52, height: 52, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }} />
        ) : (
          <div className="flex-shrink-0 rounded-xl flex flex-col items-center justify-center font-bold"
            style={{
              width: 52, height: 52,
              background: 'var(--theme-primary, var(--color-primary))',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}>
            <CalendarPlus size={22} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--theme-text, var(--color-text-primary))' }}>
            {content.eventTitle || block.title || 'Event'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary, var(--color-text-secondary))' }}>
            {startText}
            {endText && !sameDay && ` → ${endText}`}
          </p>
          {content.location && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--theme-text-muted, var(--color-text-muted))' }}>
              <MapPinIcon size={11} />{content.location}
            </p>
          )}
        </div>
      </div>

      {content.description && (
        <p className="text-xs" style={{ color: 'var(--theme-text-secondary, var(--color-text-secondary))', lineHeight: 1.6 }}>
          {content.description}
        </p>
      )}

      <div className="flex gap-2">
        <button onClick={handleGoogle}
          className="btn-primary flex-1 justify-center"
          style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
          <CalendarPlus size={14} />
          加入 Google 日曆
        </button>
        <button onClick={handleIcs}
          className="flex-shrink-0 flex items-center gap-1.5 justify-center font-semibold"
          style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13,
            border: '1px solid var(--theme-border, var(--color-border))',
            background: 'var(--theme-card-bg, white)',
            color: 'var(--theme-text, var(--color-text-primary))',
            cursor: 'pointer',
          }}
          title="下載 .ics 給 Apple / Outlook">
          <Download size={14} />
          .ics
        </button>
      </div>
    </div>
  )
}

export function BlockRenderer({ block, pageId, btnStyle }: { block: BlockData; pageId?: string; btnStyle?: string }) {
  if (!block.active) return null
  switch (block.type) {
    case 'link': return <LinkBlock block={block} pageId={pageId} btnStyle={btnStyle} />
    case 'banner': return <BannerBlock block={block} />
    case 'heading': return <HeadingBlock block={block} />
    case 'product': return <ProductBlock block={block} pageId={pageId} />
    case 'video': return <VideoBlock block={block} />
    case 'email_form': return <EmailFormBlock block={block} pageId={pageId} />
    case 'countdown': return <CountdownBlock block={block} />
    case 'faq': return <FaqBlock block={block} />
    case 'carousel': return <CarouselBlock block={block} />
    case 'map': return <MapBlock block={block} />
    case 'embed': return <EmbedBlock block={block} />
    case 'calendar_event': return <CalendarEventBlock block={block} pageId={pageId} />
    default: return null
  }
}
