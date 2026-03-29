import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/favicon?url=https://example.com
 * Returns the favicon URL for a given domain using Google's favicon service.
 * This is a simple proxy to avoid CORS issues on the client.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  try {
    const parsed = new URL(url)
    const domain = parsed.hostname
    // Google's public favicon service — reliable and fast
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    return NextResponse.json({ favicon: faviconUrl })
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
}
