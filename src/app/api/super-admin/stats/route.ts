import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalPages,
    totalBlocks,
    clickViewAgg,
    paidOrders,
    planBreakdown,
    recentUsers,
    activeTrials,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.page.count(),
    prisma.block.count(),
    prisma.block.aggregate({ _sum: { clicks: true, views: true } }),
    prisma.order.findMany({
      where: { status: 'paid' },
      select: { amount: true, currency: true },
    }),
    prisma.user.groupBy({ by: ['plan'], _count: true }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.user.count({
      where: { plan: 'pro_trial', trialEndsAt: { gt: now } },
    }),
  ])

  // Revenue by currency
  const revenueByCurrency: Record<string, number> = {}
  for (const o of paidOrders) {
    revenueByCurrency[o.currency] = (revenueByCurrency[o.currency] ?? 0) + o.amount
  }

  // User growth: daily counts for last 30 days
  const growthMap: Record<string, number> = {}
  for (const u of recentUsers) {
    const day = u.createdAt.toISOString().slice(0, 10)
    growthMap[day] = (growthMap[day] ?? 0) + 1
  }
  const userGrowth = Object.entries(growthMap).map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    totalUsers,
    totalPages,
    totalBlocks,
    totalClicks: clickViewAgg._sum.clicks ?? 0,
    totalViews: clickViewAgg._sum.views ?? 0,
    revenueByCurrency,
    planBreakdown: planBreakdown.map(p => ({ plan: p.plan, count: p._count })),
    activeTrials,
    userGrowth,
  })
}
