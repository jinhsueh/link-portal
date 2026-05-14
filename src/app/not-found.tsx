import Link from 'next/link'
import { Link2, ArrowRight } from 'lucide-react'
import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

/**
 * 404 page. Locale-aware so visitors arriving from a locale-prefixed URL
 * (or with the lp_locale cookie set) see translated copy. Uses the same
 * cookie → Accept-Language → DEFAULT_LOCALE waterfall as the other server
 * layouts.
 *
 * The body copy doubles as a conversion CTA: "this URL isn't taken yet —
 * grab it." Bridges 404s into signups instead of dead ends.
 */
async function resolveLocale(): Promise<Locale> {
  const c = await cookies()
  const cookieLocale = c.get('lp_locale')?.value
  if (isLocale(cookieLocale)) return cookieLocale
  const h = await headers()
  const acceptLanguage = h.get('accept-language') ?? ''
  if (!acceptLanguage) return DEFAULT_LOCALE
  try {
    const langs = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages()
    const matched = matchLocale(langs, LOCALES as unknown as string[], DEFAULT_LOCALE)
    return isLocale(matched) ? matched : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export default async function NotFound() {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  const t = dict.notFound
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--gradient-hero)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
          <Link2 size={28} color="white" />
        </div>
        <h1 className="font-bold text-5xl mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
          404
        </h1>
        <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {t.heading}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {t.subheading}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/login" className="btn-primary whitespace-nowrap w-full sm:w-auto justify-center" style={{ padding: '10px 24px', fontSize: 14 }}>
            {t.ctaSignup}
            <ArrowRight size={16} />
          </Link>
          <Link href="/" className="btn-ghost whitespace-nowrap w-full sm:w-auto justify-center" style={{ padding: '10px 24px', fontSize: 14 }}>
            {t.ctaHome}
          </Link>
        </div>
      </div>
    </div>
  )
}
