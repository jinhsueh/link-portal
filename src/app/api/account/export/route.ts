import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// GET /api/account/export — export all user data as JSON
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      pages: { include: { blocks: true } },
      socialLinks: true,
      subscribers: true,
      orders: true,
      teamMembers: true,
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Strip sensitive fields
  const { passwordHash, ...safeUser } = user

  return new NextResponse(JSON.stringify(safeUser, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="export-${session.username}.json"`,
    },
  })
}
