import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = req.nextUrl
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const status = url.searchParams.get('status') || ''

  const where: any = {}
  if (status) where.status = status

  const [orders, total, paidOrders, planBreakdown] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
    prisma.order.findMany({
      where: { status: 'paid' },
      select: { amount: true, currency: true },
    }),
    prisma.user.groupBy({ by: ['plan'], _count: true }),
  ])

  const revenueByCurrency: Record<string, number> = {}
  for (const o of paidOrders) {
    revenueByCurrency[o.currency] = (revenueByCurrency[o.currency] ?? 0) + o.amount
  }

  return NextResponse.json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    revenueByCurrency,
    planBreakdown: planBreakdown.map(p => ({ plan: p.plan, count: p._count })),
  })
}
