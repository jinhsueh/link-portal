'use client'

import { useState } from 'react'
import { Copy, QrCode, Share2, Check, X } from 'lucide-react'

interface Props {
  url: string
  title: string
}

export function ShareBar({ url, title }: Props) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch { /* user cancelled */ }
    } else {
      handleCopy()
    }
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1A1A2E&margin=16`

  // Compact icon-only buttons that never wrap into vertical text on narrow viewports
  const iconBtnStyle: React.CSSProperties = {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1A1A2E',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
  }

  return (
    <>
      <div className="flex justify-center" style={{ gap: 10 }}>
        {/* Copy URL */}
        <button
          onClick={handleCopy}
          aria-label={copied ? '已複製連結' : '複製連結'}
          title="複製連結"
          style={{
            ...iconBtnStyle,
            background: copied ? '#C6F6D5' : iconBtnStyle.background,
            color: copied ? '#22543D' : iconBtnStyle.color,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>

        {/* QR Code */}
        <button
          onClick={() => setShowQR(true)}
          aria-label="顯示 QR Code"
          title="QR Code"
          style={iconBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}>
          <QrCode size={16} />
        </button>

        {/* Share */}
        <button
          onClick={handleNativeShare}
          aria-label="分享頁面"
          title="分享"
          style={iconBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.10)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Share2 size={16} />
        </button>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(26,26,46,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowQR(false)}>
          <div className="text-center" onClick={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: 24, padding: '32px 28px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', maxWidth: 320 }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold" style={{ color: '#1A1A2E' }}>掃描 QR Code</h3>
              <button onClick={() => setShowQR(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: '#F7F9FC', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code" width={240} height={240}
                style={{ display: 'block', margin: '0 auto' }} />
            </div>
            <p className="text-xs font-mono truncate px-2" style={{ color: '#A0AEC0' }}>{url}</p>
            <button onClick={handleCopy} className="btn-primary w-full justify-center mt-4"
              style={{ fontSize: 14, padding: '11px 20px' }}>
              {copied ? <><Check size={14} />已複製</> : <><Copy size={14} />複製連結</>}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
