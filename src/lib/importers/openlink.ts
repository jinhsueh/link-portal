/**
 * OpenLink importer. OpenLink (openlink.co) is a Thai-market link-in-bio
 * service. Used by travel/lifestyle KOLs like Nong Tum / Nong U (see
 * customer interview note in ~/.claude/plans/hashed-drifting-cake.md).
 *
 * KEY DIFFERENCE FROM Portaly importer:
 * OpenLink is built on Next.js **App Router** (NOT Pages Router). The
 * static HTML doesn't include `<script id="__NEXT_DATA__">` — instead the
 * link/profile data is streamed via React Server Component payloads in
 * many `self.__next_f.push([1, "..."])` script blocks.
 *
 * Strategy:
 *   1. Concat all RSC payloads (each is a JSON-encoded string fragment)
 *   2. Regex-extract flat JSON object literals containing both `"url"`
 *      and `"name"` — that's the link/product shape OpenLink uses
 *   3. Resolve relative `image` filenames against the OpenLink CDN
 *      (`https://m.openlink.co/images/{username}/{filename}`)
 *   4. Fall back to OG meta for profile name/bio/avatar if any field is
 *      missing from the RSC stream
 *
 * Reference data shape from a real profile (https://www.openlink.co/studioowy):
 *   { "url": "https://lin.ee/...", "name": "Line Official", "icon": "line" }
 *   { "image": "studioowy_1770568564_orientation-N.jpg",
 *     "url": "https://s.shopee.co.th/...", "name": "Valentine's Postcard",
 *     "price_currency": "THB" }
 */

import { detectPlatform } from '@/lib/social-platforms'
import type { ImportedProfile, ImportedBlock, ImportedSocialLink } from './types'

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

/** OpenLink CDN base. All `image` filenames in the RSC stream are bare names
 * — must be prefixed with this + the profile username to become absolute. */
const OPENLINK_CDN = 'https://m.openlink.co/images'

/** Generic OG meta extractor — used as a fallback when RSC parse comes up empty. */
function extractOgMeta(html: string): { title?: string; description?: string; image?: string } {
  const grab = (prop: string): string | undefined => {
    const m = html.match(new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`, 'i'))
      || html.match(new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${prop}["']`, 'i'))
    return m?.[1]?.trim() || undefined
  }
  const t = grab('og:title') || grab('twitter:title')
  if (t && /^(?:404|openlink|open\s*link)$/i.test(t)) return {}
  return {
    title: t && !/^open\s*link$/i.test(t) ? t : undefined,
    description: grab('og:description') || grab('twitter:description'),
    image: grab('og:image') || grab('twitter:image'),
  }
}

/**
 * Extract and concat all `self.__next_f.push([1, "<encoded-string>"])` RSC
 * payloads. The encoded strings collectively form the React server-component
 * stream; concatenated they're searchable as one big text blob.
 */
function extractRscStream(html: string): string {
  // Match: self.__next_f.push([<digit>, "<json-encoded string>"])
  // The string is double-quoted JSON (so \" -> " etc when decoded).
  const re = /self\.__next_f\.push\(\[\d+,\s*("(?:\\.|[^"\\])*")\s*\]\)/g
  let all = ''
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    try {
      const decoded = JSON.parse(m[1])
      if (typeof decoded === 'string') all += decoded
    } catch { /* skip malformed payload */ }
  }
  return all
}

/**
 * Find flat JSON object literals in the RSC stream that look like OpenLink
 * link/product items — must have BOTH `"url": "https?://..."` and `"name"` keys.
 *
 * Uses a brace-counting scanner (not a greedy regex) so we cleanly extract
 * objects that contain `null` values, nested empty objects, or escaped
 * quotes inside string values.
 */
function extractItems(rsc: string): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = []
  // Quick filter: only attempt parsing on positions that start with `{"url":"http`
  // or `{"image":"...","url":"http` — the two seen shapes in real OpenLink data.
  const seedRe = /\{"(?:url|image)":"/g
  let seed: RegExpExecArray | null
  while ((seed = seedRe.exec(rsc))) {
    const start = seed.index
    // Walk forward, counting braces, respecting strings + escapes
    let depth = 0
    let inString = false
    let escape = false
    let end = -1
    for (let i = start; i < rsc.length; i++) {
      const c = rsc[i]
      if (escape) { escape = false; continue }
      if (c === '\\') { escape = true; continue }
      if (c === '"') { inString = !inString; continue }
      if (inString) continue
      if (c === '{') depth++
      else if (c === '}') {
        depth--
        if (depth === 0) { end = i + 1; break }
      }
    }
    if (end < 0) continue
    const slice = rsc.slice(start, end)
    try {
      const obj = JSON.parse(slice)
      if (obj && typeof obj === 'object' && typeof obj.url === 'string' && /^https?:\/\//.test(obj.url) && typeof obj.name === 'string') {
        items.push(obj)
      }
    } catch { /* invalid JSON slice — skip */ }
    // Move regex past the closing brace so we don't re-scan inside this object
    seedRe.lastIndex = end
  }
  return items
}

/** Profile picture lives in the RSC stream as a full URL like
 *  `https://m.openlink.co/images/{username}/profile_*.jpg`. */
function findAvatar(rsc: string): string | undefined {
  const m = rsc.match(/https:\/\/m\.openlink\.co\/images\/[^"\\\s]+\/profile_[^"\\\s]+/)
  return m?.[0]
}

/** Cover image — used as fallback when no separate profile picture exists. */
function findCover(rsc: string): string | undefined {
  const m = rsc.match(/https:\/\/m\.openlink\.co\/images\/[^"\\\s]+\/cover_[^"\\\s]+/)
  return m?.[0]
}

function usernameFromUrl(sourceUrl: string): string {
  try {
    return new URL(sourceUrl).pathname.replace(/^\/+|\/+$/g, '').split('/')[0] ?? ''
  } catch { return '' }
}

function resolveImage(image: string, username: string): string {
  if (/^https?:\/\//.test(image)) return image
  return `${OPENLINK_CDN}/${username}/${image}`
}

export async function importFromOpenLink(sourceUrl: string): Promise<ImportedProfile> {
  const normalized = sourceUrl.trim().replace(/\/+$/, '')

  const res = await fetch(normalized, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      // Thai-first; falls back to English so an English profile still parses cleanly.
      'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`OpenLink fetch failed: ${res.status}`)
  const html = await res.text()

  const username = usernameFromUrl(normalized)
  const rsc = extractRscStream(html)
  const items = extractItems(rsc)
  const ogMeta = extractOgMeta(html)

  // ── Build blocks from RSC items ──
  // OpenLink stores everything as a flat link list. Items with an `image`
  // field are visually rendered as product cards on the source page; we map
  // them to `link` blocks here too (with thumbnail) since Beam's product
  // block requires price + checkoutUrl which OpenLink doesn't always supply.
  // Users can re-categorize after import.
  const blocks: ImportedBlock[] = []
  for (const item of items) {
    const url = item.url as string
    const name = (item.name as string) || ''
    const subtitle = (item.subtitle as string | undefined) || undefined
    const image = item.image as string | undefined
    const thumbnail = image ? resolveImage(image, username) : undefined

    blocks.push({
      type: 'link',
      title: name || url,
      content: {
        url,
        ...(subtitle ? { description: subtitle } : {}),
        ...(thumbnail ? { thumbnail } : {}),
      },
      sourceType: image ? 'openlink-card' : 'openlink-link',
    })
  }

  // ── Profile fields: prefer RSC-found avatar, fall back to OG meta ──
  const name = ogMeta.title  // e.g. "STUDIO.OWY" from og:title — RSC display name not consistently extractable
  const bio = ogMeta.description
  const avatarUrl = findAvatar(rsc) || ogMeta.image || findCover(rsc)

  if (blocks.length === 0 && !name && !bio && !avatarUrl) {
    throw new Error('Could not parse the OpenLink page — either the URL is wrong or OpenLink changed their structure.')
  }

  // Split social-platform URLs out from regular blocks (LINE, IG, TikTok, etc.)
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
