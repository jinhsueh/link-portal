import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getSession, SESSION_COOKIE, signSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getEffectivePlan, getTrialDaysLeft } from '@/lib/plan'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Strip passwordHash, add hasPassword flag + plan info
  const { passwordHash, ...safeUser } = user
  return NextResponse.json({
    ...safeUser,
    hasPassword: !!passwordHash,
    effectivePlan: getEffectivePlan(user),
    trialDaysLeft: getTrialDaysLeft(user.trialEndsAt),
  })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, bio, avatarUrl, bannerUrl, email, username, theme, notifyNewSubscriber, notifyNewOrder, notifyWeeklyReport } = body

  // Email format validation
  if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 })
  }

  // Username change — same rules as registration. We re-validate here even
  // though the client already does (defense in depth + reserved word list).
  if (username !== undefined) {
    const next = String(username).trim().toLowerCase()
    if (!next) {
      return NextResponse.json({ error: 'Username cannot be empty.' }, { status: 400 })
    }
    if (!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/.test(next) || next.length < 3 || next.length > 30) {
      return NextResponse.json({ error: 'Invalid username format.' }, { status: 400 })
    }
    const RESERVED = new Set([
      'admin', 'api', 'login', 'logout', 'signup', 'register',
      'about', 'contact', 'pricing', 'privacy', 'terms', 'demo',
      'super-admin', 'en', 'settings', 'dashboard',
    ])
    if (RESERVED.has(next)) {
      return NextResponse.json({ error: 'This username is reserved by the system.' }, { status: 400 })
    }
    if (next !== session.username) {
      const taken = await prisma.user.findUnique({ where: { username: next }, select: { id: true } })
      if (taken && taken.id !== session.id) {
        return NextResponse.json({ error: 'This username is taken.' }, { status: 409 })
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bannerUrl !== undefined && { bannerUrl }),
      ...(email !== undefined && { email }),
      ...(username !== undefined && { username: String(username).trim().toLowerCase() }),
      // theme arrives as a typed object from ThemeEditor; serialise to JSON for storage
      ...(theme !== undefined && { theme: typeof theme === 'string' ? theme : JSON.stringify(theme) }),
      ...(notifyNewSubscriber !== undefined && { notifyNewSubscriber }),
      ...(notifyNewOrder !== undefined && { notifyNewOrder }),
      ...(notifyWeeklyReport !== undefined && { notifyWeeklyReport }),
    },
  })

  // Bust the unstable_cache profile cache so the public /<username> page
  // sees the new theme / name / bio / avatar immediately on next visit.
  revalidateTag('profile', { expire: 0 })

  const { passwordHash, ...safeUser } = user
  const res = NextResponse.json({ ...safeUser, hasPassword: !!passwordHash })

  // Session is HMAC-signed against the username. If the user just renamed
  // themselves, the old cookie won't validate on the next request — re-issue.
  if (username !== undefined && user.username !== session.username) {
    res.cookies.set(SESSION_COOKIE, signSession(user.username), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return res
}
