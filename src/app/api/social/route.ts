import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { detectPlatform } from '@/lib/social-platforms'

// GET /api/social
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const links = await prisma.socialLink.findMany({
    where: { userId: session.id }, orderBy: { order: 'asc' },
  })
  return NextResponse.json(links)
}

// POST /api/social — upsert a social link
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { platform, url, label } = await req.json()
  if (!platform || !url) return NextResponse.json({ error: 'platform and url required' }, { status: 400 })

  const existing = await prisma.socialLink.findUnique({
    where: { userId_url: { userId: session.id, url } },
  })

  const link = existing
    ? await prisma.socialLink.update({ where: { id: existing.id }, data: { platform, url, label } })
    : await prisma.socialLink.create({ data: { userId: session.id, platform, url, label, order: 0 } })

  return NextResponse.json(link)
}

// PUT /api/social — batch save all social links
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { links } = await req.json()
  if (!Array.isArray(links)) return NextResponse.json({ error: 'links array required' }, { status: 400 })

  const created = await prisma.$transaction(async (tx) => {
    await tx.socialLink.deleteMany({ where: { userId: session.id } })
    const results = []
    for (const item of links) {
      const { url, label, order, iconUrl } = item as { url: string; label?: string; order: number; iconUrl?: string }
      if (!url) continue
      const platform = detectPlatform(url)
      const link = await tx.socialLink.create({
        data: {
          userId: session.id,
          platform,
          url,
          label,
          order,
          ...(iconUrl ? { iconUrl } : {}),
        },
      })
      results.push(link)
    }
    return results
  })

  return NextResponse.json(created)
}

// DELETE /api/social?platform=xxx
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const platform = req.nextUrl.searchParams.get('platform')
  if (!platform) return NextResponse.json({ error: 'platform required' }, { status: 400 })
  await prisma.socialLink.deleteMany({ where: { userId: session.id, platform } })
  return NextResponse.json({ ok: true })
}
