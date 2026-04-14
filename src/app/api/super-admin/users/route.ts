import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = req.nextUrl
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const search = url.searchParams.get('search') || ''
  const planFilter = url.searchParams.get('plan') || ''

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { username: { contains: search } },
      { email: { contains: search } },
      { name: { contains: search } },
    ]
  }
  if (planFilter) where.plan = planFilter

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, username: true, email: true, name: true, avatarUrl: true,
        plan: true, trialEndsAt: true, role: true, banned: true, createdAt: true,
        _count: { select: { pages: true, blocks: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
