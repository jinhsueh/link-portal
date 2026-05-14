import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { DictProvider } from '@/components/i18n/DictProvider'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

/**
 * Server layout for /<username>/success — resolves locale and wraps the
 * post-purchase confirmation page in <DictProvider>. The success page is a
 * sibling route to <username>/page.tsx (which has its own DictProvider in
 * the page component itself), so it needs its own provider here.
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

export default async function SuccessLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  return <DictProvider value={{ dict, locale }}>{children}</DictProvider>
}
