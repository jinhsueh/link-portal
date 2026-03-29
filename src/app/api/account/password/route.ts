import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/account/password — change or set password
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { currentPassword, newPassword } = await req.json()

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: '新密碼至少需要 6 個字元' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { passwordHash: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If user has a password, verify current password
  if (user.passwordHash) {
    if (!currentPassword) {
      return NextResponse.json({ error: '請輸入目前密碼' }, { status: 400 })
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: '目前密碼不正確' }, { status: 400 })
    }
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash: hash },
  })

  return NextResponse.json({ ok: true })
}
