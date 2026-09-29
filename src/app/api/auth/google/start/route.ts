import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { GOOGLE_STATE_COOKIE, buildGoogleAuthUrl, isGoogleEnabled, pendingCookieOptions, requestOrigin } from '@/lib/oauth-google'
import { googleStartGuard } from '@/lib/inapp'
import { isLocale } from '@/lib/i18n'

// GET /api/auth/google/start — kick off Google sign-in
export async function GET(req: NextRequest) {
  if (!isGoogleEnabled()) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 })
  }
  // In-app browser guard — MUST run before the state cookie is set. Inside
  // IG / FB / LINE / TikTok webviews Google answers 403 disallowed_useragent,
  // and the state cookie can't follow the user to Safari/Chrome anyway, so
  // bounce back to /login, which opens the "open in your browser" sheet.
  // Kill switch: INAPP_GUARD=off (runtime env).
  const cookieLang = req.cookies.get('lp_locale')?.value
  const guard = googleStartGuard(req.headers.get('user-agent'), {
    lang: isLocale(cookieLang) ? cookieLang : null,
    off: process.env.INAPP_GUARD === 'off',
  })
  if (guard) {
    console.info(JSON.stringify({ tag: 'inapp_guard', app: guard.info.app, os: guard.info.os, path: '/api/auth/google/start' }))
    const bounce = NextResponse.redirect(`${requestOrigin(req)}${guard.location}`, 302)
    bounce.headers.set('Cache-Control', 'no-store')
    bounce.headers.set('Vary', 'User-Agent')
    return bounce
  }
  const state = crypto.randomBytes(16).toString('hex')
  const res = NextResponse.redirect(buildGoogleAuthUrl(req, state), 302)
  res.cookies.set(GOOGLE_STATE_COOKIE, state, pendingCookieOptions)
  return res
}
