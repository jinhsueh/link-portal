import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// POST /api/blocks/reorder — { orderedIds: string[] }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderedIds } = await req.json()

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'orderedIds array required' }, { status: 400 })
  }

  // Verify all blocks belong to user
  const blocks = await prisma.block.findMany({
    where: { id: { in: orderedIds }, userId: session.id },
    select: { id: true },
  })
  if (blocks.length !== orderedIds.length) {
    return NextResponse.json({ error: 'Some blocks not found' }, { status: 404 })
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.block.update({ where: { id }, data: { order: index } })
    )
  )

  revalidateTag('profile', { expire: 0 })
  return NextResponse.json({ ok: true })
}
