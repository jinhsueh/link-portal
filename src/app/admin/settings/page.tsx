'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Camera, X, Download, User, Lock, Bell, AlertTriangle, Trash2, Plus, Users, ChevronDown, CreditCard, Sparkles } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/你的帳號' },
  { id: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@你的頻道' },
  { id: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@你的帳號' },
  { id: 'threads',   label: 'Threads',   placeholder: 'https://threads.net/@你的帳號' },
  { id: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/你的主頁' },
  { id: 'spotify',   label: 'Spotify',   placeholder: 'https://open.spotify.com/artist/...' },
]

const TABS = [
  { id: 'account',       label: '帳號資訊', icon: User },
  { id: 'billing',       label: '方案與帳單', icon: CreditCard },
  { id: 'password',      label: '密碼管理', icon: Lock },
  { id: 'notifications', label: '通知偏好', icon: Bell },
  { id: 'danger',        label: '危險區域', icon: AlertTriangle },
] as const

type TabId = typeof TABS[number]['id']

interface SocialLink { id: string; platform: string; url: string }
interface TeamMember { id: string; memberEmail: string; role: string; status: string; invitedAt: string }
interface UserData {
  id: string; username: string; email: string; name?: string; bio?: string; avatarUrl?: string
  createdAt: string; hasPassword: boolean
  plan: string; effectivePlan: 'free' | 'pro'; trialEndsAt?: string; trialDaysLeft: number
  notifyNewSubscriber: boolean; notifyNewOrder: boolean; notifyWeeklyReport: boolean
  socialLinks: SocialLink[]
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('account')

  useEffect(() => {
    fetch('/api/me').then(async res => {
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setUser(data)
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <AdminShell username={user?.username}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  return (
    <AdminShell username={user?.username}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-bold text-xl mb-6" style={{ color: 'var(--color-text-primary)' }}>帳號設定</h1>

        <div className="flex gap-6" style={{ minHeight: 500 }}>
          {/* Left: Tab navigation */}
          <div className="flex-shrink-0 hidden sm:block" style={{ width: 180 }}>
            <div className="flex flex-col gap-1" style={{ position: 'sticky', top: 80 }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors w-full"
                  style={{
                    background: activeTab === id ? 'var(--color-primary-light)' : 'transparent',
                    color: activeTab === id ? 'var(--color-primary)' : id === 'danger' ? '#E53E3E' : 'var(--color-text-secondary)',
                    border: 'none', cursor: 'pointer',
                  }}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile tab selector */}
          <div className="sm:hidden w-full mb-4">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                  style={{
                    background: activeTab === id ? 'var(--color-primary)' : 'white',
                    color: activeTab === id ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${activeTab === id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                  }}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'account' && user && <AccountTab user={user} onUpdate={setUser} />}
            {activeTab === 'billing' && user && <BillingTab user={user} />}
            {activeTab === 'password' && user && <PasswordTab hasPassword={user.hasPassword} />}

            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'danger' && user && <DangerTab username={user.username} />}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

// ─── Shared styles ───
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  border: '1px solid var(--color-border)', borderRadius: 10,
  color: 'var(--color-text-primary)', background: 'white', outline: 'none',
}
const cardStyle: React.CSSProperties = {
  background: 'white', border: '1px solid var(--color-border)',
  borderRadius: 16, padding: 28, boxShadow: 'var(--shadow-sm)',
}
const focusIn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'var(--color-primary)')
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  (e.target.style.borderColor = 'var(--color-border)')

// ─── Tab 1: Account ───
function AccountTab({ user, onUpdate }: { user: UserData; onUpdate: (u: UserData) => void }) {
  const [name, setName] = useState(user.name ?? '')
  const [bio, setBio] = useState(user.bio ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(user.socialLinks ?? [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrReady, setQrReady] = useState(false)
  const pageUrl = `https://link-portal-eight.vercel.app/${user.username}`

  useEffect(() => {
    if (!user.username) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current, pageUrl, {
        width: 200, margin: 2, color: { dark: '#1A1A2E', light: '#FFFFFF' },
      }, () => setQrReady(true))
    })
  }, [user.username, pageUrl])

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
        await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl: data.url }) })
      }
    } catch { /* silent */ }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveAvatar = async () => {
    setAvatarUrl('')
    await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl: '' }) })
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, email, avatarUrl }),
    })
    const updated = await res.json()
    onUpdate(updated)
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

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-5" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>帳號資訊</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>加入時間</label>
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{new Date(user.createdAt).toLocaleDateString('zh-TW')}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>用戶名稱</label>
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{user.username}</p>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>聯絡信箱</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
      </div>

      {/* Profile */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-5" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>個人資料</h2>
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" style={{ border: '3px solid var(--color-border)' }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{ background: 'var(--gradient-blue)', color: 'white', border: '3px solid var(--color-border)' }}>
                {(name || user.username || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)', cursor: 'pointer', border: 'none' }}>
              {uploading ? <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> : <Camera size={20} color="white" />}
            </button>
            {avatarUrl && (
              <button onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: '#EF4444', border: '2px solid white', cursor: 'pointer' }}>
                <X size={12} color="white" />
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadAvatar} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>大頭照</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>JPG、PNG、GIF、WebP，最大 4MB</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>顯示名稱</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="你的名字" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>個人簡介</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="介紹自己..." rows={3}
              style={{ ...inputStyle, resize: 'none' } as React.CSSProperties} onFocus={focusIn} onBlur={focusOut} />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{bio.length}/200 字元</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
            <Save size={15} />{saved ? '已儲存 ✓' : saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>

      {/* Social links */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>社群連結</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>填入後會顯示在頁面上，清空並儲存即可刪除</p>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map(({ id, label, placeholder }) => {
            const existing = socialLinks.find(l => l.platform === id)
            return <SocialLinkRow key={id} platform={id} label={label} placeholder={placeholder} initialUrl={existing?.url ?? ''} onSave={url => handleSaveSocial(id, url)} />
          })}
        </div>
      </div>

      {/* QR Code */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>QR Code</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>掃描即可直接開啟你的個人頁面</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{pageUrl}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>下載 QR Code 分享在名片、社群貼文或印刷品上</p>
            {qrReady && (
              <button onClick={() => {
                const canvas = canvasRef.current
                if (!canvas) return
                const link = document.createElement('a')
                link.download = `${user.username}-qrcode.png`
                link.href = canvas.toDataURL('image/png')
                link.click()
              }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #C3D9FF', cursor: 'pointer' }}>
                <Download size={14} />下載 PNG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialLinkRow({ platform, label, placeholder, initialUrl, onSave }: {
  platform: string; label: string; placeholder: string; initialUrl: string; onSave: (url: string) => void
}) {
  const [url, setUrl] = useState(initialUrl)
  const [saving, setSaving] = useState(false)
  const handleSave = async () => { setSaving(true); await onSave(url); setSaving(false) }
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-sm font-semibold flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>{label}</div>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder={placeholder}
        className="flex-1 text-sm px-3 py-2.5 focus:outline-none"
        style={{ border: '1px solid var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)' }}
        onFocus={focusIn} onBlur={focusOut} />
      <button onClick={handleSave} disabled={saving || url === initialUrl}
        className="btn-primary flex-shrink-0" style={{ fontSize: 13, padding: '8px 14px', opacity: (saving || url === initialUrl) ? 0.5 : 1 }}>
        {saving ? '...' : '儲存'}
      </button>
    </div>
  )
}

// ─── Tab 2: Password ───
function PasswordTab({ hasPassword }: { hasPassword: boolean }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: '兩次密碼不一致' }); return }
    if (newPassword.length < 6) { setMessage({ type: 'error', text: '密碼至少需要 6 個字元' }); return }

    setSaving(true)
    const res = await fetch('/api/account/password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: hasPassword ? currentPassword : undefined, newPassword }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setMessage({ type: 'error', text: data.error || '操作失敗' }); return }
    setMessage({ type: 'success', text: '密碼已更新' })
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
  }

  return (
    <div style={cardStyle}>
      <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>密碼管理</h2>
      {!hasPassword && (
        <div className="rounded-xl p-3 mb-4" style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
          <p className="text-sm" style={{ color: '#C2410C' }}>你尚未設定密碼。設定後可以使用密碼登入。</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {hasPassword && (
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>目前密碼</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>新密碼</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            required minLength={6} placeholder="至少 6 個字元" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>確認新密碼</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            required minLength={6} placeholder="再輸入一次" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        {message && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{
            color: message.type === 'success' ? '#16A34A' : '#E53E3E',
            background: message.type === 'success' ? '#F0FDF4' : '#FFF5F5',
            border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FED7D7'}`,
          }}>{message.text}</p>
        )}
        <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
          <Lock size={15} />{saving ? '處理中...' : hasPassword ? '更新密碼' : '設定密碼'}
        </button>
      </form>
    </div>
  )
}

// ─── Tab 3: Team ───
function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/team').then(r => r.json()).then(data => { setMembers(data); setLoading(false) })
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInviting(true)
    const res = await fetch('/api/team', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })
    const data = await res.json()
    setInviting(false)
    if (!res.ok) { setError(data.error || '邀請失敗'); return }
    setMembers(prev => [data, ...prev.filter(m => m.id !== data.id)])
    setEmail('')
  }

  const handleRemove = async (id: string) => {
    if (!confirm('確定移除此成員？')) return
    await fetch(`/api/team?id=${id}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    const res = await fetch(`/api/team/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMembers(prev => prev.map(m => m.id === id ? updated : m))
    }
  }

  const ROLE_LABELS: Record<string, string> = { owner: '擁有者', editor: '編輯者', viewer: '檢視者' }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>邀請成員</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>邀請團隊成員共同管理你的頁面</p>
        <form onSubmit={handleInvite} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="member@example.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div style={{ width: 120 }}>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>角色</label>
            <div className="relative">
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 } as React.CSSProperties}>
                <option value="editor">編輯者</option>
                <option value="viewer">檢視者</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
            </div>
          </div>
          <button type="submit" disabled={inviting} className="btn-primary flex-shrink-0"
            style={{ fontSize: 14, padding: '11px 18px', marginBottom: 0 }}>
            <Plus size={15} />{inviting ? '...' : '邀請'}
          </button>
        </form>
        {error && <p className="text-sm mt-2" style={{ color: '#E53E3E' }}>{error}</p>}
        <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--color-surface)', fontSize: 12, color: 'var(--color-text-muted)' }}>
          <strong>角色說明：</strong>編輯者可以管理區塊和頁面內容，檢視者只能查看數據分析。
        </div>
      </div>

      {/* Member list */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>成員列表</h2>
        {loading ? (
          <div className="py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>載入中...</div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">尚未邀請任何成員</p>
          </div>
        ) : (
          <div>
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between py-3"
                style={{ borderBottom: i < members.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{m.memberEmail}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(m.invitedAt).toLocaleDateString('zh-TW')} 加入 · {m.status === 'active' ? '已啟用' : '待接受'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg appearance-none pr-7"
                      style={{ border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <option value="editor">編輯者</option>
                      <option value="viewer">檢視者</option>
                    </select>
                    <ChevronDown size={10} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <button onClick={() => handleRemove(m.id)}
                    className="p-1.5 rounded-lg" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab 4: Notifications ───
function NotificationsTab() {
  const NOTIFICATIONS = [
    { label: '新訂閱通知', desc: '有人透過 Email 表單訂閱時通知你' },
    { label: '新訂單通知', desc: '收到新的數位商品訂單時通知你' },
    { label: '每週報告', desc: '每週一寄送過去 7 天的數據摘要' },
  ]

  return (
    <div style={cardStyle}>
      <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>通知偏好</h2>
      <div className="rounded-lg px-4 py-3 mb-5" style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>即將推出</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>Email 通知功能正在開發中，敬請期待。</p>
      </div>
      <div className="space-y-1" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        {NOTIFICATIONS.map(({ label, desc }) => (
          <div key={label} className="flex items-center justify-between py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
            <div className="relative w-11 h-6 rounded-full flex-shrink-0"
              style={{ background: '#D1D5DB', padding: 0 }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow" style={{ left: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab 5: Danger Zone ───
// ─── Tab: Billing ───
function BillingTab({ user }: { user: UserData }) {
  const [upgrading, setUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { alert(data.error || '發生錯誤'); setUpgrading(false) }
    } catch { setUpgrading(false) }
  }

  const planLabel = user.effectivePlan === 'pro'
    ? (user.plan === 'pro_trial' ? 'Pro（試用中）' : 'Pro')
    : 'Free'

  const planColor = user.effectivePlan === 'pro' ? 'var(--color-primary)' : 'var(--color-text-muted)'

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>目前方案</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{ background: user.effectivePlan === 'pro' ? 'var(--color-primary-light)' : '#F3F4F6', color: planColor }}>
            <Sparkles size={14} />
            {planLabel}
          </div>
        </div>

        {/* Trial info */}
        {user.plan === 'pro_trial' && user.trialDaysLeft > 0 && (
          <div className="rounded-xl px-4 py-3 mb-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p className="text-sm" style={{ color: '#92400E' }}>
              試用剩餘 <strong>{user.trialDaysLeft} 天</strong>，到期後將自動降為 Free 方案。升級 Pro 可保留所有進階功能。
            </p>
          </div>
        )}

        {/* Trial expired */}
        {user.plan === 'pro_trial' && user.trialDaysLeft === 0 && (
          <div className="rounded-xl px-4 py-3 mb-4" style={{ background: '#FFF5F5', border: '1px solid #FED7D7' }}>
            <p className="text-sm" style={{ color: '#E53E3E' }}>
              試用已到期。升級 Pro 方案以重新啟用進階功能。
            </p>
          </div>
        )}

        {/* Pro features list */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Pro 方案包含：</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {['自訂色彩與按鈕風格', '進階數據分析 + UTM', '無限分頁', '數位商品販售', '移除品牌標示'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <Sparkles size={12} style={{ color: 'var(--color-primary)' }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade button */}
        {user.plan !== 'pro' && (
          <button onClick={handleUpgrade} disabled={upgrading}
            className="btn-primary inline-flex items-center gap-2"
            style={{ padding: '12px 28px', opacity: upgrading ? 0.5 : 1 }}>
            <CreditCard size={16} />
            {upgrading ? '跳轉中...' : '升級 Pro — NT$99/月'}
          </button>
        )}

        {user.plan === 'pro' && (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            如需取消訂閱或管理付款方式，請聯繫 support@linkportal.cc
          </p>
        )}
      </div>
    </div>
  )
}

function DangerTab({ username }: { username: string }) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    const res = await fetch('/api/account/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${username}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const handleDelete = async () => {
    if (confirmUsername !== username) return
    setDeleting(true)
    const res = await fetch('/api/account', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmUsername }),
    })
    if (res.ok) router.push('/login')
    else setDeleting(false)
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <div style={{ ...cardStyle, borderColor: 'var(--color-border)' }}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>匯出資料</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>下載你所有的頁面、區塊、訂閱者和訂單資料（JSON 格式）</p>
        <button onClick={handleExport} disabled={exporting}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #C3D9FF', cursor: 'pointer' }}>
          <Download size={15} />{exporting ? '匯出中...' : '匯出全部資料'}
        </button>
      </div>

      {/* Delete account */}
      <div style={{ ...cardStyle, borderColor: '#FCA5A5' }}>
        <h2 className="font-bold mb-2" style={{ color: '#E53E3E', fontSize: 17 }}>刪除帳號</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          永久刪除你的帳號和所有相關資料。此操作<strong>無法復原</strong>。
        </p>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FCA5A5', cursor: 'pointer' }}>
            <Trash2 size={15} />刪除我的帳號
          </button>
        ) : (
          <div className="rounded-xl p-4" style={{ background: '#FFF5F5', border: '1px solid #FCA5A5' }}>
            <p className="text-sm mb-3" style={{ color: '#E53E3E' }}>
              請輸入你的用戶名稱 <strong>{username}</strong> 以確認刪除：
            </p>
            <input value={confirmUsername} onChange={e => setConfirmUsername(e.target.value)}
              placeholder={username} className="mb-3"
              style={{ ...inputStyle, borderColor: '#FCA5A5' }} />
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setConfirmUsername('') }}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                取消
              </button>
              <button onClick={handleDelete} disabled={deleting || confirmUsername !== username}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#E53E3E', color: 'white', border: 'none', cursor: 'pointer', opacity: (deleting || confirmUsername !== username) ? 0.5 : 1 }}>
                {deleting ? '刪除中...' : '確認刪除'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
