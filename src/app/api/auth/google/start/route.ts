import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { GOOGLE_STATE_COOKIE, buildGoogleAuthUrl, isGoogleEnabled, pendingCookieOptions } from '@/lib/oauth-google'

// GET /api/auth/google/start — kick off Google sign-in
export async function GET(req: NextRequest) {
  if (!isGoogleEnabled()) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 })
  }
  const state = crypto.randomBytes(16).toString('hex')
  const res = NextResponse.redirect(buildGoogleAuthUrl(req, state), 302)
  res.cookies.set(GOOGLE_STATE_COOKIE, state, pendingCookieOptions)
  return res
}
