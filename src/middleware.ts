import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n'

const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/track',
  '/api/profile',
  '/api/pages/verify',
  '/api/stripe/webhook',
  '/api/favicon',
  '/api/health',
]

/**
 * Detect the visitor's preferred locale from the Accept-Language header.
 * Sticky preference (set via the language switcher) overrides via cookie.
 * Falls back to DEFAULT_LOCALE when no match.
 */
function detectLocale(req: NextRequest): string {
  // 1. Cookie has highest priority — set by the language switcher and
  // persists across sessions so a user who picked Japanese once stays
  // on Japanese even if their browser later sends a different Accept-Language.
  const cookieLocale = req.cookies.get('lp_locale')?.value
  if (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) {
    return cookieLocale
  }

  // 2. Accept-Language header — use intl-localematcher for best-match BCP-47
  // negotiation (handles 'zh-TW', 'zh-Hant-TW', 'en-US' equally).
  const acceptLanguage = req.headers.get('accept-language') ?? ''
  if (!acceptLanguage) return DEFAULT_LOCALE
  const headers = { 'accept-language': acceptLanguage }
  try {
    const langs = new Negotiator({ headers }).languages()
    return matchLocale(langs, LOCALES as unknown as string[], DEFAULT_LOCALE)
  } catch {
    return DEFAULT_LOCALE
  }
}

// Country-code aliases that Asian visitors commonly type by reflex even
// though the language code is something else. We accept them as friendly
// redirects to the canonical locale path. Keep this list TIGHT — every
// alias also blocks that username from being claimed by a real creator.
const LOCALE_ALIASES: Record<string, string> = {
  jp: 'ja', // Japan country code → Japanese language (ISO 639-1)
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Locale alias redirect ──
  // /jp → /ja  (and any future entries in LOCALE_ALIASES).
  // Match BOTH /jp and /jp/anything-deeper to preserve sub-paths.
  for (const [alias, canonical] of Object.entries(LOCALE_ALIASES)) {
    if (pathname === `/${alias}` || pathname.startsWith(`/${alias}/`)) {
      const url = req.nextUrl.clone()
      url.pathname = pathname.replace(`/${alias}`, `/${canonical}`)
      return NextResponse.redirect(url, 301)  // permanent — SEO friendly
    }
  }

  // ── Locale redirect on bare "/" ──
  // Only redirects EXACTLY "/" — never the locale paths themselves nor any
  // other route. Public profiles (/<username>), admin, API stay untouched.
  if (pathname === '/') {
    const locale = detectLocale(req)
    const url = req.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  // Admin + Super Admin pages: require session cookie
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    const session = req.cookies.get('lp_session')
    if (!session?.value) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protected API routes: require session cookie
  if (pathname.startsWith('/api/')) {
    const isPublic = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))
    // Allow public GET on subscribers (POST is for public email forms)
    if (pathname === '/api/subscribers' && req.method === 'POST') return NextResponse.next()
    if (!isPublic) {
      const session = req.cookies.get('lp_session')
      if (!session?.value) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Locale redirect on root
    '/',
    // Locale aliases (jp → ja). Include both the bare alias and sub-paths
    // so /jp and /jp/anything-deeper both hit the rewriter.
    '/jp',
    '/jp/:path*',
    // Existing auth gates
    '/admin/:path*',
    '/super-admin/:path*',
    '/api/:path*',
  ],
}
