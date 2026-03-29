import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

/**
 * POST /api/subscribers — public: collect email from email_form block
 * Body: { email, blockId, pageId }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, blockId, pageId } = await req.json()

    if (!email || !pageId) {
      return NextResponse.json({ error: 'email and pageId required' }, { status: 400 })
    }

    // Find the page owner
    const page = await prisma.page.findUnique({ where: { id: pageId }, select: { userId: true } })
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

    // Upsert subscriber (ignore duplicates)
    await prisma.subscriber.upsert({
      where: { userId_email: { userId: page.userId, email } },
      create: { userId: page.userId, email, blockId: blockId ?? null, source: 'email_form' },
      update: {},
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribers POST]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/subscribers — authenticated: list all subscribers for the current user
 */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscribers = await prisma.subscriber.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ subscribers, total: subscribers.length })
}

/**
 * DELETE /api/subscribers?id=xxx — authenticated: remove a subscriber
 */
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.subscriber.deleteMany({ where: { id, userId: session.id } })
  return NextResponse.json({ ok: true })
}
