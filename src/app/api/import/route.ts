import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { importFromLinktree } from '@/lib/importers/linktree'
import { importFromPortaly } from '@/lib/importers/portaly'
import { importFromOpenLink } from '@/lib/importers/openlink'
import type { ImportedProfile, ImportSource } from '@/lib/importers/types'

/**
 * POST /api/import — dry-run preview.
 *
 * Body: { sourceUrl: string }
 *
 * Returns an `ImportedProfile` without writing anything. The frontend shows
 * the preview to the user who then confirms via POST /api/import/apply.
 *
 * Only allows linktr.ee, portaly.cc, and openlink.* hosts (SSRF guard).
 */
// Hostnames OpenLink might serve from. The Thai service is at openlink.co
// (verified 2026-06 against https://www.openlink.co/studioowy). The other
// .app/.bio/.cc/.io variants are kept defensively in case OpenLink expands
// to those TLDs or routes some traffic through them.
const OPENLINK_HOSTS = ['openlink.co', 'openlink.app', 'openlink.cc', 'openlink.bio', 'openlink.io']
function isOpenLinkHost(h: string): boolean {
  return OPENLINK_HOSTS.some(d => h === d || h.endsWith(`.${d}`))
}
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sourceUrl } = await req.json().catch(() => ({}))
  if (typeof sourceUrl !== 'string' || !sourceUrl.trim()) {
    return NextResponse.json({ error: 'Please provide a source URL.' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(sourceUrl.trim())
  } catch {
    return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 })
  }
  if (parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only https URLs are supported.' }, { status: 400 })
  }

  const host = parsed.hostname.toLowerCase()
  let source: ImportSource | null = null
  if (host === 'linktr.ee' || host.endsWith('.linktr.ee')) source = 'linktree'
  else if (host === 'portaly.cc' || host.endsWith('.portaly.cc')) source = 'portaly'
  else if (isOpenLinkHost(host)) source = 'openlink'

  if (!source) {
    return NextResponse.json({ error: 'Only linktr.ee, portaly.cc, and openlink.* are supported.' }, { status: 400 })
  }

  try {
    let profile: ImportedProfile
    if (source === 'linktree') profile = await importFromLinktree(parsed.toString())
    else if (source === 'portaly') profile = await importFromPortaly(parsed.toString())
    else profile = await importFromOpenLink(parsed.toString())
    return NextResponse.json(profile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Import failed.'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
