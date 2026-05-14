import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

/**
 * GET /api/scrape-image?url=<url>
 *
 * Light-weight og:image / twitter:image extractor. Used by the product block
 * editor's "從網址抓圖" button so creators can paste their checkout URL
 * (Stripe / Gumroad / etc.) and skip manually uploading a product photo.
 *
 * Why a separate endpoint vs. inlining into the editor: server-side fetch
 * dodges CORS, and we can spoof a desktop user-agent so anti-bot pages
 * still serve their public OG tags. The actual image stays remote (we
 * return the URL) — saves us from re-uploading every product preview.
 */

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

export async function GET(req: NextRequest) {
  // Auth-gate it — without auth this becomes an open SSRF proxy.
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  // Basic URL safety: must parse, must be http(s), reject internal/loopback
  // hostnames so we don't proxy into internal infra.
  let target: URL
  try {
    target = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http(s) URLs are supported' }, { status: 400 })
  }
  const host = target.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' ||
      host.endsWith('.local') || host.endsWith('.internal') ||
      // RFC 1918 + link-local quick check. Not bullet-proof (DNS rebinding
      // would still slip through) but good enough to keep casual abuse out.
      /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      /^169\.254\./.test(host)) {
    return NextResponse.json({ error: 'URL host not allowed' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(target.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return NextResponse.json({ error: `Source returned ${res.status}` }, { status: 502 })

    // Read first ~256KB only — OG tags live in <head>, anything past 256KB
    // is the body and unhelpful for image discovery.
    const reader = res.body?.getReader()
    if (!reader) return NextResponse.json({ error: 'No body from source' }, { status: 502 })
    const chunks: Uint8Array[] = []
    let total = 0
    const LIMIT = 256 * 1024
    while (total < LIMIT) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
    reader.cancel().catch(() => {})
    const html = new TextDecoder('utf-8').decode(
      new Uint8Array(chunks.reduce<number[]>((acc, c) => acc.concat(Array.from(c)), []))
    )

    const grab = (prop: string): string | undefined => {
      const m = html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i'))
      return m?.[1]?.trim() || undefined
    }
    let image = grab('og:image') || grab('twitter:image') || grab('og:image:secure_url')
    // Resolve relative URLs against the page URL — sites occasionally serve
    // og:image as `/static/foo.jpg` without a host.
    if (image && !/^https?:\/\//i.test(image)) {
      try { image = new URL(image, target.toString()).toString() } catch { /* keep as-is */ }
    }
    const title = grab('og:title') || grab('twitter:title')
    const description = grab('og:description') || grab('twitter:description')

    if (!image) return NextResponse.json({ error: 'No preview image available for this URL.' }, { status: 404 })

    return NextResponse.json({ image, title, description })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
