import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

/**
 * GET /api/analytics — returns daily click counts for the last 14 days
 */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all block IDs for this user
  const blocks = await prisma.block.findMany({
    where: { userId: session.id },
    select: { id: true },
  })
  const blockIds = blocks.map(b => b.id)

  if (blockIds.length === 0) {
    return NextResponse.json({ daily: [], totalClicks: 0, totalViews: 0 })
  }

  // Get clicks from the last 14 days
  const since = new Date()
  since.setDate(since.getDate() - 13)
  since.setHours(0, 0, 0, 0)

  const clicks = await prisma.click.findMany({
    where: {
      blockId: { in: blockIds },
      createdAt: { gte: since },
    },
    select: { createdAt: true },
  })

  // Aggregate by day
  const dayMap: Record<string, number> = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    dayMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const c of clicks) {
    const key = new Date(c.createdAt).toISOString().slice(0, 10)
    if (dayMap[key] !== undefined) dayMap[key]++
  }

  const daily = Object.entries(dayMap).map(([date, clicks]) => ({ date, clicks }))

  // Also get aggregate stats
  const agg = await prisma.block.aggregate({
    where: { userId: session.id },
    _sum: { clicks: true, views: true },
  })

  return NextResponse.json({
    daily,
    totalClicks: agg._sum.clicks ?? 0,
    totalViews: agg._sum.views ?? 0,
  })
}
