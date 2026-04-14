import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getPlanLimits } from '@/lib/plan'

// GET /api/team — list team members
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const members = await prisma.teamMember.findMany({
    where: { ownerId: session.id },
    orderBy: { invitedAt: 'desc' },
  })
  return NextResponse.json(members)
}

// POST /api/team — invite a team member
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, role } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email 格式不正確' }, { status: 400 })
  }
  if (!['editor', 'viewer'].includes(role)) {
    return NextResponse.json({ error: '角色必須是 editor 或 viewer' }, { status: 400 })
  }

  // Plan-based team member limit
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { plan: true, trialEndsAt: true },
  })
  const limits = getPlanLimits(user!)
  if (limits.maxTeamMembers === 0) {
    return NextResponse.json(
      { error: '免費方案不支援團隊協作，請升級 Pro', upgrade: true },
      { status: 403 }
    )
  }
  // Only count if the member doesn't already exist (upsert below)
  const existing = await prisma.teamMember.findUnique({
    where: { ownerId_memberEmail: { ownerId: session.id, memberEmail: email } },
  })
  if (!existing) {
    const currentCount = await prisma.teamMember.count({ where: { ownerId: session.id } })
    if (currentCount >= limits.maxTeamMembers) {
      const msg = limits.maxTeamMembers === Infinity
        ? '已達團隊成員上限'
        : `目前方案最多 ${limits.maxTeamMembers} 位團隊成員，請升級 Premium 解除限制`
      return NextResponse.json({ error: msg, upgrade: true }, { status: 403 })
    }
  }

  const member = await prisma.teamMember.upsert({
    where: { ownerId_memberEmail: { ownerId: session.id, memberEmail: email } },
    create: {
      ownerId: session.id,
      memberEmail: email,
      role,
      status: 'active',
      acceptedAt: new Date(),
    },
    update: { role },
  })

  return NextResponse.json(member)
}

// DELETE /api/team?id=xxx — remove a team member
export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Verify ownership
  const member = await prisma.teamMember.findUnique({ where: { id } })
  if (!member || member.ownerId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.teamMember.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
