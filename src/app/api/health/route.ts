import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hasTurso = !!process.env.TURSO_DATABASE_URL
    const tursoUrl = process.env.TURSO_DATABASE_URL?.substring(0, 30) + '...'
    const hasDbUrl = !!process.env.DATABASE_URL

    // Try a simple query
    const userCount = await prisma.user.count()

    return NextResponse.json({
      ok: true,
      hasTurso,
      tursoUrl,
      hasDbUrl,
      userCount,
      nodeEnv: process.env.NODE_ENV,
    })
  } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({
      ok: false,
      error: e.message,
      hasTurso: !!process.env.TURSO_DATABASE_URL,
      tursoUrl: process.env.TURSO_DATABASE_URL?.substring(0, 30) + '...',
      hasDbUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    }, { status: 500 })
  }
}
