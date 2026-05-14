'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, X, Link2, ArrowRight, Sparkles } from 'lucide-react'
import { PLAN_PRICING } from '@/lib/plan'
import { useDict } from '@/components/i18n/DictProvider'

type Billing = 'monthly' | 'annual'

interface Feature {
  label: string
  free: boolean | string
  pro: boolean | string
  premium: boolean | string
}

export default function PricingPage() {
  const { dict } = useDict()
  const t = dict.pricing
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
          Beam
        </Link>
        <Link href="/admin" className="text-sm font-semibold" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
          {t.navSignIn}
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Sparkles size={14} />
            <span className="text-xs font-semibold">{t.heroTag}</span>
          </div>
          <h1 className="font-bold text-4xl mb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t.heroTitle}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {t.heroSubtitle}
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
              {t.billingMonthly}
            </button>
            <button onClick={() => setBilling('annual')}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5"
              style={{
                background: billing === 'annual' ? 'var(--color-primary)' : 'transparent',
                color: billing === 'annual' ? 'white' : 'var(--color-text-muted)',
                border: 'none', cursor: 'pointer',
              }}>
              {t.billingAnnual}
              <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                style={{ background: billing === 'annual' ? 'rgba(255,255,255,0.25)' : '#10B981', color: 'white' }}>
                {t.yearlyDiscount}
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
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.freeTag}</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl" style={{ color: 'var(--color-text-primary)' }}>NT$0</span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.freePeriod}</span>
              </div>
            </div>
            <Link href="/admin"
              className="block text-center py-3 rounded-xl font-semibold text-sm mb-6"
              style={{ border: '1px solid var(--color-border)', background: 'white', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
              {t.freeCta}
            </Link>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t.freeFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl p-8"
            style={{ background: 'white', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-lg)', transform: 'scale(1.03)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'var(--color-primary)', color: 'white' }}>
              {t.popular}
            </div>
            <div className="mb-6">
              <h3 className="font-bold text-xl mb-1" style={{ color: 'var(--color-primary)' }}>Pro</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.proTag}</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl" style={{ color: 'var(--color-text-primary)' }}>NT${proPrice}</span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.perMonth}</span>
              </div>
              {billing === 'annual' && (
                <p className="text-xs mt-1" style={{ color: '#10B981' }}>
                  {t.annualSave.replace('{total}', String(proPrice * 12)).replace('{saved}', String(PLAN_PRICING.pro.monthly - PLAN_PRICING.pro.annual))}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.href = '/admin/settings?tab=billing&upgrade=pro'}
              className="block w-full text-center py-3 rounded-xl font-semibold text-sm mb-6"
              style={{ background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
              {t.proCta}
            </button>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {t.proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
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
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.premiumTag}</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-4xl" style={{ color: 'white' }}>NT${premiumPrice}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.perMonth}</span>
              </div>
              {billing === 'annual' && (
                <p className="text-xs mt-1" style={{ color: '#FFD700' }}>
                  {t.annualSave.replace('{total}', String(premiumPrice * 12)).replace('{saved}', String(PLAN_PRICING.premium.monthly - PLAN_PRICING.premium.annual))}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.href = '/admin/settings?tab=billing&upgrade=premium'}
              className="block w-full text-center py-3 rounded-xl font-semibold text-sm mb-6"
              style={{ background: 'white', color: '#1A1A2E', border: 'none', cursor: 'pointer' }}>
              {t.premiumCta}
            </button>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {t.premiumFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} style={{ color: '#FFD700', flexShrink: 0, marginTop: 2 }} />
                  <span dangerouslySetInnerHTML={{ __html: f }} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Commission ROI section */}
        <div className="rounded-2xl p-8 mb-16" style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold text-2xl mb-2 text-center" style={{ color: 'var(--color-text-primary)' }}>
            {t.roiTitle}
          </h2>
          <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
            {t.roiSubtitle}
          </p>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t.roiColSales}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t.roiColFree}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t.roiColPro}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>{t.roiColPremium}</th>
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
            {t.roiFootnote}
          </p>
        </div>

        {/* Feature comparison table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="font-bold text-2xl px-8 pt-8 pb-4" style={{ color: 'var(--color-text-primary)' }}>
            {t.compareTitle}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted)' }}>{t.compareColFeature}</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-primary)', width: 120 }}>Free</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 700, color: 'var(--color-primary)', width: 120 }}>Pro</th>
                <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 700, color: 'var(--color-text-primary)', width: 120 }}>Premium</th>
              </tr>
            </thead>
            <tbody>
              {(t.features as { section: string; items: Feature[] }[]).map(section => (
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
          <h2 className="font-bold text-2xl mb-4" style={{ color: 'var(--color-text-primary)' }}>{t.ctaTitle}</h2>
          <Link href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
            style={{ background: 'var(--color-primary)', color: 'white', textDecoration: 'none' }}>
            {t.ctaBtn} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
