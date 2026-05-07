'use client'

import { BlockData, CalendarEventContent, LinkContent, BannerContent, CarouselContent, VideoContent, ImageOverlayPosition, FeatureCardContent } from '@/types'
import { ChevronRight, ShoppingBag, Loader2, CalendarPlus, MapPin as MapPinIcon, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { buildGoogleCalendarUrl, downloadIcs, formatEventDisplay } from '@/lib/calendar'

/**
 * Compute styles for text overlaid on an image (banner / carousel slide /
 * image-grid cell). Returns the wrapper position styles + the gradient.
 * Centralised so all three callers stay visually consistent — same gradient
 * stops, same paddings, same horizontal alignment per position.
 */
function overlayTextStyles(position: ImageOverlayPosition = 'bottom-left'): {
  wrapper: React.CSSProperties
  gradient: React.CSSProperties
  text: React.CSSProperties
} {
  // Vertical anchor + alignment derive from the chosen preset.
  const isBottom = position !== 'center'
  const align: React.CSSProperties['textAlign'] = position === 'bottom-center'
    ? 'center' : position === 'center' ? 'center' : 'left'
  const justify: React.CSSProperties['justifyContent'] = position === 'bottom-center'
    ? 'center' : position === 'center' ? 'center' : 'flex-start'

  return {
    wrapper: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: position === 'center' ? 'center' : 'flex-end',
      padding: position === 'center' ? '20px' : '18px 20px',
      pointerEvents: 'none', // gradient + text shouldn't block image click
    },
    gradient: {
      position: 'absolute',
      inset: 0,
      // Bottom-anchored gradient covers ~55% of image; centre uses an even
      // dimming so the text sits readable on top of any photo.
      background: position === 'center'
        ? 'linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.5) 100%)'
        : 'linear-gradient(to bottom, transparent 0%, transparent 45%, rgba(0,0,0,0.65) 100%)',
      pointerEvents: 'none',
    },
    text: {
      position: 'relative',  // sit above the gradient
      color: 'white',
      textAlign: align,
      display: 'flex',
      flexDirection: 'column',
      alignItems: justify === 'center' ? 'center' : 'flex-start',
      // Subtle shadow so light-grey backgrounds don't wash out white text.
      textShadow: '0 1px 4px rgba(0,0,0,0.45)',
    },
  }
}

/** Style snippet that applies the theme's corner geometry. The clip-path
 *  variable is set by themeToCSS — falls back to 'none' on legacy themes
 *  so the visual is unchanged. We always emit both so a theme that flips
 *  from cut → rounded picks up cleanly. */
const themeShape: React.CSSProperties = {
  borderRadius: 'var(--theme-radius, 12px)',
  clipPath: 'var(--theme-clip-path, none)',
}


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
  const customIcon = content.iconUrl
  const customBorderColor = content.borderColor
  const customBorderWidth = content.borderWidth
  const titleSize = content.titleSize ?? 14
  // Alignment when icon is hidden — customer feedback wanted left/center/right
  // explicit instead of a hard-coded centre. With icon visible, the icon
  // anchors the visual to the left so alignment doesn't apply.
  const titleAlign = content.titleAlign ?? (content.hideIcon ? 'center' : 'left')
  const animation = content.animation ?? 'none'

  const [favicon, setFavicon] = useState<string | null>(() => {
    if (content.hideIcon) return null
    if (customIcon) return customIcon
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

  // Border resolution. Custom width/color override theme defaults. For filled
  // buttons we still respect a custom border if explicitly set.
  const borderWidth = customBorderWidth ?? ((btnStyle === 'filled' || hasCustomBg) ? 0 : 1)
  const borderColor = customBorderColor
    ?? ((btnStyle === 'filled' || hasCustomBg) ? 'transparent' : 'var(--theme-border, var(--color-border))')
  const hoverBorderColor = customBorderColor ?? 'var(--theme-primary, var(--color-primary))'

  return (
    <a href={ensureUrl(content.url)} target="_blank" rel="noopener noreferrer"
      onClick={() => trackClick(block.id, pageId)}
      className={`flex items-center gap-3 w-full transition-all group link-block link-anim-${animation}`}
      style={{
        padding: '16px 20px',
        background: customBg
          ?? (btnStyle === 'filled' ? 'var(--theme-primary, var(--color-primary))' : 'var(--theme-card-bg, white)'),
        color: resolvedTextColor,
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
        ...themeShape,
        textDecoration: 'none',
        boxShadow: (btnStyle === 'filled' || hasCustomBg) ? 'none' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        if (borderWidth > 0 && !customBorderColor && btnStyle !== 'filled' && !hasCustomBg) {
          el.style.borderColor = hoverBorderColor
          el.style.boxShadow = 'var(--shadow-md)'
        } else if (btnStyle === 'filled' || hasCustomBg) {
          el.style.opacity = '0.9'
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        if (borderWidth > 0 && !customBorderColor && btnStyle !== 'filled' && !hasCustomBg) {
          el.style.borderColor = borderColor
          el.style.boxShadow = 'var(--shadow-sm)'
        } else if (btnStyle === 'filled' || hasCustomBg) {
          el.style.opacity = '1'
        }
      }}>
      {!content.hideIcon && favicon && (
        <img src={favicon} alt="" width={20} height={20} className="flex-shrink-0 rounded"
          style={{ objectFit: 'contain' }}
          onError={() => setFavicon(null)} />
      )}
      <div className="flex-1 min-w-0" style={{ textAlign: titleAlign }}>
        <span className="font-semibold block truncate" style={{ color: resolvedTextColor, fontSize: titleSize, lineHeight: 1.3 }}>
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
  const overlay = !!content.overlayText

  // ── Overlay mode: title + caption sit ON TOP of the image with a dark
  // gradient. Portaly-style hero card. Only valid when there's text to
  // show; an overlay-on-blank-image is just a regular bare image. ──
  if (overlay && hasText) {
    const o = overlayTextStyles(content.overlayPosition)
    const overlayCard = (
      <div className="w-full relative overflow-hidden" style={{
        ...themeShape,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <img src={content.imageUrl} alt={content.alt ?? block.title ?? ''}
          className="w-full object-cover" style={{ display: 'block' }} />
        <div aria-hidden style={o.gradient} />
        <div style={o.wrapper}>
          <div style={o.text}>
            {block.title && (
              <p className="font-bold" style={{ fontSize: 18, color: 'white', margin: 0, lineHeight: 1.25 }}>
                {block.title}
              </p>
            )}
            {content.caption && (
              <p className="text-xs mt-1" style={{
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
                margin: 0,
                marginTop: block.title ? 4 : 0,
              }}>
                {content.caption}
              </p>
            )}
          </div>
        </div>
      </div>
    )
    return content.linkUrl
      ? <a href={ensureUrl(content.linkUrl)} target="_blank" rel="noopener noreferrer" className="block w-full" style={{ textDecoration: 'none' }}>{overlayCard}</a>
      : <div className="w-full">{overlayCard}</div>
  }

  // If there's no caption/title, render the bare image (legacy behavior — keeps
  // pixel-perfect look for banners that intentionally only have an image).
  if (!hasText) {
    const bareImg = (
      <img src={content.imageUrl} alt={content.alt ?? block.title ?? ''}
        className="w-full object-cover" style={themeShape} />
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
      ...themeShape,
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
  const content = block.content as {
    text: string; size?: string; color?: string; align?: 'left' | 'center' | 'right'
  }
  const size = content.size === 'lg' ? 18 : content.size === 'sm' ? 13 : 15
  const align = content.align ?? 'center'
  const color = content.color || 'var(--theme-text-secondary, var(--color-text-secondary))'
  return (
    <p className="font-semibold px-2"
      style={{ color, fontSize: size, textAlign: align, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
      {renderInlineMarkdown(content.text ?? block.title ?? '')}
    </p>
  )
}

/**
 * Tiny markdown subset: supports **bold** and [label](url).
 * Customer feedback: heading needs multi-line / bold / links. We avoid pulling
 * in a full markdown lib because we only need two features and bundle size
 * matters for the public profile route. Anything not matching the patterns
 * passes through as plain text — no HTML escaping needed because React
 * already escapes string children.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null
  // Pattern: bold (**...**) or link ([...](http...)). The capture order
  // matters — alternation tries bold first so "**[link](url)**" treats the
  // outer bold first, leaving the link as inner content (which we recurse
  // through the same parser).
  const RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
  const out: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = RE.exec(text)) !== null) {
    if (m.index > lastIndex) out.push(text.slice(lastIndex, m.index))
    if (m[1] !== undefined) {
      // Bold
      out.push(<strong key={key++}>{m[1]}</strong>)
    } else if (m[2] !== undefined && m[3] !== undefined) {
      // Link — defensive rel + target so we don't break referrer policy.
      out.push(
        <a key={key++} href={m[3]} target="_blank" rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'underline' }}>
          {m[2]}
        </a>
      )
    }
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex))
  return out
}

function ProductBlock({ block, pageId }: { block: BlockData; pageId?: string }) {
  const content = block.content as {
    price?: number; currency?: string; description?: string; imageUrl?: string
  }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Hide the <img> entirely on load failure instead of letting the browser
  // render its "broken image + alt text" fallback (which looks like a bug
  // — small icon + text in the top-left corner of the card). User reported
  // this on a stale Stripe / Gumroad image URL.
  const [imgFailed, setImgFailed] = useState(false)

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
      ...themeShape, overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Product image */}
      {content.imageUrl && !imgFailed && (
        <img src={content.imageUrl} alt={block.title ?? ''}
          className="w-full object-cover" style={{ maxHeight: 200 }}
          onError={() => setImgFailed(true)} />
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
      border: '1px solid var(--theme-border, var(--color-border))',
      ...themeShape,
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
      border: '1px solid var(--theme-border, var(--color-border))',
      ...themeShape,
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
  const overlay = !!content.overlayText

  // Nav controls (prev/next + dots) — shared by both layout modes so the
  // carousel feels the same whether captions overlay or sit below.
  const navControls = images.length > 1 ? (
    <>
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(current - 1) }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>‹</button>
      <button onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(current + 1) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>›</button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5"
        style={{ zIndex: 2 }}>
        {images.map((_, i) => (
          <button key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); setCurrent(i) }}
            className="w-2 h-2 rounded-full" style={{ background: i === current ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }} />
        ))}
      </div>
    </>
  ) : null

  // ── OVERLAY mode: title + caption float over the image with a dark
  // gradient. Nav controls sit on top too. ──
  if (overlay && hasText) {
    const o = overlayTextStyles(content.overlayPosition)
    const overlayCard = (
      // 16:9 aspect-ratio container: most marketing banners are designed
      // at 16:9 (matches YouTube thumbnails), so cover-filling at this
      // ratio rarely crops actual content. Previous maxHeight: 320 with
      // unconstrained aspect made tall images get their tops/bottoms
      // chopped off (customer screenshot).
      <div className="relative w-full overflow-hidden" style={{
        ...themeShape,
        aspectRatio: '16 / 9',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <img src={img.url} alt={img.alt ?? ''}
          className="w-full h-full object-cover"
          style={{ display: 'block' }} />
        <div aria-hidden style={o.gradient} />
        <div style={o.wrapper}>
          <div style={o.text}>
            {block.title && (
              <p className="font-bold" style={{ fontSize: 18, color: 'white', margin: 0, lineHeight: 1.25 }}>
                {block.title}
              </p>
            )}
            {activeCaption && (
              <p className="text-xs mt-1" style={{
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
                margin: 0,
                marginTop: block.title ? 4 : 0,
              }}>
                {activeCaption}
              </p>
            )}
          </div>
        </div>
        {navControls}
      </div>
    )
    return img.linkUrl
      ? <a href={ensureUrl(img.linkUrl)} target="_blank" rel="noopener noreferrer" className="block w-full" style={{ textDecoration: 'none' }}>{overlayCard}</a>
      : <div className="w-full">{overlayCard}</div>
  }

  // ── LEGACY mode: caption row below the image. ──
  // Same 16:9 container as overlay mode for visual consistency — every
  // carousel reads as a uniform "designed" thumbnail strip.
  const carouselInner = (
    <div className="relative w-full" style={{
      ...(hasText
        ? { borderRadius: 0, clipPath: 'none' }   // outer card owns the shape
        : themeShape),
      aspectRatio: '16 / 9',
      overflow: 'hidden',
      boxShadow: hasText ? 'none' : 'var(--shadow-sm)',
    }}>
      <img src={img.url} alt={img.alt ?? ''}
        className="w-full h-full object-cover"
        style={{ display: 'block' }} />
      {navControls}
    </div>
  )

  // Wrap in card with title/caption when either exists.
  const inner = hasText ? (
    <div className="w-full overflow-hidden" style={{
      background: 'var(--theme-card-bg, white)',
      border: '1px solid var(--theme-border, var(--color-border))',
      ...themeShape,
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

function ImageGridBlock({ block }: { block: BlockData }) {
  // Customer feedback #9: a Portaly-style two-column image grid block.
  // Each cell can optionally link out + carry a per-cell title. When
  // overlayText is on, the cell title floats over the image with a dark
  // gradient (Portaly hero card style at thumbnail scale).
  const content = block.content as {
    cells?: Array<{ url: string; linkUrl?: string; alt?: string; title?: string }>
    overlayText?: boolean
    overlayPosition?: ImageOverlayPosition
  }
  const cells = (content.cells ?? []).filter(c => c.url)
  if (cells.length === 0) return null
  const hasTitle = !!block.title
  const overlay = !!content.overlayText
  return (
    <div className="w-full" style={{ background: 'transparent' }}>
      {hasTitle && (
        <p className="font-bold text-sm mb-2 px-2"
          style={{ color: 'var(--theme-text, var(--color-text-primary))' }}>
          {block.title}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {cells.map((cell, i) => {
          const wrapStyle: React.CSSProperties = {
            ...themeShape,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',  // anchor for overlay
          }
          const inner = (
            <>
              <img
                src={cell.url}
                alt={cell.alt ?? ''}
                loading="lazy"
                className="w-full h-full object-cover transition-transform"
                style={{ aspectRatio: '1 / 1', display: 'block' }}
              />
              {overlay && cell.title && (() => {
                const o = overlayTextStyles(content.overlayPosition)
                return (
                  <>
                    <div aria-hidden style={o.gradient} />
                    <div style={o.wrapper}>
                      <div style={o.text}>
                        <p className="font-bold" style={{
                          fontSize: 14,
                          color: 'white',
                          margin: 0,
                          lineHeight: 1.25,
                        }}>{cell.title}</p>
                      </div>
                    </div>
                  </>
                )
              })()}
            </>
          )
          return cell.linkUrl ? (
            <a key={i} href={ensureUrl(cell.linkUrl)} target="_blank" rel="noopener noreferrer"
              style={wrapStyle}
              onMouseEnter={e => {
                const img = e.currentTarget.querySelector('img') as HTMLElement | null
                if (img) img.style.transform = 'scale(1.03)'
              }}
              onMouseLeave={e => {
                const img = e.currentTarget.querySelector('img') as HTMLElement | null
                if (img) img.style.transform = 'scale(1)'
              }}>
              {inner}
            </a>
          ) : (
            <div key={i} style={wrapStyle}>{inner}</div>
          )
        })}
      </div>
    </div>
  )
}

function FeatureCardBlock({ block, pageId }: { block: BlockData; pageId?: string }) {
  // Portaly-style horizontal feature card: image-and-text-side-by-side on
  // desktop, image-on-top stack on mobile. The single biggest visual gap
  // vs Portaly's storytelling pages (per the Phase 1 audit).
  const content = block.content as FeatureCardContent
  const imageOnRight = content.imagePosition === 'right'
  const hasCta = !!(content.ctaLabel && content.ctaUrl)

  const card = (
    <div
      className="w-full overflow-hidden flex flex-col sm:flex-row"
      style={{
        background: 'var(--theme-card-bg, white)',
        border: '1px solid var(--theme-border, var(--color-border))',
        ...themeShape,
        boxShadow: 'var(--shadow-sm)',
        // Reverse on desktop only when imagePosition is 'right'. Mobile
        // keeps image-on-top regardless so the stack reads consistently.
        flexDirection: imageOnRight
          ? 'column'  // stays column on mobile; sm: kicks in below
          : 'column',
      }}
    >
      {/* Mobile: always image first. Desktop: order driven by imagePosition. */}
      {content.imageUrl && (
        <div
          className={imageOnRight ? 'sm:order-2' : 'sm:order-1'}
          style={{ width: '100%', flexShrink: 0 }}
        >
          <img
            src={content.imageUrl}
            alt={block.title ?? ''}
            className="w-full object-cover"
            style={{ aspectRatio: '4 / 3', display: 'block', minHeight: 160 }}
          />
        </div>
      )}
      <div
        className={imageOnRight ? 'sm:order-1 flex-1' : 'sm:order-2 flex-1'}
        style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}
      >
        {block.title && (
          <p className="font-bold" style={{
            fontSize: 17,
            color: 'var(--theme-text, var(--color-text-primary))',
            lineHeight: 1.3,
          }}>
            {block.title}
          </p>
        )}
        {content.description && (
          <p className="text-sm" style={{
            color: 'var(--theme-text-secondary, var(--color-text-secondary))',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
          }}>
            {content.description}
          </p>
        )}
        {hasCta && (
          <span
            className="inline-flex items-center gap-1 text-sm font-bold mt-1"
            style={{
              color: 'var(--theme-primary, var(--color-primary))',
              alignSelf: 'flex-start',
            }}
          >
            {content.ctaLabel}
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  )

  // The whole card clicks through to the CTA URL when one exists. If not,
  // it's just a static info card. Track click only when there's a target.
  return hasCta ? (
    <a
      href={ensureUrl(content.ctaUrl!)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackClick(block.id, pageId)}
      className="block w-full"
      style={{ textDecoration: 'none' }}
    >
      {card}
    </a>
  ) : (
    <div className="w-full">{card}</div>
  )
}

function MapBlock({ block }: { block: BlockData }) {
  const content = block.content as { query: string; zoom?: number; description?: string }
  const q = encodeURIComponent(content.query ?? '')
  const hasHeader = !!(block.title || content.description)
  return (
    <div className="w-full" style={{ ...themeShape, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      {hasHeader && (
        // Title and description live in their own header rows so creators can
        // keep the title short and tight (e.g. "公司位置") while putting the
        // long-form prose ("週一到週五 10am–7pm,門口請按電鈴") below it.
        <div style={{
          background: 'var(--theme-card-bg, white)', color: 'var(--theme-text, var(--color-text-primary))',
          borderBottom: '1px solid var(--theme-border, var(--color-border))',
          padding: '10px 14px',
        }}>
          {block.title && (
            <p className="text-sm font-semibold leading-tight">{block.title}</p>
          )}
          {content.description && (
            <p className="text-xs leading-relaxed mt-1" style={{
              color: 'var(--theme-text-muted, var(--color-text-secondary))',
              whiteSpace: 'pre-line',
            }}>{content.description}</p>
          )}
        </div>
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
    <div className="w-full" style={{ ...themeShape, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
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
      ...themeShape,
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
    case 'image_grid': return <ImageGridBlock block={block} />
    case 'feature_card': return <FeatureCardBlock block={block} pageId={pageId} />
    case 'map': return <MapBlock block={block} />
    case 'embed': return <EmbedBlock block={block} />
    case 'calendar_event': return <CalendarEventBlock block={block} pageId={pageId} />
    default: return null
  }
}
