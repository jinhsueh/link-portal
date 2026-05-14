import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE, signSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

// Rate limiting: max 5 login attempts per IP per 60 seconds
const AUTH_WINDOW_MS = 60_000
const AUTH_MAX_ATTEMPTS = 5
const authAttempts = new Map<string, { count: number; resetAt: number }>()
const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'login', 'logout', 'signup', 'register',
  'about', 'contact', 'pricing', 'privacy', 'terms', 'demo',
  'super-admin', 'en', 'settings', 'dashboard',
])

function isAuthRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = authAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + AUTH_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > AUTH_MAX_ATTEMPTS
}

// POST /api/auth — login or register with password
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isAuthRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  const { username: rawUsername, name, email, password, setPassword } = await req.json()
  const username = typeof rawUsername === 'string' ? rawUsername.trim().toLowerCase() : ''

  // Username allows letters / digits / dot / underscore / hyphen, IG-style.
  // Dots are allowed inside but not at boundaries or consecutive (to avoid
  // weird URLs and confusion with file extensions).
  if (!username || !/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(username) || username.length < 3 || username.length > 30) {
    return NextResponse.json({ error: 'Username must be 3–30 characters: letters, numbers, underscore, hyphen, dot.' }, { status: 400 })
  }
  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ error: 'This username is reserved by the system.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true, passwordHash: true },
  })

  // Case 1: User exists with password → verify
  if (existing && existing.passwordHash) {
    if (!password) {
      return NextResponse.json({ error: 'Please enter a password.' }, { status: 400 })
    }
    const valid = await bcrypt.compare(password, existing.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Wrong password.' }, { status: 401 })
    }
    return setSessionAndRespond(existing)
  }

  // Case 2: User exists without password → needs setup
  if (existing && !existing.passwordHash) {
    if (setPassword && password) {
      // Setting password for existing user
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
      }
      const hash = await bcrypt.hash(password, 12)
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash: hash } })
      return setSessionAndRespond(existing)
    }
    // Tell frontend to show set-password form
    return NextResponse.json({ needsPasswordSetup: true, username: existing.username }, { status: 409 })
  }

  // Case 3: New user → register
  if (!password) {
    return NextResponse.json({ error: 'Please set a password.' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      username,
      email: email || `${username}@placeholder.local`,
      name: name || username,
      passwordHash: hash,
      plan: 'pro_trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      pages: {
        create: { name: 'Home', slug: 'home', isDefault: true, order: 0 },
      },
    },
    select: { id: true, username: true, name: true },
  })

  return setSessionAndRespond(user)
}

function setSessionAndRespond(user: { id: string; username: string; name: string | null }) {
  const res = NextResponse.json({ ok: true, user: { id: user.id, username: user.username, name: user.name } })
  res.cookies.set(SESSION_COOKIE, signSession(user.username), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

// DELETE /api/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
