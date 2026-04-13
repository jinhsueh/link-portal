'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SuperAdminShell } from '@/components/super-admin/SuperAdminShell'
import { Search, ChevronLeft, ChevronRight, Ban, Shield } from 'lucide-react'

interface UserRow {
  id: string; username: string; email: string; name: string | null; avatarUrl: string | null
  plan: string; role: string; banned: boolean; createdAt: string
  _count: { pages: number; blocks: number; orders: number }
}

const PLAN_LABELS: Record<string, string> = { free: 'Free', pro_trial: 'Trial', pro: 'Pro' }
const PLAN_COLORS: Record<string, string> = { free: '#94A3B8', pro_trial: '#F59E0B', pro: '#10B981' }

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async (p = page, s = search, plan = planFilter) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '20' })
    if (s) params.set('search', s)
    if (plan) params.set('plan', plan)
    const res = await fetch(`/api/super-admin/users?${params}`)
    if (res.status === 401) { router.push('/login'); return }
    if (res.status === 403) { router.push('/admin'); return }
    const data = await res.json()
    setUsers(data.users)
    setTotal(data.total)
    setTotalPages(data.totalPages)
    setPage(data.page)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, []) // eslint-disable-line

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(1, search, planFilter)
  }

  return (
    <SuperAdminShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
            用戶管理 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>({total})</span>
          </h1>
        </div>

        {/* Search + filter */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋 username / email / name"
              className="w-full" style={{ padding: '10px 12px 10px 36px', fontSize: 14, border: '1px solid var(--color-border)', borderRadius: 10, background: 'white', color: 'var(--color-text-primary)', outline: 'none' }} />
          </div>
          <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); fetchUsers(1, search, e.target.value) }}
            style={{ padding: '10px 14px', fontSize: 14, border: '1px solid var(--color-border)', borderRadius: 10, background: 'white', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
            <option value="">全部方案</option>
            <option value="free">Free</option>
            <option value="pro_trial">Pro Trial</option>
            <option value="pro">Pro</option>
          </select>
          <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>搜尋</button>
        </form>

        {/* Table */}
        <div className="card overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {['用戶', '方案', '頁面', '區塊', '訂單', '註冊日期', '狀態'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 12, textTransform: 'uppercase' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>載入中...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>無結果</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} onClick={() => router.push(`/super-admin/users/${u.id}`)}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                          {(u.name || u.username)[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-1" style={{ color: 'var(--color-text-primary)' }}>
                            {u.username}
                            {u.role === 'admin' && <Shield size={12} style={{ color: '#ED8936' }} />}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: `${PLAN_COLORS[u.plan]}20`, color: PLAN_COLORS[u.plan] }}>
                        {PLAN_LABELS[u.plan] || u.plan}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{u._count.pages}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{u._count.blocks}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{u._count.orders}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>
                      {new Date(u.createdAt).toLocaleDateString('zh-TW')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.banned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#E53E3E' }}>
                          <Ban size={12} />封鎖
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: '#10B981' }}>正常</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>第 {page} / {totalPages} 頁</span>
              <div className="flex gap-2">
                <button onClick={() => fetchUsers(page - 1)} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1, background: 'white' }}>
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1, background: 'white' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminShell>
  )
}
