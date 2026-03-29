'use client'

import { BlockData } from '@/types'
import { ChevronRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useState } from 'react'

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
}

function LinkBlock({ block, pageId, btnStyle = 'outline' }: { block: BlockData; pageId?: string; btnStyle?: string }) {
  const content = block.content as { url: string; thumbnail?: string; description?: string }
  const [favicon, setFavicon] = useState<string | null>(content.thumbnail ?? null)

  useState(() => {
    if (!favicon && content.url) {
      try {
        const domain = new URL(content.url).hostname
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`)
      } catch { /* invalid url */ }
    }
  })

  return (
    <a href={content.url} target="_blank" rel="noopener noreferrer"
      onClick={() => trackClick(block.id, pageId)}
      className="flex items-center gap-3 w-full transition-all group link-block"
      style={{
        padding: '16px 20px',
        background: btnStyle === 'filled' ? 'var(--theme-primary, var(--color-primary))'
          : btnStyle === 'soft' ? 'var(--theme-card-bg, white)'
          : 'var(--theme-card-bg, white)',
        color: btnStyle === 'filled' ? 'white' : undefined,
        border: btnStyle === 'filled' ? 'none' : `1px solid var(--theme-border, var(--color-border))`,
        borderRadius: 'var(--theme-radius, 12px)',
        textDecoration: 'none', boxShadow: btnStyle === 'filled' ? 'none' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        if (btnStyle !== 'filled') {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-primary, var(--color-primary))'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
        } else {
          (e.currentTarget as HTMLElement).style.opacity = '0.9'
        }
      }}
      onMouseLeave={e => {
        if (btnStyle !== 'filled') {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--theme-border, var(--color-border))'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
        } else {
          (e.currentTarget as HTMLElement).style.opacity = '1'
        }
      }}>
      {favicon && (
        <img src={favicon} alt="" width={20} height={20} className="flex-shrink-0 rounded"
          style={{ objectFit: 'contain' }}
          onError={() => setFavicon(null)} />
      )}
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-sm block truncate" style={{ color: btnStyle === 'filled' ? 'white' : 'var(--theme-text, var(--color-text-primary))' }}>
          {block.title}
        </span>
        {content.description && (
          <span className="text-xs block truncate mt-0.5" style={{ color: btnStyle === 'filled' ? 'rgba(255,255,255,0.8)' : 'var(--theme-text-secondary, var(--color-text-secondary))' }}>
            {content.description}
          </span>
        )}
      </div>
      <ChevronRight size={16} className="flex-shrink-0" style={{ color: btnStyle === 'filled' ? 'rgba(255,255,255,0.6)' : 'var(--theme-text-muted, var(--color-text-muted))' }} />
    </a>
  )
}

function BannerBlock({ block }: { block: BlockData }) {
  const content = block.content as { imageUrl: string; linkUrl?: string; alt?: string }
  const inner = (
    <img src={content.imageUrl} alt={content.alt ?? block.title ?? ''}
      className="w-full object-cover" style={{ borderRadius: 12 }} />
  )
  return content.linkUrl
    ? <a href={content.linkUrl} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
    : <div>{inner}</div>
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
  const content = block.content as { platform?: string; embedId?: string; url?: string }
  const platform = content.platform ?? 'youtube'
  const embedId = content.embedId ?? ''

  if (platform === 'youtube' && embedId) {
    return (
      <div className="w-full" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {block.title && (
          <p className="text-sm font-semibold px-3 py-2" style={{ background: 'white', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}>
            {block.title}
          </p>
        )}
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
        {block.title && (
          <p className="text-sm font-semibold px-3 py-2" style={{ background: 'white', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}>
            {block.title}
          </p>
        )}
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
        {block.title && (
          <p className="text-sm font-semibold px-3 py-2" style={{ background: 'white', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}>
            {block.title}
          </p>
        )}
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
    <a href={content.url ?? '#'} target="_blank" rel="noopener noreferrer"
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

  useState(() => {
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
  })

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
  const content = block.content as { images: Array<{ url: string; linkUrl?: string; alt?: string }> }
  const [current, setCurrent] = useState(0)
  const images = content.images ?? []
  if (images.length === 0) return null

  const goTo = (i: number) => setCurrent((i + images.length) % images.length)
  const img = images[current]

  const inner = (
    <div className="relative w-full" style={{ borderRadius: 'var(--theme-radius, 12px)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <img src={img.url} alt={img.alt ?? ''} className="w-full object-cover" style={{ maxHeight: 280 }} />
      {images.length > 1 && (
        <>
          <button onClick={() => goTo(current - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>‹</button>
          <button onClick={() => goTo(current + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 16 }}>›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full" style={{ background: i === current ? 'white' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }} />
            ))}
          </div>
        </>
      )}
    </div>
  )

  return img.linkUrl
    ? <a href={img.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">{inner}</a>
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

/** Only allow iframe tags in embed HTML to prevent XSS */
function sanitizeEmbed(html: string): string {
  const match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/i)
    || html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*\/>/i)
  if (match) {
    return `<iframe src="${match[1]}" style="width:100%;height:100%;border:none" loading="lazy" allowfullscreen></iframe>`
  }
  // If no iframe found, wrap URL in iframe
  if (html.startsWith('http')) {
    return `<iframe src="${html}" style="width:100%;height:100%;border:none" loading="lazy"></iframe>`
  }
  return ''
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
    default: return null
  }
}
