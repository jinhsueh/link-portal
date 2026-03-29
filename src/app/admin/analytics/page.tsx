'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, Settings, BarChart2, ExternalLink, LogOut, TrendingUp, Eye, MousePointer, Users, ShoppingBag } from 'lucide-react'

interface BlockStat { id: string; title?: string | null; type: string; clicks: number; views: number }
interface Stats { totalBlocks: number; totalClicks: number; totalViews: number; blocks: BlockStat[] }

export default function AnalyticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me').then(async res => {
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setUsername(data.username)
      const allBlocks: BlockStat[] = data.pages.flatMap((p: { blocks: BlockStat[] }) => p.blocks)
      setStats({
        totalBlocks: allBlocks.length,
        totalClicks: allBlocks.reduce((s: number, b: BlockStat) => s + b.clicks, 0),
        totalViews: allBlocks.reduce((s: number, b: BlockStat) => s + b.views, 0),
        blocks: allBlocks.sort((a: BlockStat, b: BlockStat) => b.clicks - a.clicks),
      })
      setLoading(false)
    })
  }, [router])

  const navLinkStyle = (active = false) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
    fontSize: 14, fontWeight: 500, textDecoration: 'none', border: 'none', cursor: 'pointer',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary-light)' : 'none',
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  )

  const METRIC_CARDS = [
    { icon: MousePointer, label: '總點擊數', value: stats?.totalClicks ?? 0, color: 'var(--color-primary)' },
    { icon: Eye, label: '總曝光數', value: stats?.totalViews ?? 0, color: '#38A169' },
    { icon: Users, label: '區塊數量', value: stats?.totalBlocks ?? 0, color: '#D69E2E' },
    {
      icon: TrendingUp, label: '平均 CTR',
      value: stats && stats.totalViews > 0 ? `${((stats.totalClicks / stats.totalViews) * 100).toFixed(1)}%` : '—',
      color: '#805AD5',
    },
  ]

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
              <a href="/admin/analytics" style={navLinkStyle(true)}><BarChart2 size={14} />數據分析</a>
              <a href="/admin/orders" style={navLinkStyle()}><ShoppingBag size={14} />訂單管理</a>
              <a href="/admin/settings" style={navLinkStyle()}><Settings size={14} />設定</a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/${username}`} target="_blank" rel="noopener noreferrer" style={{ ...navLinkStyle(), display: 'flex' }}>
              <ExternalLink size={14} /><span className="hidden sm:inline">預覽</span>
            </a>
            <button onClick={async () => { await fetch('/api/auth', { method: 'DELETE' }); router.push('/login') }} style={navLinkStyle()}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-bold text-lg mb-6" style={{ color: 'var(--color-text-primary)' }}>數據分析</h1>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRIC_CARDS.map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${color}18` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <p className="font-extrabold text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Block ranking */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>區塊排行</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>依點擊數排序</p>
          </div>
          {stats?.blocks.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">還沒有任何數據</p>
            </div>
          ) : (
            <div>
              {stats?.blocks.map((block, i) => {
                const maxClicks = stats.blocks[0]?.clicks || 1
                const pct = maxClicks > 0 ? (block.clicks / maxClicks) * 100 : 0
                return (
                  <div key={block.id} style={{ padding: '16px 24px', borderBottom: i < (stats.blocks.length - 1) ? '1px solid var(--color-border)' : 'none' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                          style={{ background: i === 0 ? 'var(--color-primary)' : 'var(--color-surface)', color: i === 0 ? 'white' : 'var(--color-text-muted)' }}>
                          {i + 1}
                        </span>
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {block.title || block.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span><span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{block.clicks}</span> 點擊</span>
                        <span><span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{block.views}</span> 曝光</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-surface)', borderRadius: 9999 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: 'var(--gradient-blue)', borderRadius: 9999, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
