'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, BarChart2, Settings, ExternalLink, LogOut,
  Link2, TrendingUp, PackageCheck, Clock, XCircle,
  RotateCcw, RefreshCw,
} from 'lucide-react'
import { fromStripeAmount } from '@/lib/stripe'

interface Order {
  id: string
  blockId: string
  stripeSessionId: string
  customerEmail: string | null
  productTitle: string | null
  amount: number
  currency: string
  status: string
  createdAt: string
}

interface OrdersResponse {
  orders: Order[]
  total: number
  revenueByCode: Record<string, number>
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  paid:     { label: '已付款', color: '#22543D', bg: '#C6F6D5', icon: PackageCheck },
  pending:  { label: '待付款', color: '#744210', bg: '#FEFCBF', icon: Clock },
  failed:   { label: '已取消', color: '#742A2A', bg: '#FED7D7', icon: XCircle },
  refunded: { label: '已退款', color: '#2A4365', bg: '#BEE3F8', icon: RotateCcw },
}

const CURRENCY_LABELS: Record<string, string> = {
  twd: 'NT$', usd: '$', eur: '€', jpy: '¥', hkd: 'HK$',
}

function formatAmount(amount: number, currency: string) {
  const label = CURRENCY_LABELS[currency.toLowerCase()] ?? currency.toUpperCase() + ' '
  return `${label}${fromStripeAmount(amount).toLocaleString()}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-TW', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrdersPage() {
  const router = useRouter()
  const [data, setData] = useState<OrdersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    const res = await fetch('/api/orders')
    if (res.status === 401) { router.push('/login'); return }
    setData(await res.json())
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const navLinkStyle = (active = false) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary-light)' : 'none',
    textDecoration: 'none', border: 'none', cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  )

  const paidOrders = data?.orders.filter(o => o.status === 'paid') ?? []
  const totalRevenue = Object.entries(data?.revenueByCode ?? {})
    .map(([code, amt]) => formatAmount(amt, code)).join(' · ') || '—'

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>

      {/* Top nav */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
                <Link2 size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Link Portal</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/admin" style={navLinkStyle()}>主頁</a>
              <a href="/admin/analytics" style={navLinkStyle()}>
                <BarChart2 size={14} />數據分析
              </a>
              <a href="/admin/orders" style={navLinkStyle(true)}>
                <ShoppingBag size={14} />訂單管理
              </a>
              <a href="/admin/settings" style={navLinkStyle()}>
                <Settings size={14} />設定
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(true)} disabled={refreshing}
              style={{ ...navLinkStyle(), opacity: refreshing ? 0.6 : 1 }}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button onClick={handleLogout} style={navLinkStyle()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)' }}>訂單管理</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>所有透過 Stripe 金流產生的訂單記錄</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: '總訂單', value: String(data?.total ?? 0), icon: ShoppingBag, color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
            { label: '成功付款', value: String(paidOrders.length), icon: PackageCheck, color: '#22543D', bg: '#C6F6D5' },
            { label: '總收入', value: totalRevenue, icon: TrendingUp, color: '#22543D', bg: '#C6F6D5' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: 'white', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              </div>
              <p className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Orders table */}
        {(!data?.orders || data.orders.length === 0) ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: 'white', border: '2px dashed var(--color-border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--color-primary-light)' }}>
              <ShoppingBag size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>還沒有訂單</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              在頁面中加入「數位商品」區塊，訪客購買後訂單會顯示在這裡
            </p>
            <a href="/admin" className="btn-primary inline-flex mt-5" style={{ fontSize: 14, padding: '10px 22px' }}>
              去新增商品
            </a>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'white', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
            {/* Table header */}
            <div className="grid gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider"
              style={{
                gridTemplateColumns: '1fr 1fr 100px 90px 120px',
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-border)',
              }}>
              <span>商品</span>
              <span>買家 Email</span>
              <span>金額</span>
              <span>狀態</span>
              <span>時間</span>
            </div>

            {data.orders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending
              const Icon = cfg.icon
              return (
                <div key={order.id}
                  className="grid gap-4 px-5 py-4 items-center text-sm transition-colors"
                  style={{
                    gridTemplateColumns: '1fr 1fr 100px 90px 120px',
                    borderBottom: i < data.orders.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>

                  {/* Product title */}
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {order.productTitle ?? '未命名商品'}
                    </p>
                    <p className="text-xs mt-0.5 font-mono truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {order.stripeSessionId.slice(0, 24)}…
                    </p>
                  </div>

                  {/* Email */}
                  <p className="truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {order.customerEmail ?? '—'}
                  </p>

                  {/* Amount */}
                  <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {formatAmount(order.amount, order.currency)}
                  </p>

                  {/* Status badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    <Icon size={11} />
                    {cfg.label}
                  </span>

                  {/* Date */}
                  <p style={{ color: 'var(--color-text-muted)' }}>{formatDate(order.createdAt)}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Stripe dashboard link */}
        <div className="mt-6 flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
          <ShoppingBag size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--color-primary)' }}>
            查看詳細付款記錄與退款操作，請前往
            <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer"
              className="font-bold underline ml-1 inline-flex items-center gap-1">
              Stripe Dashboard <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
