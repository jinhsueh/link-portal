import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE } from '@/lib/session'

// POST /api/auth — login or register by username
export async function POST(req: NextRequest) {
  const { username, name } = await req.json()

  if (!username || !/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return NextResponse.json(
      { error: '用戶名需為 3-30 個英數字或底線' },
      { status: 400 }
    )
  }

  // Upsert user
  const user = await prisma.user.upsert({
    where: { username },
    create: {
      username,
      email: `${username}@placeholder.local`,
      name: name || username,
      pages: {
        create: {
          name: '主頁',
          slug: 'home',
          isDefault: true,
          order: 0,
        },
      },
    },
    update: {},
    select: { id: true, username: true, name: true },
  })

  const res = NextResponse.json({ ok: true, user })
  res.cookies.set(SESSION_COOKIE, user.username, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}

// DELETE /api/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
