import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

// PATCH /api/blocks/:id — update title, content, active, order
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Verify block belongs to user
  const existing = await prisma.block.findFirst({ where: { id, userId: session.id } })
  if (!existing) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  // Verify the destination page (if any) belongs to the user too.
  // Without this check, a malicious client could move blocks onto other
  // users' pages by guessing pageIds.
  if (body.pageId !== undefined) {
    const dest = await prisma.page.findFirst({
      where: { id: body.pageId, userId: session.id },
    })
    if (!dest) return NextResponse.json({ error: 'Destination page not found' }, { status: 404 })
  }

  const block = await prisma.block.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: JSON.stringify(body.content) }),
      ...(body.active !== undefined && { active: body.active }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.pageId !== undefined && { pageId: body.pageId }),
      ...(body.scheduleStart !== undefined && { scheduleStart: body.scheduleStart ? new Date(body.scheduleStart) : null }),
      ...(body.scheduleEnd !== undefined && { scheduleEnd: body.scheduleEnd ? new Date(body.scheduleEnd) : null }),
      ...(body.pinned !== undefined && { pinned: !!body.pinned }),
    },
  })

  return NextResponse.json(block)
}

// DELETE /api/blocks/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify block belongs to user
  const existing = await prisma.block.findFirst({ where: { id, userId: session.id } })
  if (!existing) return NextResponse.json({ error: 'Block not found' }, { status: 404 })

  await prisma.block.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
