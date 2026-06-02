/**
 * OpenLink importer. OpenLink is a Thai link-in-bio service used by
 * regional travel / lifestyle KOLs (see customer interview note in
 * ~/.claude/plans/hashed-drifting-cake.md).
 *
 * Strategy mirrors the Portaly importer — these are structurally similar
 * Asian-market link-in-bio platforms, typically built on React/Next.js
 * with profiles rendered server-side via __NEXT_DATA__ payload:
 *   1. Try `__NEXT_DATA__` (covers the Next.js case).
 *   2. Fall back to DOM scraping: find anchor tags pointing off-host.
 *      Pre-strip <style>/<script> so CSS-in-JS payloads don't leak.
 *   3. Final fallback: OG meta tags so the user at least gets name/bio/avatar
 *      even if the link list is fully client-rendered and not in the HTML.
 *
 * If we can't find anything we throw — better than silently importing
 * a half-broken profile.
 */

import { detectPlatform } from '@/lib/social-platforms'
import type { ImportedProfile, ImportedBlock, ImportedSocialLink } from './types'

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

/** Generic OG meta extractor — same shape as the Portaly importer. */
function extractOgMeta(html: string): { title?: string; description?: string; image?: string } {
  const grab = (prop: string): string | undefined => {
    const m = html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i'))
    return m?.[1]?.trim() || undefined
  }
  const t = grab('og:title') || grab('twitter:title')
  // Skip generic OpenLink fallback titles (e.g. when hitting a 404 / landing page)
  if (t && /^(?:404|openlink|open\s*link)$/i.test(t)) return {}
  return {
    title: t && !/^open\s*link$/i.test(t) ? t : undefined,
    description: grab('og:description') || grab('twitter:description'),
    image: grab('og:image') || grab('twitter:image'),
  }
}

function extractNextData(html: string): unknown {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

/**
 * Walk a JSON tree looking for arrays of link-shaped objects. Same heuristic
 * as the Portaly importer — survives minor schema drift.
 */
function findLinkArrays(obj: unknown, acc: Array<Array<Record<string, unknown>>> = []): Array<Array<Record<string, unknown>>> {
  if (!obj || typeof obj !== 'object') return acc
  if (Array.isArray(obj)) {
    if (obj.length > 0 && obj.every(v => v && typeof v === 'object' && !Array.isArray(v))) {
      const items = obj as Array<Record<string, unknown>>
      const looksLikeLinks = items.some(it => {
        const urlKey = 'url' in it || 'link' in it || 'href' in it || 'targetUrl' in it
        const titleKey = 'title' in it || 'name' in it || 'label' in it || 'text' in it
        return urlKey && titleKey
      })
      if (looksLikeLinks) acc.push(items)
    }
    for (const v of obj) findLinkArrays(v, acc)
    return acc
  }
  for (const v of Object.values(obj as Record<string, unknown>)) findLinkArrays(v, acc)
  return acc
}

function pickString(o: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return undefined
}

function mapGenericLink(item: Record<string, unknown>): ImportedBlock | null {
  const url = pickString(item, ['url', 'link', 'href', 'targetUrl'])
  const title = pickString(item, ['title', 'name', 'label', 'text'])
  if (!url) return null
  return {
    type: 'link',
    title: title || url,
    content: {
      url,
      ...(pickString(item, ['description', 'subtitle']) ? { description: pickString(item, ['description', 'subtitle']) } : {}),
      ...(pickString(item, ['thumbnail', 'imageUrl', 'image']) ? { thumbnail: pickString(item, ['thumbnail', 'imageUrl', 'image']) } : {}),
    },
    sourceType: 'openlink-link',
  }
}

/**
 * Strip <style>/<script>/comments entirely so their bodies don't leak into
 * anchor "text" when we run the regex tag-stripper. Same defensive cleanup
 * as Portaly because both platforms ship CSS-in-JS payloads inline.
 */
function stripStyleAndScript(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
}

/** Last-resort: regex anchor scrape. Skips same-origin nav, mailto, anchors. */
function fallbackExtractAnchors(html: string, sourceUrl: string): ImportedBlock[] {
  const clean = stripStyleAndScript(html)
  const blocks: ImportedBlock[] = []
  const seen = new Set<string>()
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  const origin = (() => { try { return new URL(sourceUrl).origin } catch { return '' } })()
  let m: RegExpExecArray | null
  while ((m = re.exec(clean))) {
    const href = m[1]
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue
    // Skip same-origin nav (back-to-OpenLink links etc.)
    if (href.startsWith('/') || (origin && href.startsWith(origin))) continue
    if (seen.has(href)) continue
    seen.add(href)
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    // Defensive: skip if text looks like leftover CSS
    if (!text || /^[.#]?[\w-]+\s*\{/.test(text)) continue
    blocks.push({
      type: 'link',
      title: text,
      content: { url: href },
      sourceType: 'openlink-anchor',
    })
  }
  return blocks
}

export async function importFromOpenLink(sourceUrl: string): Promise<ImportedProfile> {
  const normalized = sourceUrl.trim().replace(/\/+$/, '')

  const res = await fetch(normalized, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      // Thai-first since the platform's primary market is Thailand. Falls back
      // to English so an English profile still parses cleanly.
      'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`OpenLink fetch failed: ${res.status}`)
  const html = await res.text()

  // ── Try __NEXT_DATA__ first ──
  const data = extractNextData(html)
  let blocks: ImportedBlock[] = []
  let name: string | undefined
  let bio: string | undefined
  let avatarUrl: string | undefined

  if (data) {
    const candidates = findLinkArrays(data)
    const best = candidates.sort((a, b) => b.length - a.length)[0] ?? []
    for (const item of best) {
      const mapped = mapGenericLink(item)
      if (mapped) blocks.push(mapped)
    }

    const walkForString = (o: unknown, keys: string[]): string | undefined => {
      if (!o || typeof o !== 'object') return undefined
      if (Array.isArray(o)) {
        for (const v of o) {
          const r = walkForString(v, keys)
          if (r) return r
        }
        return undefined
      }
      const rec = o as Record<string, unknown>
      for (const k of keys) {
        const v = rec[k]
        if (typeof v === 'string' && v.trim()) return v.trim()
      }
      for (const v of Object.values(rec)) {
        const r = walkForString(v, keys)
        if (r) return r
      }
      return undefined
    }
    name = walkForString(data, ['displayName', 'pageTitle', 'name', 'username'])
    bio = walkForString(data, ['bio', 'description', 'tagline'])
    avatarUrl = walkForString(data, ['avatarUrl', 'profilePictureUrl', 'avatar', 'image'])
  }

  // ── Fallback: DOM anchor scrape ──
  if (blocks.length === 0) {
    blocks = fallbackExtractAnchors(html, normalized)
  }

  // ── Final fallback: OG meta tags ──
  if (!name || !bio || !avatarUrl) {
    const ogMeta = extractOgMeta(html)
    name = name || ogMeta.title
    bio = bio || ogMeta.description
    avatarUrl = avatarUrl || ogMeta.image
  }

  if (blocks.length === 0 && !name && !bio && !avatarUrl) {
    throw new Error('Could not parse the OpenLink page — either the URL is wrong or OpenLink changed their structure.')
  }

  // Split social-platform URLs out from regular blocks
  const socialLinks: ImportedSocialLink[] = []
  const keptBlocks: ImportedBlock[] = []
  const seenSocial = new Set<string>()
  for (const b of blocks) {
    const url = (b.content.url as string | undefined) ?? ''
    const platform = detectPlatform(url)
    if (platform !== 'custom' && !seenSocial.has(url)) {
      seenSocial.add(url)
      socialLinks.push({ platform, url })
    } else {
      keptBlocks.push(b)
    }
  }

  return {
    source: 'openlink',
    sourceUrl: normalized,
    name,
    bio,
    avatarUrl,
    blocks: keptBlocks,
    socialLinks,
  }
}
