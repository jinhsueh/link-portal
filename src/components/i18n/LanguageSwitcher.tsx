'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { LOCALES, LOCALE_META, type Locale, isLocale } from '@/lib/i18n'

/**
 * Header language switcher. Picking a locale:
 *   1. Sets the `lp_locale` cookie so future visits remember the choice.
 *   2. Navigates to the same page under the new locale prefix.
 *
 * Cookie + URL together = both Accept-Language detection AND existing tabs
 * stay in sync. The cookie is read by middleware before Accept-Language.
 *
 * Locale derivation:
 * - If the current pathname starts with a known locale ('/en', '/ja', '/th',
 *   '/zh-TW'), that's the current locale.
 * - Otherwise (e.g. `/admin`, `/<username>`) we leave currentLocale unset
 *   and the switcher just sets the cookie + redirects to `/<chosen>`.
 */
export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Derive current locale from URL
  const currentLocale = (LOCALES as readonly string[]).find(
    l => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  ) as Locale | undefined

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const switchTo = (locale: Locale) => {
    if (!isLocale(locale)) return
    // Persist preference for 1 year so the visitor doesn't get redirected
    // back to their browser default the next time they hit /.
    document.cookie = `lp_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    setOpen(false)

    // Rewrite the locale segment in the pathname when one is present, else
    // just go to the locale root. Preserves sub-path like /en/pricing → /ja/pricing.
    if (currentLocale) {
      const rest = pathname.replace(`/${currentLocale}`, '') || '/'
      router.push(`/${locale}${rest === '/' ? '' : rest}`)
    } else {
      router.push(`/${locale}`)
    }
  }

  const displayed = currentLocale ?? 'en'
  const meta = LOCALE_META[displayed]

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
        style={{
          background: 'rgba(255,255,255,0.6)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}>
        <Globe size={14} />
        <span>{meta.native}</span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div role="listbox"
          className="absolute right-0 top-full mt-1.5 z-30 rounded-xl py-1 min-w-[160px]"
          style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
          {LOCALES.map(l => {
            const m = LOCALE_META[l]
            const active = l === displayed
            return (
              <button key={l}
                onClick={() => switchTo(l)}
                role="option"
                aria-selected={active}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: active ? 600 : 500,
                  textAlign: 'left',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
                <span style={{ fontSize: 16 }}>{m.flag}</span>
                <span className="flex-1">{m.native}</span>
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
