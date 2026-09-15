import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSession } from '@/lib/session'
import { normalizeUsername, validateUsername, suggestUsernameFromEmail } from '@/lib/username'
import { createUserWithDefaults } from '@/lib/create-user'
import { OAUTH_PENDING_COOKIE, verifyPending } from '@/lib/oauth-google'

// GET /api/auth/google/complete — read pending Google profile (for the username-pick form)
export async function GET(req: NextRequest) {
  const pending = verifyPending(req.cookies.get(OAUTH_PENDING_COOKIE)?.value)
  if (!pending) return NextResponse.json({ pending: false }, { status: 404 })
  return NextResponse.json({
    pending: true,
    email: pending.email,
    name: pending.name,
    picture: pending.picture,
    suggestedUsername: suggestUsernameFromEmail(pending.email),
  })
}

// POST /api/auth/google/complete { username } — finish social signup
export async function POST(req: NextRequest) {
  const pending = verifyPending(req.cookies.get(OAUTH_PENDING_COOKIE)?.value)
  if (!pending) {
    return NextResponse.json({ error: 'Your Google sign-in expired. Please try again.' }, { status: 401 })
  }

  // Already linked (e.g. double submit / stale tab) → just sign in
  const already = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider: 'google', providerAccountId: pending.sub } },
    select: { user: { select: { username: true, banned: true } } },
  })
  if (already) {
    if (already.user.banned) return NextResponse.json({ error: 'This account has been suspended.' }, { status: 403 })
    return finish(already.user.username)
  }

  const body = await req.json().catch(() => ({}))
  const username = normalizeUsername(body?.username)
  const problem = validateUsername(username)
  if (problem === 'invalid') {
    return NextResponse.json({ error: 'Username must be 3–30 characters: letters, numbers, underscore, hyphen, dot.' }, { status: 400 })
  }
  if (problem === 'reserved') {
    return NextResponse.json({ error: 'This username is reserved by the system.' }, { status: 400 })
  }

  const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } })
  if (taken) return NextResponse.json({ error: 'This username is taken.' }, { status: 409 })

  // Email must stay unique — if a real account already owns it, don't reuse it here
  let email: string | null = pending.email
  if (email) {
    const emailOwner = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (emailOwner) email = null
  }

  const user = await createUserWithDefaults({
    username, email, name: pending.name, avatarUrl: pending.picture,
  })
  await prisma.oAuthAccount.create({
    data: { userId: user.id, provider: 'google', providerAccountId: pending.sub, email: pending.email },
  })
  return finish(user.username)
}

function finish(username: string) {
  const res = NextResponse.json({ ok: true, user: { username } })
  res.cookies.delete(OAUTH_PENDING_COOKIE)
  res.cookies.set(SESSION_COOKIE, signSession(username), SESSION_COOKIE_OPTIONS)
  return res
}
