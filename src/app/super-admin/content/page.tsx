'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SuperAdminShell } from '@/components/super-admin/SuperAdminShell'
import { Search, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'

interface BlockItem {
  id: string; type: string; title: string | null; active: boolean; clicks: number; views: number
  createdAt: string; user: { username: string; email: string }; page: { name: string; slug: string }
}

interface PageItem {
  id: string; name: string; slug: string; createdAt: string
  user: { username: string; email: string }; _count: { blocks: number }
}

export default function ContentPage() {
  const router = useRouter()
  const [type, setType] = useState<'blocks' | 'pages'>('blocks')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- items are BlockItem[] or PageItem[] depending on `type`, cast at render
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async (p = page, t = type, s = search) => {
    setLoading(true)
    const params = new URLSearchParams({ type: t, page: String(p), limit: '20' })
    if (s) params.set('search', s)
    const res = await fetch(`/api/super-admin/content?${params}`)
    if (res.status === 401) { router.push('/login'); return }
    if (res.status === 403) { router.push('/admin'); return }
    const data = await res.json()
    setItems(data.items)
    setTotal(data.total)
    setPage(data.page)
    setTotalPages(data.totalPages)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, []) // eslint-disable-line

  const toggleActive = async (blockId: string, active: boolean) => {
    await fetch(`/api/super-admin/content/${blockId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
    fetchData()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData(1, type, search)
  }

  return (
    <SuperAdminShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-bold text-xl mb-6" style={{ color: 'var(--color-text-primary)' }}>
          內容審核 <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>({total})</span>
        </h1>

        {/* Type toggle + search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            {(['blocks', 'pages'] as const).map(t => (
              <button key={t} onClick={() => { setType(t); fetchData(1, t, search) }}
                className="px-4 py-2 text-sm font-semibold"
                style={{
                  background: type === t ? '#ED8936' : 'white',
                  color: type === t ? 'white' : 'var(--color-text-secondary)',
                  border: 'none', cursor: 'pointer',
                }}>
                {t === 'blocks' ? '區塊' : '頁面'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋標題 / 類型"
                className="w-full" style={{ padding: '10px 12px 10px 36px', fontSize: 14, border: '1px solid var(--color-border)', borderRadius: 10, background: 'white', outline: 'none' }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>搜尋</button>
          </form>
        </div>

        {/* Table */}
        <div className="card overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {type === 'blocks'
                    ? ['標題', '類型', '擁有者', '頁面', '點擊/瀏覽', '狀態', '操作'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 12 }}>{h}</th>
                      ))
                    : ['名稱', 'Slug', '擁有者', '區塊數', '建立日期'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 12 }}>{h}</th>
                      ))
                  }
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>載入中...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>無結果</td></tr>
                ) : type === 'blocks' ? items.map((b: BlockItem) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{b.title || '(無標題)'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>{b.type}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>@{b.user.username}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{b.page.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{b.clicks} / {b.views}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {b.active
                        ? <span className="text-xs font-bold" style={{ color: '#10B981' }}>啟用</span>
                        : <span className="text-xs font-bold" style={{ color: '#E53E3E' }}>停用</span>
                      }
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleActive(b.id, !b.active)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: b.active ? '#FFF5F5' : '#F0FFF4',
                          color: b.active ? '#E53E3E' : '#10B981',
                          border: `1px solid ${b.active ? '#FCA5A5' : '#C6F6D5'}`,
                          cursor: 'pointer',
                        }}>
                        {b.active ? <><EyeOff size={12} />停用</> : <><Eye size={12} />啟用</>}
                      </button>
                    </td>
                  </tr>
                )) : items.map((p: PageItem) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>/{p.slug}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>@{p.user.username}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>{p._count.blocks}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString('zh-TW')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>第 {page} / {totalPages} 頁</span>
              <div className="flex gap-2">
                <button onClick={() => fetchData(page - 1)} disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1, background: 'white' }}>
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => fetchData(page + 1)} disabled={page >= totalPages}
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
