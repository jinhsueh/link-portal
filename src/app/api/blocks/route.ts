import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { getPlanLimits, isBlockTypeAllowed, getEffectivePlan } from '@/lib/plan'

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

  // Plan-based block limits
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { plan: true, trialEndsAt: true },
  })
  const limits = getPlanLimits(user!)
  const effectivePlan = getEffectivePlan(user!)

  if (!isBlockTypeAllowed(effectivePlan, type)) {
    return NextResponse.json(
      { error: '此區塊類型需要 Pro 方案，請升級', upgrade: true },
      { status: 403 }
    )
  }

  const blockCount = await prisma.block.count({ where: { pageId } })
  if (blockCount >= limits.maxBlocksPerPage) {
    const msg = limits.maxBlocksPerPage === Infinity
      ? '已達區塊上限'
      : `目前方案每頁最多 ${limits.maxBlocksPerPage} 個區塊，請升級解除限制`
    return NextResponse.json({ error: msg, upgrade: true }, { status: 403 })
  }

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

  revalidateTag('profile', { expire: 0 })
  return NextResponse.json(block)
}
