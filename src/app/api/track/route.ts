import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/track
 * Body: { type: 'click' | 'view', blockId?: string, pageId: string }
 *
 * - "view" increments Block.views for all blocks in the page (called once on page load)
 * - "click" increments Block.clicks for one block + inserts a Click record
 */
export async function POST(req: NextRequest) {
  try {
    const { type, blockId, pageId, referrer, utmSource, utmMedium } = await req.json()

    if (!type || !pageId) {
      return NextResponse.json({ error: 'type and pageId required' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    if (type === 'view') {
      // Increment views for all active blocks on the page
      await prisma.block.updateMany({
        where: { pageId, active: true },
        data: { views: { increment: 1 } },
      })
      return NextResponse.json({ ok: true })
    }

    if (type === 'click' && blockId) {
      // Increment clicks on the block
      await prisma.block.update({
        where: { id: blockId },
        data: { clicks: { increment: 1 } },
      })
      // Insert analytics click record
      await prisma.click.create({
        data: { blockId, pageId, ip, userAgent, referrer: referrer ?? null, utmSource: utmSource ?? null, utmMedium: utmMedium ?? null },
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 })
  } catch (err) {
    console.error('[track]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
