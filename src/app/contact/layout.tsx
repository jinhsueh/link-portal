import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { DictProvider } from '@/components/i18n/DictProvider'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

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

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  return <DictProvider value={{ dict, locale }}>{children}</DictProvider>
}
