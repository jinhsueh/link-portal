'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

/**
 * Floating share button for *visitors* (not the page owner).
 *
 * Uses Web Share API on supported browsers (mobile Safari, Chrome) so users
 * can share to IG / Threads / Messages with their native picker. Falls back
 * to copying the URL on desktop / unsupported browsers.
 *
 * Why bother: organic sharing is the cheapest growth channel for link-in-bio
 * — every visitor who shares is a free distribution event. Having the button
 * there at all bumps conversion on shareable creators.
 */
export function VisitorShareButton({ shareUrl, shareTitle }: { shareUrl: string; shareTitle: string }) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    // Prefer Web Share API — gives native picker on mobile.
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl })
      } catch { /* user cancelled, no-op */ }
      return
    }
    // Desktop fallback: copy URL.
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShared(true)
      setTimeout(() => setShared(false), 1800)
    } catch { /* silent */ }
  }

  return (
    <button onClick={handleShare}
      aria-label="分享此頁面"
      className="fixed z-30 rounded-full flex items-center justify-center transition-all"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        right: 24,
        width: 52, height: 52,
        background: shared ? '#22C55E' : 'rgba(0,0,0,0.85)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}>
      {shared ? <Check size={20} /> : <Share2 size={20} />}
    </button>
  )
}
