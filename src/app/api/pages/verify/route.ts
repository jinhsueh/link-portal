import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/pages/verify
 * Body: { pageId, password }
 * Returns 200 if password matches, 403 if not
 */
export async function POST(req: NextRequest) {
  try {
    const { pageId, password } = await req.json()
    if (!pageId || !password) {
      return NextResponse.json({ error: 'pageId and password required' }, { status: 400 })
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { password: true },
    })

    if (!page || !page.password) {
      return NextResponse.json({ error: 'Page not found or no password set' }, { status: 404 })
    }

    if (page.password === password) {
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Wrong password' }, { status: 403 })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
