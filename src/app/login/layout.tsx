import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { DictProvider } from '@/components/i18n/DictProvider'
import { isGoogleEnabled } from '@/lib/oauth-google'
import { detectInApp } from '@/lib/inapp-escape'
import { parseDisabledMethods } from '@/lib/inapp'
import { SocialLoginProvider } from './social-login-context'
import { LOCALES, DEFAULT_LOCALE, LOCALE_OVERRIDE_HEADER, getDictionary, isLocale, type Locale } from '@/lib/i18n'

/**
 * Server layout for /login — resolves visitor locale (?lang= -> cookie ->
 * Accept-Language -> default) and wraps the login page in <DictProvider>
 * so the client form can call useDict() for translated labels.
 */
async function resolveLocale(): Promise<Locale> {
  const h = await headers()
  // Validated ?lang= forwarded by middleware (layouts can't read searchParams).
  // Carried by the in-app-browser escape URL so the creator keeps their language.
  const urlLocale = h.get(LOCALE_OVERRIDE_HEADER)
  if (isLocale(urlLocale)) return urlLocale
  const c = await cookies()
  const cookieLocale = c.get('lp_locale')?.value
  if (isLocale(cookieLocale)) return cookieLocale
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
  // In-app browser (IG / FB / LINE / TikTok ...) from the request UA, for first
  // paint; the client re-checks (Telegram / iPad desktop mode / home-screen apps
  // are only visible there). Kill switch per escape method: INAPP_DISABLED_METHODS
  // (runtime env, deliberately not NEXT_PUBLIC_*).
  const inAppInfo = detectInApp((await headers()).get('user-agent') ?? '', null)
  const disabledMethods = parseDisabledMethods(process.env.INAPP_DISABLED_METHODS)
  return (
    <DictProvider value={{ dict, locale }}>
      <SocialLoginProvider value={{ google: googleEnabled, inApp: inAppInfo.inApp, inAppInfo, disabledMethods }}>
        {children}
      </SocialLoginProvider>
    </DictProvider>
  )
}
