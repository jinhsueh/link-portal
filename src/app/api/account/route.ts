import { NextResponse } from 'next/server'
import { getSession, SESSION_COOKIE } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// DELETE /api/account — delete account permanently
export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { confirmUsername } = await req.json()
  if (confirmUsername !== session.username) {
    return NextResponse.json({ error: 'Username does not match — account not deleted.' }, { status: 400 })
  }

  // Cascade delete handles all related data
  await prisma.user.delete({ where: { id: session.id } })

  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SESSION_COOKIE)
  return res
}
