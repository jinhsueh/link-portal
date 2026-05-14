'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SuperAdminShell } from '@/components/super-admin/SuperAdminShell'
import { Users, FileText, MousePointerClick, DollarSign, Sparkles } from 'lucide-react'
import { fromStripeAmount } from '@/lib/stripe'
import { useDict } from '@/components/i18n/DictProvider'

interface Stats {
  totalUsers: number
  totalPages: number
  totalBlocks: number
  totalClicks: number
  totalViews: number
  revenueByCurrency: Record<string, number>
  planBreakdown: { plan: string; count: number }[]
  activeTrials: number
  userGrowth: { date: string; count: number }[]
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free', pro_trial: 'Pro Trial', pro: 'Pro',
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { dict } = useDict()
  const sa = dict.superAdmin
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/super-admin/stats').then(async res => {
      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 403) { router.push('/admin'); return }
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setStats(data)
    })
  }, [router])

  if (error) return (
    <SuperAdminShell>
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p style={{ color: '#E53E3E' }}>{error}</p>
      </div>
    </SuperAdminShell>
  )

  if (!stats) return (
    <SuperAdminShell>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: '#FEEBC8', borderTopColor: '#ED8936' }} />
      </div>
    </SuperAdminShell>
  )

  const totalRevenue = Object.entries(stats.revenueByCurrency)
    .map(([c, a]) => `${c.toUpperCase()} ${fromStripeAmount(a).toLocaleString()}`)
    .join(' / ') || 'NT$0'

  const maxGrowth = Math.max(1, ...stats.userGrowth.map(d => d.count))

  return (
    <SuperAdminShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-bold text-xl mb-6" style={{ color: 'var(--color-text-primary)' }}>{sa.overviewTitle}</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: sa.users, value: stats.totalUsers, icon: Users, color: '#3B82F6' },
            { label: sa.pages, value: stats.totalPages, icon: FileText, color: '#8B5CF6' },
            { label: sa.clicks, value: stats.totalClicks.toLocaleString(), icon: MousePointerClick, color: '#10B981' },
            { label: sa.revenue, value: totalRevenue, icon: DollarSign, color: '#F59E0B' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ padding: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} style={{ color }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
              </div>
              <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Plan breakdown */}
          <div className="card" style={{ padding: 24 }}>
            <h2 className="font-bold mb-4" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>{sa.planDist}</h2>
            <div className="space-y-3">
              {stats.planBreakdown.map(({ plan, count }) => {
                const pct = stats.totalUsers ? Math.round((count / stats.totalUsers) * 100) : 0
                return (
                  <div key={plan}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--color-text-secondary)' }}>{PLAN_LABELS[plan] || plan}</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                      <div className="h-2 rounded-full" style={{
                        width: `${pct}%`,
                        background: plan === 'pro' ? '#10B981' : plan === 'pro_trial' ? '#F59E0B' : '#94A3B8',
                      }} />
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Sparkles size={14} style={{ color: '#F59E0B' }} />
                {sa.activeTrials.replace('{n}', String(stats.activeTrials))}
              </div>
            </div>
          </div>

          {/* User growth chart */}
          <div className="card" style={{ padding: 24 }}>
            <h2 className="font-bold mb-4" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>{sa.growth30d}</h2>
            {stats.userGrowth.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{sa.noSignupData}</p>
            ) : (
              <div className="flex items-end gap-1" style={{ height: 120 }}>
                {stats.userGrowth.map(({ date, count }) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t" style={{
                      height: `${(count / maxGrowth) * 100}%`,
                      minHeight: count > 0 ? 4 : 0,
                      background: '#ED8936',
                    }} />
                  </div>
                ))}
              </div>
            )}
            {stats.userGrowth.length > 0 && (
              <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <span>{stats.userGrowth[0]?.date.slice(5)}</span>
                <span>{stats.userGrowth[stats.userGrowth.length - 1]?.date.slice(5)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminShell>
  )
}
