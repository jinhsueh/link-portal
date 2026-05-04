import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.user.count()
    return NextResponse.json({
      ok: true,
      database: 'ok',
    })
  } catch {
    return NextResponse.json({
      ok: false,
      database: 'error',
    }, { status: 500 })
  }
}
