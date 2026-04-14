'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SuperAdminShell } from '@/components/super-admin/SuperAdminShell'
import { ArrowLeft, Ban, Shield, FileText, ShoppingBag, Mail } from 'lucide-react'
import { fromStripeAmount } from '@/lib/stripe'
import { use } from 'react'

interface UserDetail {
  id: string; username: string; email: string; name: string | null; bio: string | null; avatarUrl: string | null
  plan: string; trialEndsAt: string | null; stripeCustomerId: string | null; stripeSubId: string | null
  role: string; banned: boolean; bannedAt: string | null; bannedReason: string | null
  createdAt: string; updatedAt: string
  pages: { id: string; name: string; slug: string; _count: { blocks: number } }[]
  _count: { blocks: number; orders: number; subscribers: number }
  revenueByCurrency: Record<string, number>
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchUser = async () => {
    const res = await fetch(`/api/super-admin/users/${id}`)
    if (res.status === 401) { router.push('/login'); return }
    if (res.status === 403) { router.push('/admin'); return }
    const data = await res.json()
    setUser(data)
  }

  useEffect(() => { fetchUser() }, []) // eslint-disable-line

  const updateUser = async (data: Record<string, unknown>) => {
    setSaving(true)
    await fetch(`/api/super-admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchUser()
    setSaving(false)
  }

  if (!user) return (
    <SuperAdminShell>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: '#FEEBC8', borderTopColor: '#ED8936' }} />
      </div>
    </SuperAdminShell>
  )

  const revenue = Object.entries(user.revenueByCurrency)
    .map(([c, a]) => `${c.toUpperCase()} ${fromStripeAmount(a).toLocaleString()}`)
    .join(' / ') || 'NT$0'

  return (
    <SuperAdminShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.push('/super-admin/users')} className="flex items-center gap-1 text-sm mb-6"
          style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={14} />返回用戶列表
        </button>

        {/* Profile card */}
        <div className="card mb-6" style={{ padding: 24 }}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                (user.name || user.username)[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{user.name || user.username}</h2>
                {user.role === 'admin' && <Shield size={14} style={{ color: '#ED8936' }} />}
                {user.banned && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold" style={{ background: '#FFF5F5', color: '#E53E3E' }}><Ban size={10} />封鎖中</span>}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>@{user.username} &middot; {user.email}</p>
              {user.bio && <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{user.bio}</p>}
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                註冊：{new Date(user.createdAt).toLocaleDateString('zh-TW')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: '頁面', value: user.pages.length, icon: FileText },
            { label: '區塊', value: user._count.blocks, icon: FileText },
            { label: '訂單', value: user._count.orders, icon: ShoppingBag },
            { label: '訂閱者', value: user._count.subscribers, icon: Mail },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card text-center" style={{ padding: 16 }}>
              <Icon size={16} style={{ color: 'var(--color-text-muted)', margin: '0 auto 4px' }} />
              <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          收入：<span className="font-semibold">{revenue}</span>
        </p>

        {/* Actions */}
        <div className="card mb-6" style={{ padding: 24 }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)', fontSize: 16 }}>操作</h3>
          <div className="flex flex-wrap gap-3">
            {/* Plan change */}
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>方案：</span>
              <select value={user.plan} onChange={e => updateUser({ plan: e.target.value })} disabled={saving}
                style={{ padding: '8px 12px', fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>
                <option value="free">Free</option>
                <option value="pro_trial">Pro Trial</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            {/* Ban / Unban */}
            {user.banned ? (
              <button onClick={() => updateUser({ banned: false })} disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#F0FFF4', color: '#10B981', border: '1px solid #C6F6D5', cursor: 'pointer' }}>
                解除封鎖
              </button>
            ) : (
              <button onClick={() => { if (confirm('確定要封鎖此用戶？')) updateUser({ banned: true, bannedReason: '管理員手動封鎖' }) }}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: '#FFF5F5', color: '#E53E3E', border: '1px solid #FCA5A5', cursor: 'pointer' }}>
                <Ban size={14} />封鎖用戶
              </button>
            )}
          </div>
        </div>

        {/* Pages list */}
        <div className="card" style={{ padding: 24 }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--color-text-primary)', fontSize: 16 }}>頁面 ({user.pages.length})</h3>
          {user.pages.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>無頁面</p>
          ) : (
            <div className="space-y-2">
              {user.pages.map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{p.name}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>/{p.slug}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{p._count.blocks} 區塊</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SuperAdminShell>
  )
}
