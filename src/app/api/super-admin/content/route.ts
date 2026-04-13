import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = req.nextUrl
  const type = url.searchParams.get('type') || 'blocks'
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const search = url.searchParams.get('search') || ''

  if (type === 'pages') {
    const where: any = {}
    if (search) where.name = { contains: search }

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        include: {
          user: { select: { username: true, email: true } },
          _count: { select: { blocks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.page.count({ where }),
    ])

    return NextResponse.json({ items: pages, total, page, totalPages: Math.ceil(total / limit), type: 'pages' })
  }

  // Default: blocks
  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { type: { contains: search } },
    ]
  }

  const [blocks, total] = await Promise.all([
    prisma.block.findMany({
      where,
      select: {
        id: true, type: true, title: true, active: true, clicks: true, views: true,
        createdAt: true, updatedAt: true,
        user: { select: { username: true, email: true } },
        page: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.block.count({ where }),
  ])

  return NextResponse.json({ items: blocks, total, page, totalPages: Math.ceil(total / limit), type: 'blocks' })
}
