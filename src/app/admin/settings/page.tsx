'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Settings, BarChart2, ExternalLink, LogOut, Save, Plus, Trash2, ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  )

  const navLinkStyle = (active = false) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
    fontSize: 14, fontWeight: 500, textDecoration: 'none', border: 'none', cursor: 'pointer',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary-light)' : 'none',
  })

  const inputStyle = {
    width: '100%', padding: '11px 14px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 10,
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
                <Link2 size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Link Portal</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/admin" style={navLinkStyle()}>主頁</a>
              <a href="/admin/analytics" style={navLinkStyle()}><BarChart2 size={14} />數據分析</a>
              <a href="/admin/settings" style={navLinkStyle(true)}><Settings size={14} />設定</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/${user?.username}`} target="_blank" rel="noopener noreferrer" style={{ ...navLinkStyle(), display: 'flex' }}>
              <ExternalLink size={14} /><span className="hidden sm:inline">預覽</span>
            </a>
            <button onClick={async () => { await fetch('/api/auth', { method: 'DELETE' }); router.push('/login') }} style={navLinkStyle()}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile section */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold mb-6" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>個人資料</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>用戶名稱</label>
              <input value={user?.username ?? ''} disabled style={{ ...inputStyle, background: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>用戶名稱建立後無法修改</p>
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
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>大頭照網址</label>
              <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-primary)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'} />
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
      </div>
    </div>
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
