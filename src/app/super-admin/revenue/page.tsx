'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SuperAdminShell } from '@/components/super-admin/SuperAdminShell'
import { DollarSign, ChevronLeft, ChevronRight, ExternalLink, ShoppingBag, TrendingUp } from 'lucide-react'
import { fromStripeAmount, formatAmount } from '@/lib/stripe'
import { useDict } from '@/components/i18n/DictProvider'

interface Order {
  id: string; stripeSessionId: string; customerEmail: string | null; productTitle: string | null
  amount: number; currency: string; status: string; createdAt: string
  user: { username: string; email: string }
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#10B981', pending: '#F59E0B', failed: '#E53E3E', refunded: '#8B5CF6',
}

export default function RevenuePage() {
  const router = useRouter()
  const { dict, locale } = useDict()
  const sa = dict.superAdmin
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [revenueByCurrency, setRevenueByCurrency] = useState<Record<string, number>>({})
  const [planBreakdown, setPlanBreakdown] = useState<{ plan: string; count: number }[]>([])
  const [topSellers, setTopSellers] = useState<{ username: string; email: string; orderCount: number; totalAmount: number }[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = async (p = page, status = statusFilter) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '20' })
    if (status) params.set('status', status)
    const res = await fetch(`/api/super-admin/revenue?${params}`)
    if (res.status === 401) { router.push('/login'); return }
    if (res.status === 403) { router.push('/admin'); return }
    const data = await res.json()
    setOrders(data.orders)
    setTotal(data.total)
    setPage(data.page)
    setTotalPages(data.totalPages)
    setRevenueByCurrency(data.revenueByCurrency)
    setPlanBreakdown(data.planBreakdown)
    setTopSellers(data.topSellers ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, []) // eslint-disable-line

  return (
    <SuperAdminShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-bold text-xl mb-6" style={{ color: 'var(--color-text-primary)' }}>{sa.revenueTitle}</h1>

        {/* Revenue cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(revenueByCurrency).map(([currency, amount]) => (
            <div key={currency} className="card" style={{ padding: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={16} style={{ color: '#F59E0B' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{currency.toUpperCase()}</span>
              </div>
              <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{formatAmount(amount, currency)}</p>
            </div>
          ))}
          {Object.keys(revenueByCurrency).length === 0 && (
            <div className="card" style={{ padding: 20 }}>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{sa.noRevenue}</p>
            </div>
          )}
        </div>

        {/* Subscription breakdown */}
        <div className="card mb-6" style={{ padding: 20 }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>{sa.subStatusDist}</h3>
          <div className="flex gap-6">
            {planBreakdown.map(({ plan, count }) => (
              <div key={plan} className="text-center">
                <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{count}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{plan}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top sellers */}
        {topSellers.length > 0 && (
          <div className="card mb-6" style={{ padding: 20 }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} style={{ color: '#F59E0B' }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{sa.userSalesRank}</h3>
            </div>
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {[sa.rank, sa.user, sa.orderCount, sa.totalAmount].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topSellers.map((s, i) => (
                    <tr key={s.username} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)', fontWeight: 500 }}>@{s.username}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)' }}>{s.orderCount}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)', fontWeight: 600 }}>{formatAmount(s.totalAmount, 'twd')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{sa.filter}</span>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetchData(1, e.target.value) }}
            style={{ padding: '8px 12px', fontSize: 13, border: '1px solid var(--color-border)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>
            <option value="">{sa.all} ({total})</option>
            <option value="paid">{sa.statusPaid}</option>
            <option value="pending">{sa.statusPending}</option>
            <option value="failed">{sa.statusFailed}</option>
            <option value="refunded">{sa.statusRefunded}</option>
          </select>
        </div>

        {/* Orders table */}
        <div className="card overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {[sa.user, sa.colProduct, sa.colAmount, sa.colStatus, sa.colCustomerEmail, sa.colDate].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>{sa.loading}</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>{sa.noOrders}</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-primary)' }}>@{o.user.username}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{o.productTitle || '-'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatAmount(o.amount, o.currency)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ color: STATUS_COLORS[o.status] || '#94A3B8' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{o.customerEmail || '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString(locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{sa.pageOf.replace('{n}', String(page)).replace('{total}', String(totalPages))}</span>
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
        {/* Stripe dashboard link */}
        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
          <ShoppingBag size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
            {sa.footerLinkPrefix}
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
              className="font-bold underline ml-1 inline-flex items-center gap-1">
              Stripe Dashboard <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </div>
    </SuperAdminShell>
  )
}
