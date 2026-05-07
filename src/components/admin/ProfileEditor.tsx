'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Save, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { SocialLinksEditor, type SocialLinksEditorHandle } from '@/components/admin/SocialLinksEditor'
import { ImageCropperModal } from '@/components/ui/ImageCropperModal'
import { toast } from '@/components/ui/Toast'

interface SocialLinkItem {
  id: string
  platform: string
  url: string
  label?: string
  order: number
  iconUrl?: string | null
}

interface ProfileData {
  username: string
  name?: string
  bio?: string
  avatarUrl?: string
  bannerUrl?: string
  socialLinks: SocialLinkItem[]
}

interface Props {
  profile: ProfileData
  onUpdate: () => void
  onLiveChange?: (data: { name: string; bio: string; avatarUrl: string; bannerUrl?: string }) => void
  onSocialLinksChange?: (links: SocialLinkItem[]) => void
  defaultExpanded?: boolean
}

export function ProfileEditor({ profile, onUpdate, onLiveChange, onSocialLinksChange, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [name, setName] = useState(profile.name ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '')
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Pending files awaiting crop confirmation. Setting one of these opens the
  // ImageCropperModal; on confirm we upload the cropped result.
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null)
  const [pendingBanner, setPendingBanner] = useState<File | null>(null)

  const uploadCroppedAvatar = async (cropped: File) => {
    setPendingAvatar(null)
    setUploading(true)
    const formData = new FormData()
    formData.append('file', cropped)
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

  const uploadCroppedBanner = async (cropped: File) => {
    setPendingBanner(null)
    setUploadingBanner(true)
    const formData = new FormData()
    formData.append('file', cropped)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        setBannerUrl(data.url)
        onLiveChange?.({ name, bio, avatarUrl, bannerUrl: data.url })
        await fetch('/api/me', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bannerUrl: data.url }),
        })
        onUpdate()
      }
    } catch { /* silent */ }
    setUploadingBanner(false)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  const handlePickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingAvatar(file)
  }

  const handlePickBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPendingBanner(file)
  }

  const handleRemoveBanner = async () => {
    setBannerUrl('')
    onLiveChange?.({ name, bio, avatarUrl, bannerUrl: '' })
    await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannerUrl: '' }),
    })
    onUpdate()
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

  // Unified save: name/bio + social links in parallel. The parent (admin
  // page) re-pulls /api/me on success so other components see fresh data.
  const socialEditorRef = useRef<SocialLinksEditorHandle>(null)
  // Dirty for the profile half of the editor (name/bio).
  const isProfileDirty = (name !== (profile.name ?? '')) || (bio !== (profile.bio ?? ''))
  // Track social-editor dirty separately. We DON'T poll the ref on every
  // render because the parent doesn't re-render when child state changes —
  // instead we hook into the same onLinksChange the parent already wires
  // and recompute against the original `profile.socialLinks` snapshot.
  const [socialDirty, setSocialDirty] = useState(false)
  const handleSocialLinksChange = (links: SocialLinkItem[]) => {
    onSocialLinksChange?.(links)
    // Cheap diff: length + same-key fields (matches SocialLinksEditor.isDirty).
    const orig = profile.socialLinks
    let dirty = links.length !== orig.length
    if (!dirty) {
      for (let i = 0; i < links.length; i++) {
        const a = links[i]; const b = orig[i]
        if (!b || a.url !== b.url || (a.label ?? '') !== (b.label ?? '')
          || (a.iconUrl ?? '') !== (b.iconUrl ?? '') || a.order !== b.order) {
          dirty = true; break
        }
      }
    }
    setSocialDirty(dirty)
  }
  // When the profile prop refreshes (after a save), reset the dirty flag.
  useEffect(() => {
    setSocialDirty(false)
  }, [profile.socialLinks])
  const isDirty = isProfileDirty || socialDirty

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Profile fields and social links go in parallel — they live on
      // different endpoints (/api/me vs /api/social) and don't depend on
      // each other, so concurrent saves halve the spinner time.
      await Promise.all([
        isProfileDirty ? fetch('/api/me', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, bio }),
        }) : Promise.resolve(),
        socialDirty && socialEditorRef.current ? socialEditorRef.current.save() : Promise.resolve(),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onUpdate()
      toast.success('已儲存')
    } catch {
      toast.error('儲存失敗,請再試一次')
    }
    setSaving(false)
  }

  // Cancel unsaved changes — restore name/bio from props and tell the
  // social editor to throw away its local edits. Avatar/banner aren't
  // included because they're saved-on-upload (no rollback story).
  const handleCancelAll = () => {
    setName(profile.name ?? '')
    setBio(profile.bio ?? '')
    onLiveChange?.({ name: profile.name ?? '', bio: profile.bio ?? '', avatarUrl, bannerUrl })
    socialEditorRef.current?.reset()
    setSocialDirty(false)
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
          {/* Banner */}
          <div className="pt-4">
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>頁面橫幅(選填)</p>
            <div className="relative group rounded-xl overflow-hidden" style={{
              border: '1px solid var(--color-border)',
              background: bannerUrl ? 'transparent' : 'var(--color-surface)',
              aspectRatio: '3 / 1',
            }}>
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs"
                  style={{ color: 'var(--color-text-muted)' }}>
                  尚未上傳橫幅
                </div>
              )}
              <button onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer', border: 'none' }}>
                {uploadingBanner
                  ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  : <Camera size={20} color="white" />}
              </button>
              {bannerUrl && (
                <button onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(239, 68, 68, 0.9)', border: '2px solid white', cursor: 'pointer' }}>
                  <X size={12} color="white" />
                </button>
              )}
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickBanner} />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
              建議尺寸 1200×400(3:1 寬比),會顯示在公開頁最上方。
            </p>
          </div>

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
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickAvatar} />
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
            {/* The old per-section "儲存資料" button lived here; customer
                feedback was that having two save buttons (this one + the
                social editor's "全部儲存") was confusing. Both are now
                replaced by the single unified bar at the bottom. */}
          </div>

          {/* Social Links — embedded mode means SocialLinksEditor renders
              without its own save/cancel; the parent's bar drives both. */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>社群連結</label>
            <SocialLinksEditor
              ref={socialEditorRef}
              links={profile.socialLinks}
              onSave={onUpdate}
              onLinksChange={handleSocialLinksChange}
              embedded
            />
          </div>

          {/* Unified save bar — yellow "尚未儲存" warning + 全部儲存 + 取消.
              Sticky at the bottom of the expanded card so users always see
              it while scrolling through their changes. */}
          {isDirty && (
            <div className="rounded-xl flex items-center justify-between gap-3 px-4 py-3"
              style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                position: 'sticky', bottom: 0,
                boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
              }}>
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle size={16} style={{ color: '#D97706', flexShrink: 0 }} />
                <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                  尚未儲存變動,記得按右側「全部儲存」
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={handleCancelAll} disabled={saving}
                  className="text-sm font-semibold px-3 py-2 rounded-lg"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  取消
                </button>
                <button onClick={handleSaveAll} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: saved ? '#22C55E' : 'var(--color-primary)',
                    color: 'white', border: 'none', cursor: 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}>
                  {saved ? <><Check size={14} />已儲存</> : saving ? '儲存中...' : <><Save size={14} />全部儲存</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Crop modals — opened when a file is picked, closed on confirm/cancel ── */}
      {pendingAvatar && (
        <ImageCropperModal
          file={pendingAvatar}
          aspect={1}
          cropShape="round"
          title="裁切大頭照"
          onComplete={uploadCroppedAvatar}
          onCancel={() => {
            setPendingAvatar(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
          }}
        />
      )}
      {pendingBanner && (
        <ImageCropperModal
          file={pendingBanner}
          aspect={3}
          title="裁切橫幅(3:1)"
          viewportPreview="banner"
          onComplete={uploadCroppedBanner}
          onCancel={() => {
            setPendingBanner(null)
            if (bannerInputRef.current) bannerInputRef.current.value = ''
          }}
        />
      )}
    </div>
  )
}
