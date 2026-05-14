import Link from 'next/link'
import {
  ArrowRight, Check, Sparkles, Layers, Palette, BarChart2,
  ShoppingBag, Mail, FileStack, UserPlus, Plus, Share2,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import type { Dictionary, Locale } from '@/lib/i18n'

/**
 * Simpler dict-driven landing used by the locales that don't yet have a
 * hand-crafted rich landing (ja, th). en and zh-TW keep their bespoke
 * pages. When we have time we can promote this template to be the only
 * landing across all locales, then delete the dedicated en/zh-TW versions.
 */
export function LandingSimple({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const t = dict.landing
  const FEATURE_ICONS = [Layers, Palette, BarChart2, ShoppingBag, Mail, FileStack]
  const STEP_ICONS = [UserPlus, Plus, Share2]

  return (
    <div style={{ background: 'var(--color-surface)' }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-40" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2"
            style={{ textDecoration: 'none', color: 'var(--color-primary)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-blue)' }}>
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Beam</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login"
              className="text-sm font-semibold px-4 py-1.5 rounded-full"
              style={{ background: 'var(--color-primary)', color: 'white', textDecoration: 'none' }}>
              {dict.common.signIn}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-5 pt-14 pb-20 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5"
          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          <Sparkles size={12} />
          {t.hero.tag}
        </div>
        <h1 className="font-extrabold tracking-tight" style={{
          fontSize: 'clamp(36px, 6vw, 56px)',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-display)',
          whiteSpace: 'pre-line',
          lineHeight: 1.1,
        }}>
          {t.hero.title}
        </h1>
        <p className="mt-5 text-lg max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          {t.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/login" className="btn-primary"
            style={{ fontSize: 15, padding: '13px 28px' }}>
            {t.hero.ctaPrimary}
            <ArrowRight size={16} />
          </Link>
          <Link href="/demo" className="text-sm font-semibold"
            style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>
            {t.hero.ctaSecondary}
          </Link>
        </div>
        <p className="mt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {t.hero.ctaNote}
        </p>
      </section>

      {/* ── Features grid ── */}
      <section className="px-5 py-16" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i] ?? Sparkles
              return (
                <div key={f.title} className="card group" style={{ padding: 28 }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: 'var(--color-primary-light)' }}>
                    <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="font-bold text-base mb-2"
                    style={{ color: 'var(--color-text-primary)' }}>
                    {f.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {f.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-5 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.steps.map((s, i) => {
              const Icon = STEP_ICONS[i] ?? Plus
              return (
                <div key={s.num} className="text-center">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                    <Icon size={22} />
                  </div>
                  <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                    {s.num}
                  </p>
                  <h3 className="font-bold text-base mb-2"
                    style={{ color: 'var(--color-text-primary)' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {s.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-5 py-16" style={{ background: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-bold mb-3" style={{ fontSize: 32, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              {t.pricing.title}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{t.pricing.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[t.pricing.free, t.pricing.pro, t.pricing.premium].map((tier, i) => (
              <div key={tier.name} className="card flex flex-col" style={{
                padding: 28,
                borderColor: i === 1 ? 'var(--color-primary)' : undefined,
                borderWidth: i === 1 ? 2 : undefined,
              }}>
                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-extrabold" style={{ fontSize: 36, color: 'var(--color-text-primary)' }}>
                    {tier.price}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{tier.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Check size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login"
                  className={i === 1 ? 'btn-primary' : ''}
                  style={i === 1 ? { fontSize: 14, padding: '10px 20px', justifyContent: 'center' } : {
                    fontSize: 14, padding: '10px 20px', textAlign: 'center',
                    border: '1px solid var(--color-border)', borderRadius: 10,
                    color: 'var(--color-text-secondary)', textDecoration: 'none',
                    fontWeight: 600,
                  }}>
                  {t.pricing.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bold text-center mb-8"
            style={{ fontSize: 28, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            {t.faq.title}
          </h2>
          <div className="space-y-3">
            {t.faq.items.map(item => (
              <details key={item.q} className="card group" style={{ padding: 20 }}>
                <summary className="cursor-pointer font-bold text-sm flex items-center justify-between"
                  style={{ color: 'var(--color-text-primary)', listStyle: 'none' }}>
                  {item.q}
                </summary>
                <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-5 py-12" style={{ background: 'white', borderTop: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-blue)' }}>
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>Beam</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t.footer.copyright}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/pricing" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                {t.footer.pricing}
              </Link>
              <Link href="/privacy" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                {t.footer.privacy}
              </Link>
              <Link href="/terms" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                {t.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
