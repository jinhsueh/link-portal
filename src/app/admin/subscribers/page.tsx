'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { Mail, Download, Trash2, Users, RefreshCw } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  source: string
  createdAt: string
}

export default function SubscribersPage() {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [effectivePlan, setEffectivePlan] = useState<'free' | 'pro'>('free')
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const [meRes, subRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/subscribers'),
      ])
      if (meRes.status === 401) { router.push('/login'); return }
      const me = await meRes.json()
      setUsername(me.username); setRole(me.role); setEffectivePlan(me.effectivePlan); setTrialDaysLeft(me.trialDaysLeft)
      const data = await subRes.json()
      setSubscribers(data.subscribers ?? [])
    } catch { /* */ }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此訂閱者？')) return
    await fetch(`/api/subscribers?id=${id}`, { method: 'DELETE' })
    setSubscribers(prev => prev.filter(s => s.id !== id))
  }

  const handleExportCSV = () => {
    const header = 'email,source,subscribed_at'
    const rows = subscribers.map(s =>
      `${s.email},${s.source},${new Date(s.createdAt).toISOString()}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <AdminShell username={username} role={role} effectivePlan={effectivePlan} trialDaysLeft={trialDaysLeft}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  return (
    <AdminShell username={username} role={role} effectivePlan={effectivePlan} trialDaysLeft={trialDaysLeft}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>訂閱名單</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              透過 Email 表單蒐集的訂閱者
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(true)} disabled={refreshing}
              className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
              style={{ background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            {subscribers.length > 0 && (
              <button onClick={handleExportCSV}
                className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5"
                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', border: '1px solid #C3D9FF', cursor: 'pointer' }}>
                <Download size={14} />匯出 CSV
              </button>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'var(--color-primary-light)' }}>
              <Users size={17} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="font-extrabold text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              {subscribers.length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>總訂閱人數</p>
          </div>
          <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: '#C6F6D518' }}>
              <Mail size={17} style={{ color: '#38A169' }} />
            </div>
            <p className="font-extrabold text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              {subscribers.filter(s => {
                const d = new Date(s.createdAt)
                const now = new Date()
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>本月新增</p>
          </div>
        </div>

        {/* Subscriber list */}
        {subscribers.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: 'white', border: '2px dashed var(--color-border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--color-primary-light)' }}>
              <Mail size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>還沒有訂閱者</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              在頁面中加入「Email 表單」區塊開始蒐集粉絲名單
            </p>
            <Link href="/admin" className="btn-primary inline-flex mt-5" style={{ fontSize: 14, padding: '10px 22px' }}>
              去新增區塊
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            {/* Table header */}
            <div className="grid gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider"
              style={{
                gridTemplateColumns: '1fr 100px 120px 50px',
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-border)',
              }}>
              <span>Email</span>
              <span>來源</span>
              <span>訂閱時間</span>
              <span></span>
            </div>

            {subscribers.map((sub, i) => (
              <div key={sub.id}
                className="grid gap-4 px-5 py-4 items-center text-sm transition-colors"
                style={{
                  gridTemplateColumns: '1fr 100px 120px 50px',
                  borderBottom: i < subscribers.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                <p className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{sub.email}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  {sub.source === 'email_form' ? '表單' : sub.source}
                </span>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(sub.createdAt).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
                <button onClick={() => handleDelete(sub.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
