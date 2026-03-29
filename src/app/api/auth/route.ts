import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE } from '@/lib/session'
import bcrypt from 'bcryptjs'

// POST /api/auth — login or register with password
export async function POST(req: NextRequest) {
  const { username, name, password, setPassword } = await req.json()

  if (!username || !/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return NextResponse.json({ error: '用戶名需為 3-30 個英數字或底線' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true, passwordHash: true },
  })

  // Case 1: User exists with password → verify
  if (existing && existing.passwordHash) {
    if (!password) {
      return NextResponse.json({ error: '請輸入密碼' }, { status: 400 })
    }
    const valid = await bcrypt.compare(password, existing.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: '密碼錯誤' }, { status: 401 })
    }
    return setSessionAndRespond(existing)
  }

  // Case 2: User exists without password → needs setup
  if (existing && !existing.passwordHash) {
    if (setPassword && password) {
      // Setting password for existing user
      if (password.length < 6) {
        return NextResponse.json({ error: '密碼至少需要 6 個字元' }, { status: 400 })
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
    return NextResponse.json({ error: '請設定密碼' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '密碼至少需要 6 個字元' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      username,
      email: `${username}@placeholder.local`,
      name: name || username,
      passwordHash: hash,
      pages: {
        create: { name: '主頁', slug: 'home', isDefault: true, order: 0 },
      },
    },
    select: { id: true, username: true, name: true },
  })

  return setSessionAndRespond(user)
}

function setSessionAndRespond(user: { id: string; username: string; name: string | null }) {
  const res = NextResponse.json({ ok: true, user: { id: user.id, username: user.username, name: user.name } })
  res.cookies.set(SESSION_COOKIE, user.username, {
    httpOnly: true,
    sameSite: 'lax',
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
