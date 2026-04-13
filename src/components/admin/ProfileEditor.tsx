'use client'

import { useState, useRef } from 'react'
import { Camera, X, Save, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { SocialLinksEditor } from '@/components/admin/SocialLinksEditor'

interface SocialLinkItem {
  id: string
  platform: string
  url: string
  label?: string
  order: number
}

interface ProfileData {
  username: string
  name?: string
  bio?: string
  avatarUrl?: string
  socialLinks: SocialLinkItem[]
}

interface Props {
  profile: ProfileData
  onUpdate: () => void
  onLiveChange?: (data: { name: string; bio: string; avatarUrl: string }) => void
  defaultExpanded?: boolean
}

export function ProfileEditor({ profile, onUpdate, onLiveChange, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [name, setName] = useState(profile.name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        onLiveChange?.({ name, bio, avatarUrl: data.url })
        await fetch('/api/me', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: data.url }),
        })
        onUpdate()
      }
    } catch { /* silent */ }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveAvatar = async () => {
    setAvatarUrl('')
    onLiveChange?.({ name, bio, avatarUrl: '' })
    await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarUrl: '' }),
    })
    onUpdate()
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onUpdate()
  }

  const hasProfile = !!(avatarUrl || profile.bio || profile.socialLinks.length > 0)

  return (
    <div className="rounded-2xl overflow-hidden mb-5"
      style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header — always visible */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4"
        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        {/* Mini avatar */}
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            style={{ border: '2px solid var(--color-border)' }} />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--gradient-blue)', color: 'white', border: '2px solid var(--color-border)' }}>
            {(name || profile.username || '?').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {name || profile.username}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
            {bio || '點擊編輯個人資料與社群連結'}
          </p>
        </div>
        {/* Social icons preview (collapsed) */}
        {!expanded && profile.socialLinks.length > 0 && (
          <div className="flex items-center gap-1 mr-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {profile.socialLinks.length} 個連結
            </span>
          </div>
        )}
        {expanded ? (
          <ChevronUp size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5" style={{ borderTop: '1px solid var(--color-border)' }}>
          {/* Avatar */}
          <div className="flex items-center gap-4 pt-4">
            <div className="relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover"
                  style={{ border: '3px solid var(--color-border)' }} />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                  style={{ background: 'var(--gradient-blue)', color: 'white', border: '3px solid var(--color-border)' }}>
                  {(name || profile.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer', border: 'none' }}>
                {uploading
                  ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  : <Camera size={18} color="white" />}
              </button>
              {avatarUrl && (
                <button onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#EF4444', border: '2px solid white', cursor: 'pointer' }}>
                  <X size={10} color="white" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>大頭照</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>JPG、PNG、GIF、WebP，最大 4MB</p>
            </div>
          </div>

          {/* Name + Bio */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>顯示名稱</label>
              <input value={name} onChange={e => { setName(e.target.value); onLiveChange?.({ name: e.target.value, bio, avatarUrl }) }} placeholder="你的名字"
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14,
                  border: '1px solid var(--color-border)', borderRadius: 10,
                  color: 'var(--color-text-primary)', background: 'white', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>個人簡介</label>
              <textarea value={bio} onChange={e => { setBio(e.target.value); onLiveChange?.({ name, bio: e.target.value, avatarUrl }) }} placeholder="介紹自己..." rows={2}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: 14, resize: 'none',
                  border: '1px solid var(--color-border)', borderRadius: 10,
                  color: 'var(--color-text-primary)', background: 'white', outline: 'none',
                } as React.CSSProperties}
                onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{bio.length}/200</p>
            </div>
            <button onClick={handleSaveProfile} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold"
              style={{
                background: saved ? '#22C55E' : 'var(--color-primary)',
                color: 'white', border: 'none', cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}>
              {saved ? <><Check size={14} />已儲存</> : saving ? '儲存中...' : <><Save size={14} />儲存資料</>}
            </button>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>社群連結</label>
            <SocialLinksEditor links={profile.socialLinks} onSave={onUpdate} />
          </div>
        </div>
      )}
    </div>
  )
}
