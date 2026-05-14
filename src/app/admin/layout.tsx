import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { DictProvider } from '@/components/i18n/DictProvider'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

/**
 * Server layout for the admin section — resolves the creator's preferred
 * locale and wraps every nested admin page (`/admin`, `/admin/analytics`,
 * `/admin/orders`, `/admin/settings`, …) in <DictProvider>.
 *
 * Same priority as the middleware / public profile route:
 *   1. lp_locale cookie (set by LanguageSwitcher)
 *   2. Accept-Language header
 *   3. DEFAULT_LOCALE ('en') fallback
 *
 * Eventually creators should be able to pick + persist their admin language
 * in /admin/settings (writes the cookie). For now the cookie is set on the
 * landing pages and follows them in.
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  return <DictProvider value={{ dict, locale }}>{children}</DictProvider>
}
