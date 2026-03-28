'use client'

import { BlockData } from '@/types'
import { ExternalLink, ShoppingBag, ChevronRight } from 'lucide-react'
import { useState } from 'react'

function LinkBlock({ block }: { block: BlockData }) {
  const content = block.content as { url: string; description?: string }
  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:border-violet-400 hover:shadow-md transition-all group"
    >
      <span className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
        {block.title}
      </span>
      <ChevronRight size={18} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
    </a>
  )
}

function BannerBlock({ block }: { block: BlockData }) {
  const content = block.content as { imageUrl: string; linkUrl?: string; alt?: string }
  const inner = (
    <img
      src={content.imageUrl}
      alt={content.alt ?? block.title ?? ''}
      className="w-full rounded-2xl object-cover"
    />
  )
  if (content.linkUrl) {
    return (
      <a href={content.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  }
  return <div>{inner}</div>
}

function HeadingBlock({ block }: { block: BlockData }) {
  const content = block.content as { text: string; size?: string }
  const sizeClass = content.size === 'lg' ? 'text-xl' : content.size === 'sm' ? 'text-sm text-gray-500' : 'text-base'
  return (
    <p className={`text-center font-semibold text-gray-700 px-2 ${sizeClass}`}>
      {content.text ?? block.title}
    </p>
  )
}

function ProductBlock({ block }: { block: BlockData }) {
  const content = block.content as { price: number; currency: string; description?: string; checkoutUrl: string; imageUrl?: string }
  return (
    <a
      href={content.checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl hover:border-violet-400 hover:shadow-md transition-all group"
    >
      {content.imageUrl && (
        <img src={content.imageUrl} alt={block.title ?? ''} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{block.title}</p>
        {content.description && <p className="text-sm text-gray-500 truncate">{content.description}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-bold text-violet-700">
          {content.currency}{content.price}
        </span>
        <ShoppingBag size={18} className="text-violet-500" />
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {})
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full px-5 py-4 bg-violet-50 border border-violet-200 rounded-2xl text-center text-violet-700 font-semibold">
        ✓ 已訂閱！
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={content.placeholder ?? '輸入你的 Email'}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-violet-400"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-violet-600 text-white rounded-2xl text-sm font-semibold hover:bg-violet-700 transition-colors"
        >
          {content.buttonText ?? '訂閱'}
        </button>
      </div>
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
