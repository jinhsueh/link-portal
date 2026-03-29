'use client'

import { BlockData } from '@/types'
import { ChevronRight, ShoppingBag } from 'lucide-react'
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
  const content = block.content as { price: number; currency: string; description?: string; checkoutUrl: string; imageUrl?: string }
  return (
    <a href={content.checkoutUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-4 w-full transition-all"
      style={{ padding: '16px 20px', background: 'white', border: '1px solid var(--color-border)', borderRadius: 12, textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)' }}>
      {content.imageUrl && (
        <img src={content.imageUrl} alt={block.title ?? ''} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{block.title}</p>
        {content.description && <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{content.description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{content.currency}{content.price}</span>
        <ShoppingBag size={16} style={{ color: 'var(--color-primary)' }} />
      </div>
    </a>
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
