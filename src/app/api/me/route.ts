import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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

  // Strip passwordHash, add hasPassword flag
  const { passwordHash, ...safeUser } = user
  return NextResponse.json({
    ...safeUser,
    hasPassword: !!passwordHash,
  })
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, bio, avatarUrl, email, notifyNewSubscriber, notifyNewOrder, notifyWeeklyReport } = body

  // Email format validation
  if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email 格式不正確' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(email !== undefined && { email }),
      ...(notifyNewSubscriber !== undefined && { notifyNewSubscriber }),
      ...(notifyNewOrder !== undefined && { notifyNewOrder }),
      ...(notifyWeeklyReport !== undefined && { notifyWeeklyReport }),
    },
  })

  const { passwordHash, ...safeUser } = user
  return NextResponse.json({ ...safeUser, hasPassword: !!passwordHash })
}
