import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSession } from '@/lib/session'
import {
  GOOGLE_STATE_COOKIE, OAUTH_PENDING_COOKIE, exchangeCodeForProfile, isGoogleEnabled,
  pendingCookieOptions, requestOrigin, signPending,
} from '@/lib/oauth-google'

// GET /api/auth/google/callback — Google redirects here with ?code&state
export async function GET(req: NextRequest) {
  const origin = requestOrigin(req)
  const fail = (reason: string) => {
    const res = NextResponse.redirect(`${origin}/login?oauth_error=${encodeURIComponent(reason)}`, 302)
    res.cookies.delete(GOOGLE_STATE_COOKIE)
    return res
  }

  if (!isGoogleEnabled()) return fail('not_configured')

  const { searchParams } = req.nextUrl
  if (searchParams.get('error')) return fail('denied')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const expectedState = req.cookies.get(GOOGLE_STATE_COOKIE)?.value
  if (!code || !state || !expectedState || state !== expectedState) return fail('bad_state')

  let profile
  try {
    profile = await exchangeCodeForProfile(req, code)
  } catch (err) {
    console.error('[google-oauth] exchange failed', err)
    return fail('exchange_failed')
  }

  // 1) Already linked → sign in
  const linked = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: 'google', providerAccountId: profile.sub } },
    select: { user: { select: { id: true, username: true, banned: true } } },
  })
  if (linked) {
    if (linked.user.banned) return fail('banned')
    return signIn(origin, linked.user.username)
  }

  // 2) Verified email matches an existing real account → link + sign in
  if (profile.email && profile.emailVerified) {
    const byEmail = await prisma.user.findUnique({
      where: { email: profile.email },
      select: { id: true, username: true, banned: true, email: true },
    })
    if (byEmail && !byEmail.email.endsWith('@placeholder.local')) {
      if (byEmail.banned) return fail('banned')
      await prisma.oAuthAccount.create({
        data: { userId: byEmail.id, provider: 'google', providerAccountId: profile.sub, email: profile.email },
      })
      return signIn(origin, byEmail.username)
    }
  }

  // 3) New user → stash profile, let them pick a username on /login
  const res = NextResponse.redirect(`${origin}/login?oauth=pending`, 302)
  res.cookies.delete(GOOGLE_STATE_COOKIE)
  res.cookies.set(OAUTH_PENDING_COOKIE, signPending({
    provider: 'google', sub: profile.sub,
    email: profile.emailVerified ? profile.email : null,
    name: profile.name, picture: profile.picture,
  }), pendingCookieOptions)
  return res
}

function signIn(origin: string, username: string) {
  const res = NextResponse.redirect(`${origin}/admin`, 302)
  res.cookies.delete(GOOGLE_STATE_COOKIE)
  res.cookies.set(SESSION_COOKIE, signSession(username), SESSION_COOKIE_OPTIONS)
  return res
}
