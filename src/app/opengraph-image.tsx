import { ImageResponse } from 'next/og'
import { SITE_HOST } from '@/lib/site'

/**
 * Brand OG image for every marketing route (/, /en, /ja, /th, /zh-TW,
 * /pricing, /about, /contact …). Public profiles override it with
 * `[username]/opengraph-image.tsx`. Twitter falls back to this too.
 */
export const alt = 'Beam — Free link-in-bio for creators'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #F0F4FF 0%, #FFFFFF 60%)',
        padding: 72,
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Logo row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            display: 'flex',
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #5090FF 0%, #3A6FD8 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(80,144,255,0.35)',
          }}
        >
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
            <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
        </div>
        <span style={{ fontSize: 44, fontWeight: 700, color: '#1A1A2E', letterSpacing: -1 }}>Beam</span>
      </div>

      {/* Headline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span style={{ fontSize: 76, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
          One link. Every fan touchpoint.
        </span>
        <span style={{ fontSize: 32, color: '#5A6478', lineHeight: 1.3, maxWidth: 920 }}>
          Free link-in-bio for creators — socials, products, email list. Live in 30 seconds.
        </span>
      </div>

      {/* Footer: fake URL pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 26px',
            borderRadius: 999,
            background: '#FFFFFF',
            border: '2px solid #DCE6FF',
            fontSize: 28,
            color: '#3A6FD8',
            fontWeight: 600,
          }}
        >
          {SITE_HOST}/yourname
        </div>
        <span style={{ fontSize: 26, color: '#8A94A6', fontWeight: 500 }}>Free forever · No credit card</span>
      </div>
    </div>,
    size,
  )
}
