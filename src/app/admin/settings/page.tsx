'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Save, Camera, X, Download, User, Lock, Bell, AlertTriangle, Trash2, Plus, Users, ChevronDown, CreditCard, Sparkles } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { PLAN_PRICING } from '@/lib/plan'
import { useDict } from '@/components/i18n/DictProvider'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'

const TAB_IDS = ['account', 'billing', 'password', 'notifications', 'danger'] as const
const TAB_ICONS = { account: User, billing: CreditCard, password: Lock, notifications: Bell, danger: AlertTriangle } as const

type TabId = typeof TAB_IDS[number]

interface TeamMember { id: string; memberEmail: string; role: string; status: string; invitedAt: string }
interface UserData {
  id: string; username: string; email: string; name?: string; bio?: string; avatarUrl?: string
  createdAt: string; hasPassword: boolean; role: string
  plan: string; effectivePlan: 'free' | 'pro' | 'premium'; trialEndsAt?: string; trialDaysLeft: number
  notifyNewSubscriber: boolean; notifyNewOrder: boolean; notifyWeeklyReport: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { dict } = useDict()
  const s = dict.admin.settings
  const TABS = TAB_IDS.map(id => ({ id, label: s.nav[id as keyof typeof s.nav], icon: TAB_ICONS[id] }))
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
    <AdminShell username={user?.username} role={user?.role} effectivePlan={user?.effectivePlan} trialDaysLeft={user?.trialDaysLeft}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  return (
    <AdminShell username={user?.username} role={user?.role} effectivePlan={user?.effectivePlan} trialDaysLeft={user?.trialDaysLeft}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-bold text-xl mb-6" style={{ color: 'var(--color-text-primary)' }}>{s.pageTitle}</h1>

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
  const { dict, locale } = useDict()
  const a = dict.admin.settings.account
  const qr = dict.admin.settings.qr
  const [email, setEmail] = useState(user.email ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrReady, setQrReady] = useState(false)
  const pageUrl = `https://link-portal-eight.vercel.app/${user.username}`

  // Username editing — kept separate from email save because changing the
  // URL has bigger consequences (old links 404, share images cached).
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user.username)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved' | 'same'>('idle')
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  useEffect(() => {
    if (!user.username) return
    import('qrcode').then(QRCode => {
      QRCode.toCanvas(canvasRef.current, pageUrl, {
        width: 200, margin: 2, color: { dark: '#1A1A2E', light: '#FFFFFF' },
      }, () => setQrReady(true))
    })
  }, [user.username, pageUrl])

  // Live availability check while editing username.
  useEffect(() => {
    if (!editingUsername) return
    const u = newUsername.trim().toLowerCase()
    if (u === user.username) { setUsernameStatus('same'); return }
    if (!u) { setUsernameStatus('idle'); return }
    if (!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/.test(u) || u.length < 3 || u.length > 30) {
      setUsernameStatus('invalid'); return
    }
    setUsernameStatus('checking')
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(u)}`)
        const data = await res.json()
        if (data.available) setUsernameStatus('available')
        else if (data.reason === 'reserved') setUsernameStatus('reserved')
        else setUsernameStatus('taken')
      } catch { setUsernameStatus('idle') }
    }, 350)
    return () => clearTimeout(t)
  }, [newUsername, editingUsername, user.username])

  const handleSaveUsername = async () => {
    const u = newUsername.trim().toLowerCase()
    if (u === user.username) { setEditingUsername(false); return }
    if (!confirm(a.changeUsernameConfirm.replace(/\{old\}/g, user.username).replace('{new}', u))) return
    setUsernameSaving(true)
    setUsernameError('')
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u }),
      })
      const updated = await res.json()
      if (!res.ok) {
        setUsernameError(updated.error ?? a.changeFailed)
      } else {
        onUpdate(updated)
        setEditingUsername(false)
      }
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : a.networkError)
    }
    setUsernameSaving(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/me', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const updated = await res.json()
    onUpdate(updated)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-5" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{a.sectionTitle}</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>{a.joinedAt}</label>
            <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{new Date(user.createdAt).toLocaleDateString(locale)}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>{a.usernameLabel}</label>
            {!editingUsername ? (
              <div className="flex items-center gap-2">
                <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{user.username}</p>
                <button onClick={() => { setEditingUsername(true); setNewUsername(user.username); setUsernameError(''); setUsernameStatus('same') }}
                  className="text-xs font-semibold"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: 0 }}>
                  {a.changeUsername}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center overflow-hidden" style={{
                  border: `1px solid ${
                    usernameStatus === 'available' ? '#10B981'
                    : ['taken', 'invalid', 'reserved'].includes(usernameStatus) ? '#EF4444'
                    : 'var(--color-border)'
                  }`,
                  borderRadius: 8,
                }}>
                  <span className="px-2 py-1.5 text-xs border-r"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
                    beam.io/
                  </span>
                  <input value={newUsername}
                    onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                    minLength={3} maxLength={30}
                    className="flex-1 px-2 py-1.5 text-xs focus:outline-none"
                    style={{ background: 'white', color: 'var(--color-text-primary)' }} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleSaveUsername}
                    disabled={usernameSaving || !['available', 'same'].includes(usernameStatus)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{
                      background: ['available', 'same'].includes(usernameStatus) ? 'var(--color-primary)' : '#E5E7EB',
                      color: 'white', border: 'none',
                      cursor: ['available', 'same'].includes(usernameStatus) && !usernameSaving ? 'pointer' : 'default',
                      opacity: usernameSaving ? 0.6 : 1,
                    }}>
                    {usernameSaving ? a.saveUsernameSaving : a.saveUsername}
                  </button>
                  <button onClick={() => { setEditingUsername(false); setUsernameError('') }}
                    className="text-xs font-semibold"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                    {a.cancel}
                  </button>
                </div>
                {usernameStatus === 'checking' && (
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.checking}</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-xs" style={{ color: '#10B981' }}>{a.available}</p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{a.taken}</p>
                )}
                {usernameStatus === 'reserved' && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{a.reserved}</p>
                )}
                {usernameStatus === 'invalid' && newUsername.length >= 3 && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{a.invalid}</p>
                )}
                {usernameError && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{usernameError}</p>
                )}
                {newUsername !== user.username && usernameStatus === 'available' && (
                  <p className="text-xs" style={{ color: '#B45309', background: '#FEF3C7', border: '1px solid #FCD34D', padding: '6px 8px', borderRadius: 6 }}>
                    {a.warnChange.replace('{old}', user.username)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{a.emailLabel}</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
          <Save size={15} />{saved ? a.savedShort : saving ? a.savingShort : a.saveEmail}
        </button>
      </div>

      {/* Language picker — affects the whole admin + public chrome via the
          lp_locale cookie. Reuses the same dropdown component used on the
          landing pages; refresh()-based navigation when we're not on a
          locale-prefixed route keeps the user on /admin/settings. */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>
          {a.languageSectionTitle}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {a.languageSectionHint}
        </p>
        <LanguageSwitcher />
      </div>

      {/* QR Code */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>QR Code</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{qr.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 rounded-xl" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 8 }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{pageUrl}</p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>{qr.downloadHint}</p>
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
                <Download size={14} />{qr.downloadBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab 2: Password ───
function PasswordTab({ hasPassword }: { hasPassword: boolean }) {
  const { dict } = useDict()
  const p = dict.admin.settings.password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (newPassword !== confirmPassword) { setMessage({ type: 'error', text: p.mismatch }); return }
    if (newPassword.length < 6) { setMessage({ type: 'error', text: p.tooShort }); return }

    setSaving(true)
    const res = await fetch('/api/account/password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: hasPassword ? currentPassword : undefined, newPassword }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setMessage({ type: 'error', text: data.error || p.failed }); return }
    setMessage({ type: 'success', text: p.updated })
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
  }

  return (
    <div style={cardStyle}>
      <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{p.sectionTitle}</h2>
      {!hasPassword && (
        <div className="rounded-xl p-3 mb-4" style={{ background: '#FFF7ED', border: '1px solid #FDBA74' }}>
          <p className="text-sm" style={{ color: '#C2410C' }}>{p.noPasswordNote}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {hasPassword && (
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{p.currentLabel}</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              required style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{p.newLabel}</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            required minLength={6} placeholder={p.newPlaceholder} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{p.confirmLabel}</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            required minLength={6} placeholder={p.confirmPlaceholder} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        {message && (
          <p className="text-sm px-4 py-3 rounded-xl" style={{
            color: message.type === 'success' ? '#16A34A' : '#E53E3E',
            background: message.type === 'success' ? '#F0FDF4' : '#FFF5F5',
            border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FED7D7'}`,
          }}>{message.text}</p>
        )}
        <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
          <Lock size={15} />{saving ? p.submitting : hasPassword ? p.submitUpdate : p.submitCreate}
        </button>
      </form>
    </div>
  )
}

// ─── Tab 3: Team ───
function TeamTab() {
  const { dict } = useDict()
  const tm = dict.admin.settings.team
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
    if (!res.ok) { setError(data.error || tm.inviteFailed); return }
    setMembers(prev => [data, ...prev.filter(m => m.id !== data.id)])
    setEmail('')
  }

  const handleRemove = async (id: string) => {
    if (!confirm(tm.removeConfirm)) return
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

  // ROLE_LABELS no longer needed — rendered via dict at the option level.

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{tm.inviteTitle}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{tm.inviteHint}</p>
        <form onSubmit={handleInvite} className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="member@example.com" style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div style={{ width: 120 }}>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{tm.roleLabel}</label>
            <div className="relative">
              <select value={role} onChange={e => setRole(e.target.value)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 32 } as React.CSSProperties}>
                <option value="editor">{tm.roleEditor}</option>
                <option value="viewer">{tm.roleViewer}</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
            </div>
          </div>
          <button type="submit" disabled={inviting} className="btn-primary flex-shrink-0"
            style={{ fontSize: 14, padding: '11px 18px', marginBottom: 0 }}>
            <Plus size={15} />{inviting ? tm.inviting : tm.invite}
          </button>
        </form>
        {error && <p className="text-sm mt-2" style={{ color: '#E53E3E' }}>{error}</p>}
        <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--color-surface)', fontSize: 12, color: 'var(--color-text-muted)' }}
          dangerouslySetInnerHTML={{ __html: tm.rolesExplain }} />
      </div>

      {/* Member list */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{tm.listTitle}</h2>
        {loading ? (
          <div className="py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>{tm.loading}</div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">{tm.empty}</p>
          </div>
        ) : (
          <div>
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between py-3"
                style={{ borderBottom: i < members.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{m.memberEmail}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {tm.memberJoinedTpl
                      .replace('{date}', new Date(m.invitedAt).toLocaleDateString())
                      .replace('{status}', m.status === 'active' ? tm.statusActive : tm.statusPending)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg appearance-none pr-7"
                      style={{ border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                      <option value="editor">{tm.roleEditor}</option>
                      <option value="viewer">{tm.roleViewer}</option>
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
  const { dict } = useDict()
  const n = dict.admin.settings.notifications
  const NOTIFICATIONS = n.items

  return (
    <div style={cardStyle}>
      <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{n.sectionTitle}</h2>
      <div className="rounded-lg px-4 py-3 mb-5" style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{n.comingSoonTitle}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{n.comingSoonHint}</p>
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

// ─── Tab: Billing ───
function BillingTab({ user }: { user: UserData }) {
  const { dict } = useDict()
  const b = dict.admin.settings.billing
  const searchParams = useSearchParams()
  const [upgrading, setUpgrading] = useState<'pro' | 'premium' | null>(null)
  const [interval, setIntervalState] = useState<'monthly' | 'annual'>('monthly')

  const handleUpgrade = async (tier: 'pro' | 'premium') => {
    setUpgrading(tier)
    try {
      const res = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, interval }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { alert(data.error || b.planError); setUpgrading(null) }
    } catch { setUpgrading(null) }
  }

  // Auto-trigger from ?upgrade=pro|premium querystring
  const upgradeParam = searchParams?.get('upgrade')
  useEffect(() => {
    if (upgradeParam === 'pro' && user.effectivePlan === 'free') handleUpgrade('pro')
    if (upgradeParam === 'premium' && user.effectivePlan !== 'premium') handleUpgrade('premium')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgradeParam])

  const planLabel =
    user.effectivePlan === 'premium' ? 'Premium'
    : user.effectivePlan === 'pro' ? (user.plan === 'pro_trial' ? b.planProTrial : 'Pro')
    : 'Free'

  const planBadgeStyle = {
    background:
      user.effectivePlan === 'premium' ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' :
      user.effectivePlan === 'pro' ? 'var(--color-primary-light)' :
      '#F3F4F6',
    color:
      user.effectivePlan === 'premium' ? '#F6E05E' :
      user.effectivePlan === 'pro' ? 'var(--color-primary)' :
      'var(--color-text-muted)',
  } as const

  const proPrice = interval === 'monthly' ? PLAN_PRICING.pro.monthly : PLAN_PRICING.pro.annual
  const premiumPrice = interval === 'monthly' ? PLAN_PRICING.premium.monthly : PLAN_PRICING.premium.annual

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div style={cardStyle}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{b.currentPlanTitle}</h2>
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
            style={planBadgeStyle}>
            <Sparkles size={14} />
            {planLabel}
          </div>
        </div>

        {/* Trial info */}
        {user.plan === 'pro_trial' && user.trialDaysLeft > 0 && (
          <div className="rounded-xl px-4 py-3 mb-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
            <p className="text-sm" style={{ color: '#92400E' }}
              dangerouslySetInnerHTML={{ __html: b.trialRemainingTpl.replace('{n}', String(user.trialDaysLeft)) }} />
          </div>
        )}

        {user.effectivePlan === 'premium' && (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {b.supportContact}
          </p>
        )}
      </div>

      {/* Plan picker (hide if already premium) */}
      {user.effectivePlan !== 'premium' && (
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{b.upgradeTitle}</h2>
            <div className="inline-flex rounded-lg p-1" style={{ background: '#F3F4F6' }}>
              <button onClick={() => setIntervalState('monthly')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold"
                style={{
                  background: interval === 'monthly' ? 'white' : 'transparent',
                  color: interval === 'monthly' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  boxShadow: interval === 'monthly' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                }}>{b.billingMonthly}</button>
              <button onClick={() => setIntervalState('annual')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold"
                style={{
                  background: interval === 'annual' ? 'white' : 'transparent',
                  color: interval === 'annual' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  boxShadow: interval === 'annual' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                }}>{b.billingYearly} <span style={{ color: '#22543D' }}>{b.yearlyDiscount}</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro card */}
            {user.effectivePlan !== 'pro' && (
              <div className="rounded-xl p-5" style={{ border: '2px solid var(--color-primary)', background: 'var(--color-primary-light)' }}>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-bold text-2xl" style={{ color: 'var(--color-primary)' }}>Pro</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>{b.proTag}</span>
                </div>
                <div className="mb-3">
                  <span className="font-bold text-3xl" style={{ color: 'var(--color-text-primary)' }}>NT${proPrice}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{b.perMonth}</span>
                </div>
                <ul className="space-y-1.5 text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                  {b.proFeatures.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <button onClick={() => handleUpgrade('pro')} disabled={upgrading !== null}
                  className="w-full rounded-lg py-2.5 font-bold text-sm"
                  style={{ background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', opacity: upgrading ? 0.5 : 1 }}>
                  {upgrading === 'pro' ? b.redirecting : b.upgradeProBtn.replace('{price}', String(proPrice))}
                </button>
              </div>
            )}

            {/* Premium card */}
            <div className="rounded-xl p-5" style={{ border: '2px solid #1A202C', background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)', color: 'white' }}>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-bold text-2xl" style={{ color: '#F6E05E' }}>Premium</span>
                <span className="text-xs font-semibold opacity-70">{b.premiumTag}</span>
              </div>
              <div className="mb-3">
                <span className="font-bold text-3xl">NT${premiumPrice}</span>
                <span className="text-sm opacity-70">{b.perMonth}</span>
              </div>
              <ul className="space-y-1.5 text-sm mb-5 opacity-90">
                {b.premiumFeatures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <button onClick={() => handleUpgrade('premium')} disabled={upgrading !== null}
                className="w-full rounded-lg py-2.5 font-bold text-sm"
                style={{ background: '#F6E05E', color: '#1A202C', border: 'none', cursor: 'pointer', opacity: upgrading ? 0.5 : 1 }}>
                {upgrading === 'premium' ? b.redirecting : b.upgradePremiumBtn.replace('{price}', String(premiumPrice))}
              </button>
            </div>
          </div>

          <p className="text-xs mt-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
            {b.compareLinkPrefix}<Link href="/pricing" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{b.compareLinkText}</Link>
          </p>
        </div>
      )}
    </div>
  )
}

function DangerTab({ username }: { username: string }) {
  const { dict } = useDict()
  const ex = dict.admin.settings.export
  const dg = dict.admin.settings.danger
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
        <h2 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{ex.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{ex.subtitle}</p>
        <button onClick={handleExport} disabled={exporting}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #C3D9FF', cursor: 'pointer' }}>
          <Download size={15} />{exporting ? ex.running : ex.btn}
        </button>
      </div>

      {/* Delete account */}
      <div style={{ ...cardStyle, borderColor: '#FCA5A5' }}>
        <h2 className="font-bold mb-2" style={{ color: '#E53E3E', fontSize: 17 }}>{dg.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}
          dangerouslySetInnerHTML={{ __html: dg.subtitle }} />

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FCA5A5', cursor: 'pointer' }}>
            <Trash2 size={15} />{dg.btn}
          </button>
        ) : (
          <div className="rounded-xl p-4" style={{ background: '#FFF5F5', border: '1px solid #FCA5A5' }}>
            <p className="text-sm mb-3" style={{ color: '#E53E3E' }}>
              {dg.confirmPrefix}<strong>{username}</strong>{dg.confirmSuffix}
            </p>
            <input value={confirmUsername} onChange={e => setConfirmUsername(e.target.value)}
              placeholder={username} className="mb-3"
              style={{ ...inputStyle, borderColor: '#FCA5A5' }} />
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setConfirmUsername('') }}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                {dg.cancel}
              </button>
              <button onClick={handleDelete} disabled={deleting || confirmUsername !== username}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#E53E3E', color: 'white', border: 'none', cursor: 'pointer', opacity: (deleting || confirmUsername !== username) ? 0.5 : 1 }}>
                {deleting ? dg.deleting : dg.confirmBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
