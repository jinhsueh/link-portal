import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, username: true, email: true, name: true, bio: true, avatarUrl: true,
      plan: true, trialEndsAt: true, stripeCustomerId: true, stripeSubId: true,
      role: true, banned: true, bannedAt: true, bannedReason: true,
      createdAt: true, updatedAt: true,
      pages: { select: { id: true, name: true, slug: true, _count: { select: { blocks: true } } }, orderBy: { order: 'asc' } },
      _count: { select: { blocks: true, orders: true, subscribers: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Revenue summary
  const paidOrders = await prisma.order.findMany({
    where: { userId: id, status: 'paid' },
    select: { amount: true, currency: true },
  })
  const revenueByCurrency: Record<string, number> = {}
  for (const o of paidOrders) {
    revenueByCurrency[o.currency] = (revenueByCurrency[o.currency] ?? 0) + o.amount
  }

  return NextResponse.json({ ...user, revenueByCurrency })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { plan, banned, bannedReason, role } = body

  const data: Record<string, unknown> = {}
  if (plan !== undefined) data.plan = plan
  if (role !== undefined) data.role = role
  if (banned !== undefined) {
    data.banned = banned
    data.bannedAt = banned ? new Date() : null
    data.bannedReason = banned ? (bannedReason || null) : null
  }

  const user = await prisma.user.update({ where: { id }, data })
  const { passwordHash, ...safeUser } = user
  return NextResponse.json(safeUser)
}
