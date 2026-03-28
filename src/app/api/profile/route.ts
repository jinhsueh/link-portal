import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/profile?username=xxx — fetch full profile for admin
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

// POST /api/profile — create or update profile
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { username, name, bio, avatarUrl } = body

  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 })

  const user = await prisma.user.upsert({
    where: { username },
    create: {
      username,
      email: body.email ?? `${username}@placeholder.local`,
      name,
      bio,
      avatarUrl,
      pages: {
        create: {
          name: '主頁',
          slug: 'home',
          isDefault: true,
          order: 0,
        },
      },
    },
    update: { name, bio, avatarUrl },
  })

  return NextResponse.json(user)
}
