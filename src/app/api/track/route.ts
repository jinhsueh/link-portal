import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiter: max 30 requests per IP per 60 seconds
const WINDOW_MS = 60_000
const MAX_REQUESTS = 30
const ipHits = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = ipHits.get(ip)
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_REQUESTS
}

// Periodic cleanup to prevent memory leak (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of ipHits) {
    if (now > entry.resetAt) ipHits.delete(ip)
  }
}, 5 * 60_000)

/**
 * POST /api/track
 * Body: { type: 'click' | 'view', blockId?: string, pageId: string }
 *
 * - "view" increments Block.views for all blocks in the page (called once on page load)
 * - "click" increments Block.clicks for one block + inserts a Click record
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { type, blockId, pageId, referrer, utmSource, utmMedium } = await req.json()

    if (!type || !pageId) {
      return NextResponse.json({ error: 'type and pageId required' }, { status: 400 })
    }

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
