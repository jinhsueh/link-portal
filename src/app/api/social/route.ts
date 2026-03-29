import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

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
  const { platform, url } = await req.json()
  if (!platform || !url) return NextResponse.json({ error: 'platform and url required' }, { status: 400 })

  const existing = await prisma.socialLink.findUnique({
    where: { userId_platform: { userId: session.id, platform } },
  })

  const link = existing
    ? await prisma.socialLink.update({ where: { id: existing.id }, data: { url } })
    : await prisma.socialLink.create({ data: { userId: session.id, platform, url, order: 0 } })

  return NextResponse.json(link)
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
