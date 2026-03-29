import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

/** PATCH: rename a page or change default */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const page = await prisma.page.findUnique({ where: { id } })
  if (!page || page.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { name, isDefault, password } = await req.json()
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (password !== undefined) data.password = password || null // empty string = remove password
  if (isDefault === true) {
    // Unset all other defaults first
    await prisma.page.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    })
    data.isDefault = true
  }

  const updated = await prisma.page.update({ where: { id }, data })
  return NextResponse.json(updated)
}

/** DELETE: remove a page and all its blocks */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const page = await prisma.page.findUnique({ where: { id } })
  if (!page || page.userId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Prevent deleting the last page
  const count = await prisma.page.count({ where: { userId: session.id } })
  if (count <= 1) {
    return NextResponse.json({ error: '至少需要保留一個分頁' }, { status: 400 })
  }

  await prisma.page.delete({ where: { id } })

  // If deleted page was default, make the first remaining page default
  if (page.isDefault) {
    const first = await prisma.page.findFirst({
      where: { userId: session.id },
      orderBy: { order: 'asc' },
    })
    if (first) {
      await prisma.page.update({ where: { id: first.id }, data: { isDefault: true } })
    }
  }

  return NextResponse.json({ ok: true })
}
