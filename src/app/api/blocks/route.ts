import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/blocks?pageId=xxx
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pageId = req.nextUrl.searchParams.get('pageId')
  if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 })

  // Verify page belongs to user
  const page = await prisma.page.findFirst({ where: { id: pageId, userId: session.id } })
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const blocks = await prisma.block.findMany({
    where: { pageId },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(blocks)
}

// POST /api/blocks — create a block
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { pageId, type, title, content } = body

  if (!pageId || !type) {
    return NextResponse.json({ error: 'pageId, type required' }, { status: 400 })
  }

  // Verify page belongs to user
  const page = await prisma.page.findFirst({ where: { id: pageId, userId: session.id } })
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const lastBlock = await prisma.block.findFirst({
    where: { pageId },
    orderBy: { order: 'desc' },
  })

  const block = await prisma.block.create({
    data: {
      userId: session.id,
      pageId,
      type,
      title: title ?? '',
      content: JSON.stringify(content ?? {}),
      order: (lastBlock?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(block)
}
