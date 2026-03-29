import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

/** GET: list all pages for current user */
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pages = await prisma.page.findMany({
    where: { userId: session.id },
    orderBy: { order: 'asc' },
    include: { _count: { select: { blocks: true } } },
  })
  return NextResponse.json(pages)
}

/** POST: create a new page */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  // Generate a slug from the name
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
    .replace(/^-|-$/g, '') || 'page'

  // Check uniqueness
  const existing = await prisma.page.findUnique({
    where: { userId_slug: { userId: session.id, slug } },
  })
  const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

  const count = await prisma.page.count({ where: { userId: session.id } })

  const page = await prisma.page.create({
    data: {
      userId: session.id,
      name,
      slug: finalSlug,
      order: count,
      isDefault: count === 0,
    },
  })

  return NextResponse.json(page)
}
