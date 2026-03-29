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

  return (
    <>
      <div className="flex justify-center gap-3">
        {/* Copy URL */}
        <button onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
          style={{
            background: copied ? '#C6F6D5' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 9999,
            cursor: 'pointer',
            color: copied ? '#22543D' : 'inherit',
          }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? '已複製' : '複製連結'}
        </button>

        {/* QR Code */}
        <button onClick={() => setShowQR(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 9999,
            cursor: 'pointer',
          }}>
          <QrCode size={14} />
          QR Code
        </button>

        {/* Share */}
        <button onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 9999,
            cursor: 'pointer',
          }}>
          <Share2 size={14} />
          分享
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
