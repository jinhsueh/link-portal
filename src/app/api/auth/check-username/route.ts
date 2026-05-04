import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/check-username?username=xxx
 *
 * Lightweight availability probe for the signup form. Returns:
 *   { available: true }            — username is free
 *   { available: false, reason }   — taken or invalid
 *
 * No auth required, no rate limit beyond the standard Next.js edge defaults
 * (this endpoint exposes nothing sensitive — it's just an existence check
 * that's already implicit in the public profile route `/{username}`).
 */
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.trim().toLowerCase() ?? ''

  if (!username) {
    return NextResponse.json({ available: false, reason: 'empty' })
  }
  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'invalid' })
  }
  // Reserved usernames — would conflict with our own routes.
  const RESERVED = new Set([
    'admin', 'api', 'login', 'logout', 'signup', 'register',
    'about', 'contact', 'pricing', 'privacy', 'terms', 'demo',
    'super-admin', 'en', 'settings', 'dashboard',
  ])
  if (RESERVED.has(username)) {
    return NextResponse.json({ available: false, reason: 'reserved' })
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })
  return NextResponse.json({ available: !existing, ...(existing ? { reason: 'taken' } : {}) })
}
