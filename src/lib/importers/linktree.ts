/**
 * Linktree importer. Linktree's frontend is Next.js, so the entire profile
 * payload is embedded in `<script id="__NEXT_DATA__">…</script>` as JSON —
 * much more stable than scraping DOM.
 *
 * Given a URL like `https://linktr.ee/username`, this returns an
 * `ImportedProfile` with blocks + social links mapped into our schema.
 */

import { detectPlatform } from '@/lib/social-platforms'
import type { ImportedProfile, ImportedBlock, ImportedSocialLink } from './types'

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

/** Extract the first `<script id="__NEXT_DATA__">…</script>` JSON block. */
function extractNextData(html: string): unknown {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/)
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

interface LinktreeLink {
  id?: string | number
  title?: string
  url?: string | null
  type?: string
  thumbnail?: string | null
  description?: string | null
  amazonAffiliate?: unknown
  position?: number
  locked?: unknown
}

interface LinktreeAccount {
  username?: string
  pageTitle?: string
  profilePictureUrl?: string
  description?: string
  socialLinks?: Array<{ type?: string; url?: string }>
  links?: LinktreeLink[]
}

interface LinktreeNextData {
  props?: {
    pageProps?: {
      account?: LinktreeAccount
      links?: LinktreeLink[]
      // newer Linktree payloads
      username?: string
    }
  }
}

/** Map a Linktree link into our ImportedBlock shape. */
function mapLink(link: LinktreeLink): ImportedBlock | null {
  const title = (link.title ?? '').trim()
  const url = (link.url ?? '').trim()
  if (!url) return null

  const sourceType = link.type ?? 'CLASSIC'
  const base: ImportedBlock = {
    type: 'link',
    title: title || url,
    content: {
      url,
      ...(link.description ? { description: link.description } : {}),
      ...(link.thumbnail ? { thumbnail: link.thumbnail } : {}),
    },
    sourceType,
  }

  // Linktree has many subtypes (YOUTUBE_VIDEO, MUSIC_PLAYER, HEADER, etc.).
  // The safest default is to render them all as 'link' — we mark exotic types
  // as `downgraded` so the preview UI can warn the user.
  if (sourceType !== 'CLASSIC' && sourceType !== 'URL') {
    base.downgraded = true
  }
  return base
}

export async function importFromLinktree(sourceUrl: string): Promise<ImportedProfile> {
  const normalized = sourceUrl.trim().replace(/\/+$/, '')

  const res = await fetch(normalized, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    // Next.js 16: disable caching for live scrape
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Linktree fetch failed: ${res.status}`)
  }
  const html = await res.text()

  const data = extractNextData(html) as LinktreeNextData | null
  const pageProps = data?.props?.pageProps
  const account: LinktreeAccount = pageProps?.account ?? {}
  // Some payloads put links under account.links, some under pageProps.links
  const rawLinks: LinktreeLink[] = account.links ?? pageProps?.links ?? []

  if (!pageProps || (rawLinks.length === 0 && !account.pageTitle)) {
    throw new Error('無法解析 Linktree 頁面，可能是連結錯誤或 Linktree 已更新結構')
  }

  // Sort by position if provided
  const sorted = [...rawLinks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  const blocks: ImportedBlock[] = []
  for (const l of sorted) {
    const mapped = mapLink(l)
    if (mapped) blocks.push(mapped)
  }

  const socialLinks: ImportedSocialLink[] = []
  const seen = new Set<string>()
  for (const s of account.socialLinks ?? []) {
    const url = (s.url ?? '').trim()
    if (!url || seen.has(url)) continue
    seen.add(url)
    const platform = s.type?.toLowerCase() || detectPlatform(url)
    socialLinks.push({ platform, url })
  }

  return {
    source: 'linktree',
    sourceUrl: normalized,
    name: account.pageTitle || account.username || pageProps.username,
    bio: account.description || undefined,
    avatarUrl: account.profilePictureUrl || undefined,
    blocks,
    socialLinks,
  }
}
