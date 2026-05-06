'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { TrendingUp, Eye, MousePointer, Users } from 'lucide-react'

interface BlockStat { id: string; title?: string | null; type: string; clicks: number; views: number }
interface DailyPoint { date: string; clicks: number }

export default function AnalyticsPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('')
  const [effectivePlan, setEffectivePlan] = useState<'free' | 'pro' | 'premium'>('free')
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [blocks, setBlocks] = useState<BlockStat[]>([])
  const [daily, setDaily] = useState<DailyPoint[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [totalBlocks, setTotalBlocks] = useState(0)
  const [referrers, setReferrers] = useState<{ source: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/me'),
      fetch('/api/analytics'),
    ]).then(async ([meRes, analyticsRes]) => {
      if (meRes.status === 401) { router.push('/login'); return }
      const me = await meRes.json()
      setUsername(me.username); setRole(me.role); setEffectivePlan(me.effectivePlan); setTrialDaysLeft(me.trialDaysLeft)
      const allBlocks: BlockStat[] = me.pages.flatMap((p: { blocks: BlockStat[] }) => p.blocks)
      setBlocks(allBlocks.sort((a, b) => b.clicks - a.clicks))
      setTotalBlocks(allBlocks.length)

      const analytics = await analyticsRes.json()
      setDaily(analytics.daily ?? [])
      setTotalClicks(analytics.totalClicks ?? 0)
      setTotalViews(analytics.totalViews ?? 0)
      setReferrers(analytics.referrers ?? [])
      setLoading(false)
    })
  }, [router])

  if (loading) return (
    <AdminShell username={username} role={role} effectivePlan={effectivePlan} trialDaysLeft={trialDaysLeft}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  const ctr = totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : '—'

  const METRIC_CARDS = [
    { icon: MousePointer, label: '總點擊數', value: totalClicks, color: 'var(--color-primary)' },
    { icon: Eye, label: '總曝光數', value: totalViews, color: '#38A169' },
    { icon: Users, label: '區塊數量', value: totalBlocks, color: '#D69E2E' },
    { icon: TrendingUp, label: '平均 CTR', value: ctr, color: '#805AD5' },
  ]

  // Cap visualisation to the last 14 days regardless of plan retention so the
  // chart label "過去 14 天" stays accurate. The API returns up to 90 days of
  // history (for Pro/Premium analytics), but rendering all 90 makes the X-axis
  // unreadable in the bar chart.
  const dailyChart = daily.slice(-14)
  const maxDaily = Math.max(...dailyChart.map(d => d.clicks), 1)

  return (
    <AdminShell username={username} role={role} effectivePlan={effectivePlan} trialDaysLeft={trialDaysLeft}>
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

        {/* Daily clicks chart */}
        <div className="mb-8" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>每日點擊趨勢</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>過去 14 天</p>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div className="flex items-end gap-1.5" style={{ height: 140 }}>
              {dailyChart.map((d) => {
                const pct = maxDaily > 0 ? (d.clicks / maxDaily) * 100 : 0
                const dateObj = new Date(d.date + 'T00:00:00')
                const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1" style={{ minWidth: 0 }}>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {d.clicks > 0 ? d.clicks : ''}
                    </span>
                    <div className="w-full rounded-t-md transition-all" style={{
                      height: `${Math.max(pct, 4)}%`,
                      background: d.clicks > 0 ? 'var(--gradient-blue)' : 'var(--color-surface)',
                      minHeight: 4,
                    }} />
                    <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Referrer sources */}
        {referrers.length > 0 && (
          <div className="mb-8" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>流量來源</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>過去 14 天的點擊來源 Top 10</p>
            </div>
            <div>
              {referrers.map((r, i) => {
                const maxRef = referrers[0]?.count || 1
                const pct = (r.count / maxRef) * 100
                return (
                  <div key={r.source} style={{ padding: '14px 24px', borderBottom: i < referrers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{r.source}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{r.count} 點擊</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-surface)', borderRadius: 9999 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: '#38A169', borderRadius: 9999, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Block ranking */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>區塊排行</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>依點擊數排序</p>
          </div>
          {blocks.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <MousePointer size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">還沒有任何數據</p>
            </div>
          ) : (
            <div>
              {blocks.map((block, i) => {
                const maxClicks = blocks[0]?.clicks || 1
                const pct = maxClicks > 0 ? (block.clicks / maxClicks) * 100 : 0
                return (
                  <div key={block.id} style={{ padding: '16px 24px', borderBottom: i < blocks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
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
    </AdminShell>
  )
}
