/**
 * Portaly importer. Portaly (portaly.cc) is a Taiwanese link-in-bio service.
 *
 * Strategy:
 * 1. Try `__NEXT_DATA__` (Portaly's public pages are Next.js) — same tactic
 *    as the Linktree importer.
 * 2. Fall back to DOM scraping: look for anchor tags under the main profile
 *    container. Uses simple regex-based extraction to avoid adding `cheerio`
 *    as a dependency for MVP.
 *
 * The fallback is intentionally conservative: if we can't find a clear link
 * list we throw, so the user knows to report the issue rather than seeing a
 * partial import.
 */

import { detectPlatform } from '@/lib/social-platforms'
import type { ImportedProfile, ImportedBlock, ImportedSocialLink } from './types'

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

function extractNextData(html: string): unknown {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

/**
 * Walk an arbitrary object looking for array(s) that look like link lists —
 * objects with both `url`/`href` and `title`/`name` fields. This lets us
 * survive minor schema changes in Portaly's data payload.
 */
function findLinkArrays(obj: unknown, acc: Array<Array<Record<string, unknown>>> = []): Array<Array<Record<string, unknown>>> {
  if (!obj || typeof obj !== 'object') return acc
  if (Array.isArray(obj)) {
    if (obj.length > 0 && obj.every(v => v && typeof v === 'object' && !Array.isArray(v))) {
      const items = obj as Array<Record<string, unknown>>
      const looksLikeLinks = items.some(it => {
        const urlKey = 'url' in it || 'link' in it || 'href' in it
        const titleKey = 'title' in it || 'name' in it || 'label' in it
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
  const url = pickString(item, ['url', 'link', 'href'])
  const title = pickString(item, ['title', 'name', 'label'])
  if (!url) return null
  return {
    type: 'link',
    title: title || url,
    content: {
      url,
      ...(pickString(item, ['description', 'subtitle']) ? { description: pickString(item, ['description', 'subtitle']) } : {}),
      ...(pickString(item, ['thumbnail', 'imageUrl', 'image']) ? { thumbnail: pickString(item, ['thumbnail', 'imageUrl', 'image']) } : {}),
    },
    sourceType: 'portaly-link',
  }
}

/**
 * Strip `<style>...</style>` and `<script>...</script>` blocks (and HTML
 * comments) entirely, *contents and all*. The plain `<[^>]+>` regex used by
 * `extractAnchorText` only removes the tag delimiters — the CSS/JS body
 * survives, which on Portaly (Emotion CSS-in-JS) means anchor "text" ends
 * up like `.css-kkoiw7{width:1.75em;…}` instead of the actual title.
 */
function stripStyleAndScript(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

/** Decode common HTML entities found in anchor text (Portaly emits these). */
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

/** Fallback: extract anchor tags from HTML via regex. */
function fallbackExtractAnchors(html: string, sourceUrl: string): ImportedBlock[] {
  // Pre-clean: remove <style>, <script>, comments — otherwise their bodies
  // leak into the "text" inside anchors when we strip tags below.
  const clean = stripStyleAndScript(html)

  const blocks: ImportedBlock[] = []
  const seen = new Set<string>()
  // Match <a href="..." …>…text…</a>
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  const origin = (() => { try { return new URL(sourceUrl).origin } catch { return '' } })()
  let m: RegExpExecArray | null
  while ((m = re.exec(clean))) {
    const href = m[1]
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue
    if (href.startsWith('/') || (origin && href.startsWith(origin))) continue // skip nav/same-origin
    if (seen.has(href)) continue
    seen.add(href)
    // Strip remaining tags, collapse whitespace, decode entities.
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    // Final safety: skip if text still looks like CSS/JS (defensive).
    if (!text || /^[.#]?[\w-]+\s*\{/.test(text)) continue
    blocks.push({
      type: 'link',
      title: text,
      content: { url: href },
      sourceType: 'portaly-anchor',
    })
  }
  return blocks
}

export async function importFromPortaly(sourceUrl: string): Promise<ImportedProfile> {
  const normalized = sourceUrl.trim().replace(/\/+$/, '')

  const res = await fetch(normalized, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Portaly fetch failed: ${res.status}`)
  const html = await res.text()

  // ── Try __NEXT_DATA__ first ──
  const data = extractNextData(html)
  let blocks: ImportedBlock[] = []
  let name: string | undefined
  let bio: string | undefined
  let avatarUrl: string | undefined

  if (data) {
    // Walk the payload for link-shaped arrays; use the biggest one.
    const candidates = findLinkArrays(data)
    const best = candidates.sort((a, b) => b.length - a.length)[0] ?? []
    for (const item of best) {
      const mapped = mapGenericLink(item)
      if (mapped) blocks.push(mapped)
    }

    // Try to discover profile fields in pageProps/profile/user
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

  if (blocks.length === 0) {
    throw new Error('無法解析 Portaly 頁面，可能是連結錯誤或 Portaly 已更新結構')
  }

  // Split out social-platform URLs from regular blocks
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
    source: 'portaly',
    sourceUrl: normalized,
    name,
    bio,
    avatarUrl,
    blocks: keptBlocks,
    socialLinks,
  }
}
