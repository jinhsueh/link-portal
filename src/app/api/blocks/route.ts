import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/blocks?pageId=xxx
export async function GET(req: NextRequest) {
  const pageId = req.nextUrl.searchParams.get('pageId')
  if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 })

  const blocks = await prisma.block.findMany({
    where: { pageId },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json(blocks)
}

// POST /api/blocks — create a block
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, pageId, type, title, content } = body

  if (!userId || !pageId || !type) {
    return NextResponse.json({ error: 'userId, pageId, type required' }, { status: 400 })
  }

  const lastBlock = await prisma.block.findFirst({
    where: { pageId },
    orderBy: { order: 'desc' },
  })

  const block = await prisma.block.create({
    data: {
      userId,
      pageId,
      type,
      title: title ?? '',
      content: JSON.stringify(content ?? {}),
      order: (lastBlock?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(block)
}
