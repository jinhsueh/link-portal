'use client'

import { BlockData } from '@/types'
import { ChevronRight, ShoppingBag, Loader2 } from 'lucide-react'
import { useState } from 'react'

function LinkBlock({ block }: { block: BlockData }) {
  const content = block.content as { url: string }
  return (
    <a href={content.url} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between w-full transition-all group"
      style={{
        padding: '16px 20px', background: 'white',
        border: '1px solid var(--color-border)', borderRadius: 12,
        textDecoration: 'none', boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
      }}>
      <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
        {block.title}
      </span>
      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
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

function ProductBlock({ block }: { block: BlockData }) {
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

function EmailFormBlock({ block }: { block: BlockData }) {
  const content = block.content as { placeholder?: string; buttonText?: string; webhookUrl?: string }
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.webhookUrl) {
      await fetch(content.webhookUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {})
    }
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

export function BlockRenderer({ block }: { block: BlockData }) {
  if (!block.active) return null
  switch (block.type) {
    case 'link': return <LinkBlock block={block} />
    case 'banner': return <BannerBlock block={block} />
    case 'heading': return <HeadingBlock block={block} />
    case 'product': return <ProductBlock block={block} />
    case 'email_form': return <EmailFormBlock block={block} />
    default: return null
  }
}
