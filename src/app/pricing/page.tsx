'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, X, Link2, ArrowRight, Sparkles } from 'lucide-react'
import { PLAN_PRICING } from '@/lib/plan'

type Billing = 'monthly' | 'annual'

interface Feature {
  label: string
  free: boolean | string
  pro: boolean | string
  premium: boolean | string
}

const FEATURES: { section: string; items: Feature[] }[] = [
  {
    section: '核心功能',
    items: [
      { label: '頁面數量', free: '1', pro: '10', premium: '無限' },
      { label: '每頁區塊數', free: '12', pro: '20', premium: '無限' },
      { label: '基本區塊（連結、影片、橫幅、標題、FAQ、倒數）', free: true, pro: true, premium: true },
      { label: '進階區塊（商品、Email 表單、輪播、地圖、HTML）', free: false, pro: true, premium: true },
      { label: '密碼保護頁面', free: true, pro: true, premium: true },
      { label: '主題預設與自訂色彩', free: true, pro: true, premium: true },
      { label: '排程發佈', free: true, pro: true, premium: true },
    ],
  },
  {
    section: '商品販售',
    items: [
      { label: '可販售數位商品', free: true, pro: true, premium: true },
      { label: '平台抽成', free: '10%', pro: '5%', premium: '2%' },
      { label: '訂單管理後台', free: true, pro: true, premium: true },
      { label: 'Stripe 金流串接', free: true, pro: true, premium: true },
    ],
  },
  {
    section: '數據分析',
    items: [
      { label: '分析資料保留', free: '30 天', pro: '90 天', premium: '無限' },
      { label: '點擊 / 曝光 / CTR', free: true, pro: true, premium: true },
      { label: '來源追蹤（UTM）', free: false, pro: true, premium: true },
      { label: 'Referrer 分析', free: true, pro: true, premium: true },
    ],
  },
  {
    section: '品牌與網域',
    items: [
      { label: '移除 Link Portal 浮水印', free: false, pro: true, premium: true },
      { label: '自訂 Favicon', free: false, pro: false, premium: true },
      { label: '自訂網域（mybrand.com）', free: false, pro: false, premium: true },
      { label: '自訂 CSS', free: false, pro: false, premium: true },
    ],
  },
  {
    section: '團隊與支援',
    items: [
      { label: '團隊協作成員', free: '—', pro: '3 人', premium: '無限' },
      { label: '電子郵件支援', free: true, pro: true, premium: true },
      { label: '優先客服', free: false, pro: false, premium: true },
    ],
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly')

  const proPrice = billing === 'monthly' ? PLAN_PRICING.pro.monthly : PLAN_PRICING.pro.annual
  const premiumPrice = billing === 'monthly' ? PLAN_PRICING.premium.monthly : PLAN_PRICING.premium.annual

  const renderCell = (value: boolean | string) => {
    if (value === true) return <Check size={18} style={{ color: '#10B981' }} />
    if (value === false) return <X size={18} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
    return <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg, #F7F9FC)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }}>
          <Link2 size={20} style={{ color: 'var(--color-primary)' }} />
          Link Portal
        </Link>
        <Link href="/admin" className="text-sm font-semibold" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
          登入 / 註冊 →
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Sparkles size={14} />
            <span className="text-xs font-semibold">選擇最適合你的方案</span>
          </div>
          <h1 className="font-bold text-4xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
            成長到哪，方案跟到哪
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            從新手創作者到品牌商家，每一步 Link Portal 都陪你
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 rounded-full"
            style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <button onClick={() => setBilling('monthly')}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: billing === 'monthly' ? 'var(--color-primary)' : 'transparent',
                color: billing === 'monthly' ? 'white' : 'var(--color-text-muted)',
                border: 'none', cursor: 'pointer',
              }}>
              月繳
            </button>
            <button onClick={() => setBilling('annual')}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
              style={{
                background: billing === 'annual' ? 'var(--color-primary)' : 'transparent',
                color: billing === 'annual' ? 'white' : 'var(--color-text-muted)',
                border: 'none', cursor: 'pointer',
              }}>
              年繳
              <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background: billing === 'annual' ? 'rgba(255,255,255,0.25)' : '#10B981', color: 'white' }}>
                省 12%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Free */}
          <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="mb-6">
              <h3 className="font-bold text-xl mb-1" style={{ color: 'var(--color-text-primary)' }}>Free</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>新手創作者入門</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl" style={{ color: 'var(--color-text-primary)' }}>NT$0</span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/ 永久免費</span>
              </div>
            </div>
            <Link href="/admin"
              className="block text-center py-3 rounded-xl font-semibold text-sm mb-6"
              style={{ border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
              免費開始使用
            </Link>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />1 個頁面</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />12 個區塊</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />30 天數據分析</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />可販售商品（10% 抽成）</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />6 種基本區塊類型</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl p-8"
            style={{ background: 'white', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-lg)', transform: 'scale(1.03)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'var(--color-primary)', color: 'white' }}>
              最受歡迎
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-xl mb-1" style={{ color: 'var(--color-primary)' }}>Pro</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>個人創作者 / KOL / Freelancer</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl" style={{ color: 'var(--color-text-primary)' }}>NT${proPrice}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/ 月</span>
              </div>
              {billing === 'annual' && (
                <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                  年繳 NT${proPrice * 12}，月均省 NT${PLAN_PRICING.pro.monthly - PLAN_PRICING.pro.annual}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.href = '/admin/settings?tab=billing&upgrade=pro'}
              className="block w-full text-center py-3 rounded-xl font-semibold text-sm mb-6"
              style={{ background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
              升級 Pro
            </button>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />10 個頁面</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />20 個區塊 / 頁</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />90 天數據 + UTM 追蹤</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} /><strong>5% 商品抽成</strong>（Free 的一半）</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />所有進階區塊類型</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />移除浮水印</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />3 人團隊協作</li>
            </ul>
          </div>

          {/* Premium */}
          <div className="rounded-2xl p-8"
            style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4A 100%)', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full mb-2"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#FFD700' }}>
                <Sparkles size={12} />
                <span className="text-xs font-semibold">Premium</span>
              </div>
              <h3 className="font-bold text-xl mb-1" style={{ color: 'white' }}>Premium</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>品牌 / Agency / 商家</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl" style={{ color: 'white' }}>NT${premiumPrice}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>/ 月</span>
              </div>
              {billing === 'annual' && (
                <p className="text-xs mt-1" style={{ color: '#FFD700' }}>
                  年繳 NT${premiumPrice * 12}，月均省 NT${PLAN_PRICING.premium.monthly - PLAN_PRICING.premium.annual}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.href = '/admin/settings?tab=billing&upgrade=premium'}
              className="block w-full text-center py-3 rounded-xl font-semibold text-sm mb-6"
              style={{ background: 'white', color: '#1A1A2E', border: 'none', cursor: 'pointer' }}>
              升級 Premium
            </button>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} /><strong>無限頁面與區塊</strong></li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />無限數據保留</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} /><strong>2% 超低抽成</strong></li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />自訂網域 mybrand.com</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />自訂 Favicon 與 CSS</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />無限團隊成員</li>
              <li className="flex items-start gap-2"><Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />優先客服支援</li>
            </ul>
          </div>
        </div>

        {/* Commission ROI section */}
        <div className="rounded-2xl p-8 mb-16" style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold text-2xl mb-2 text-center" style={{ color: 'var(--color-text-primary)' }}>
            賣越多，省越多
          </h2>
          <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
            月銷售額越高，Premium 的低抽成越划算
          </p>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>月銷售額</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>Free (10%)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>Pro (5% + 月費)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>Premium (2% + 月費)</th>
                </tr>
              </thead>
              <tbody>
                {[2000, 5000, 8000, 10000, 20000, 50000].map(sales => {
                  const free = sales * 0.1
                  const pro = sales * 0.05 + PLAN_PRICING.pro.monthly
                  const premium = sales * 0.02 + PLAN_PRICING.premium.monthly
                  const best = Math.min(free, pro, premium)
                  const mark = (cost: number) => cost === best ? { fontWeight: 700, color: '#10B981' } : {}
                  return (
                    <tr key={sales} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>NT${sales.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)', ...mark(free) }}>NT${free.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)', ...mark(pro) }}>NT${pro.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--color-text-secondary)', ...mark(premium) }}>NT${premium.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
            綠色標記為該銷售額下最划算的方案。月銷售超過 NT$8,000 即適合升級 Premium。
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold text-2xl px-8 pt-8 pb-4" style={{ color: 'var(--color-text-primary)' }}>
            完整功能比較
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>功能</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-primary)', width: 120 }}>Free</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)', width: 120 }}>Pro</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-primary)', width: 120 }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map(section => (
                <>
                  <tr key={section.section} style={{ background: 'var(--color-surface)' }}>
                    <td colSpan={4} style={{ padding: '12px 24px', fontWeight: 700, fontSize: 13, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {section.section}
                    </td>
                  </tr>
                  {section.items.map((f, i) => (
                    <tr key={`${section.section}-${i}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 24px', color: 'var(--color-text-secondary)' }}>{f.label}</td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>{renderCell(f.free)}</td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>{renderCell(f.pro)}</td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>{renderCell(f.premium)}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--color-text-primary)' }}>準備好開始了嗎？</h2>
          <Link href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{ background: 'var(--color-primary)', color: 'white', textDecoration: 'none' }}>
            免費建立你的頁面 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
