import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// PATCH /api/team/:id — update member role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { role } = await req.json()

  if (!['editor', 'viewer'].includes(role)) {
    return NextResponse.json({ error: '角色必須是 editor 或 viewer' }, { status: 400 })
  }

  const member = await prisma.teamMember.findUnique({ where: { id } })
  if (!member || member.ownerId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.teamMember.update({
    where: { id },
    data: { role },
  })

  return NextResponse.json(updated)
}
