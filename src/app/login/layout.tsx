import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { DictProvider } from '@/components/i18n/DictProvider'
import { isGoogleEnabled } from '@/lib/oauth-google'
import { SocialLoginProvider } from './social-login-context'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

/**
 * Server layout for /login — resolves visitor locale (cookie ->
 * Accept-Language -> default) and wraps the login page in <DictProvider>
 * so the client form can call useDict() for translated labels.
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

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  // Runtime (not build-time) gate: the Google button only renders when the
  // server actually has OAuth credentials configured.
  const googleEnabled = isGoogleEnabled()
  return (
    <DictProvider value={{ dict, locale }}>
      <SocialLoginProvider value={{ google: googleEnabled }}>{children}</SocialLoginProvider>
    </DictProvider>
  )
}
