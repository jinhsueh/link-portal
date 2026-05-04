import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// GET /api/profile?username=xxx — fetch public profile (used by public pages)
export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 })

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      pages: {
        orderBy: { order: 'asc' },
        include: { blocks: { orderBy: { order: 'asc' } } },
      },
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })

  if (!user) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(user)
}

// POST /api/profile — update own profile (authenticated)
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, bio, avatarUrl, bannerUrl } = body

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bannerUrl !== undefined && { bannerUrl }),
    },
  })

  return NextResponse.json(user)
}
