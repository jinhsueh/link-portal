import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, bio, avatarUrl } = await req.json()
  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
  })
  return NextResponse.json(user)
}
