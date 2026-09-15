/**
 * Google OAuth 2.0 / OIDC helpers (hand-rolled; no next-auth because the
 * app uses its own HMAC session keyed by username).
 *
 * Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (server-only; feature is
 * disabled when either is missing — gate read at request time, not build).
 */
import crypto from 'crypto'
import type { NextRequest } from 'next/server'

export const GOOGLE_STATE_COOKIE = 'lp_oauth_state'
export const OAUTH_PENDING_COOKIE = 'lp_oauth_pending'
const PENDING_TTL_MS = 10 * 60 * 1000

export function isGoogleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET env var is required')
  return secret
}

/** Absolute origin of the current request (works on localhost + Vercel). */
export function requestOrigin(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') ?? (req.nextUrl.protocol.replace(':', '') || 'https')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host
  return `${proto}://${host}`
}

export function googleRedirectUri(req: NextRequest): string {
  return `${requestOrigin(req)}/api/auth/google/callback`
}

export function buildGoogleAuthUrl(req: NextRequest, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export interface GoogleProfile {
  sub: string
  email: string | null
  emailVerified: boolean
  name: string | null
  picture: string | null
}

export async function exchangeCodeForProfile(req: NextRequest, code: string): Promise<GoogleProfile> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(req),
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenRes.ok) throw new Error(`google token exchange failed: ${tokenRes.status}`)
  const token = (await tokenRes.json()) as { access_token?: string }
  if (!token.access_token) throw new Error('google token exchange: no access_token')

  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!infoRes.ok) throw new Error(`google userinfo failed: ${infoRes.status}`)
  const info = (await infoRes.json()) as {
    sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string
  }
  if (!info.sub) throw new Error('google userinfo: missing sub')
  return {
    sub: info.sub,
    email: info.email ?? null,
    emailVerified: info.email_verified === true,
    name: info.name ?? null,
    picture: info.picture ?? null,
  }
}

// ── Pending-signup cookie (signed, short-lived) ─────────────────────────────
// Carries the verified Google profile between /callback and /complete while
// the user picks a username. Format: base64url(json).hmac

export interface PendingOAuth {
  provider: 'google'
  sub: string
  email: string | null
  name: string | null
  picture: string | null
  exp: number
}

function hmac(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function signPending(p: Omit<PendingOAuth, 'exp'>): string {
  const payload = Buffer.from(JSON.stringify({ ...p, exp: Date.now() + PENDING_TTL_MS })).toString('base64url')
  return `${payload}.${hmac(payload)}`
}

export function verifyPending(token: string | undefined): PendingOAuth | null {
  if (!token) return null
  const i = token.lastIndexOf('.')
  if (i === -1) return null
  const payload = token.slice(0, i)
  const sig = token.slice(i + 1)
  const expected = hmac(payload)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString()) as PendingOAuth
    if (p.provider !== 'google' || !p.sub || typeof p.exp !== 'number' || p.exp < Date.now()) return null
    return p
  } catch {
    return null
  }
}

export const pendingCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: PENDING_TTL_MS / 1000,
}
