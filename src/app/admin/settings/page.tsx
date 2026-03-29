'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Camera, X, Download, QrCode } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/你的帳號' },
  { id: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@你的頻道' },
  { id: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@你的帳號' },
  { id: 'threads',   label: 'Threads',   placeholder: 'https://threads.net/@你的帳號' },
  { id: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/你的主頁' },
  { id: 'spotify',   label: 'Spotify',   placeholder: 'https://open.spotify.com/artist/...' },
]

interface SocialLink { id: string; platform: string; url: string }

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; username: string; name?: string; bio?: string; avatarUrl?: string } | null>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/me').then(async res => {
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setUser(data)
      setName(data.name ?? '')
      setBio(data.bio ?? '')
      setAvatarUrl(data.avatarUrl ?? '')
      setSocialLinks(data.socialLinks ?? [])
      setLoading(false)
    })
  }, [router])

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setAvatarUrl(data.url)
        // Auto-save avatar
        await fetch('/api/me', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: data.url }),
        })
      }
    } catch {
      // Silently fail
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveAvatar = async () => {
    setAvatarUrl('')
    await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: '' }),
    })
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, avatarUrl }),
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveSocial = async (platform: string, url: string) => {
    if (!url.trim()) {
      await fetch(`/api/social?platform=${platform}`, { method: 'DELETE' })
      setSocialLinks(prev => prev.filter(l => l.platform !== platform))
    } else {
      const res = await fetch('/api/social', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, url }),
      })
      const link = await res.json()
      setSocialLinks(prev => {
        const exists = prev.find(l => l.platform === platform)
        return exists ? prev.map(l => l.platform === platform ? link : l) : [...prev, link]
      })
    }
  }

  if (loading) return (
    <AdminShell username={user?.username}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 10,
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
  }

  return (
    <AdminShell username={user?.username}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile section */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold mb-6" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>個人資料</h2>

          {/* Avatar upload */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: '3px solid var(--color-border)' }} />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--gradient-blue)', color: 'white', border: '3px solid var(--color-border)' }}>
                  {(name || user?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer', border: 'none' }}>
                {uploading ? (
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                ) : (
                  <Camera size={20} color="white" />
                )}
              </button>
              {avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#EF4444', border: '2px solid white', cursor: 'pointer' }}>
                  <X size={12} color="white" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>大頭照</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                點擊上傳圖片（JPG、PNG、GIF、WebP，最大 4MB）
              </p>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: 'none', cursor: 'pointer' }}>
                {uploading ? '上傳中...' : '選擇圖片'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>用戶名稱</label>
              <input value={user?.username ?? ''} disabled style={{ ...inputStyle, background: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>你的頁面網址：link-portal-eight.vercel.app/{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>顯示名稱</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="你的名字" style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>個人簡介</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="介紹自己..." rows={3}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-primary)'}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-border)'} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{bio.length}/200 字元</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
              <Save size={15} />
              {saved ? '已儲存 ✓' : saving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>

        {/* Social links section */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>社群連結</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>填入後會自動顯示在頁面上，清空欄位並儲存即可刪除</p>
          <div className="space-y-4">
            {SOCIAL_PLATFORMS.map(({ id, label, placeholder }) => {
              const existing = socialLinks.find(l => l.platform === id)
              return (
                <SocialLinkRow key={id} platform={id} label={label} placeholder={placeholder}
                  initialUrl={existing?.url ?? ''}
                  onSave={(url) => handleSaveSocial(id, url)} />
              )
            })}
          </div>
        </div>

        {/* QR Code section */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>QR Code</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>掃描即可直接開啟你的個人頁面</p>
          <QRCodeSection username={user?.username ?? ''} />
        </div>
      </div>
    </AdminShell>
  )
}

function SocialLinkRow({ platform, label, placeholder, initialUrl, onSave }: {
  platform: string; label: string; placeholder: string; initialUrl: string
  onSave: (url: string) => void
}) {
  const [url, setUrl] = useState(initialUrl)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(url)
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder={placeholder}
        className="flex-1 text-sm px-3 py-2.5 focus:outline-none"
        style={{ border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)' }}
        onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'}
        onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'} />
      <button onClick={handleSave} disabled={saving || url === initialUrl}
        className="btn-primary flex-shrink-0"
        style={{ fontSize: 13, padding: '8px 14px', opacity: (saving || url === initialUrl) ? 0.5 : 1 }}>
        {saving ? '...' : '儲存'}
      </button>
    </div>
  )
}

function QRCodeSection({ username }: { username: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const pageUrl = `https://link-portal-eight.vercel.app/${username}`

  useEffect(() => {
    if (!username) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current, pageUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#1A1A2E', light: '#FFFFFF' },
      }, () => setReady(true))
    })
  }, [username, pageUrl])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${username}-qrcode.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
        <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{pageUrl}</p>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          下載 QR Code 分享在名片、社群貼文或印刷品上
        </p>
        {ready && (
          <button onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #C3D9FF', cursor: 'pointer' }}>
            <Download size={14} />下載 PNG
          </button>
        )}
      </div>
    </div>
  )
}
