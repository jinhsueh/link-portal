import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: jpg, png, gif, webp, svg' }, { status: 400 })
  }

  // Validate file size (max 4MB)
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Max 4MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'png'
  const filename = `${session.username}/${Date.now()}.${ext}`

  // If BLOB_READ_WRITE_TOKEN is not set, fall back to base64 data URL
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`
    return NextResponse.json({ url: dataUrl })
  }

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return NextResponse.json({ url: blob.url })
}
