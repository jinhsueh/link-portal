import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/blocks/reorder — { pageId, orderedIds: string[] }
export async function POST(req: NextRequest) {
  const { orderedIds } = await req.json()

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'orderedIds array required' }, { status: 400 })
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.block.update({ where: { id }, data: { order: index } })
    )
  )

  return NextResponse.json({ ok: true })
}
