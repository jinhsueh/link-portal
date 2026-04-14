import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { importFromLinktree } from '@/lib/importers/linktree'
import { importFromPortaly } from '@/lib/importers/portaly'
import type { ImportedProfile, ImportSource } from '@/lib/importers/types'

/**
 * POST /api/import — dry-run preview.
 *
 * Body: { sourceUrl: string }
 *
 * Returns an `ImportedProfile` without writing anything. The frontend shows
 * the preview to the user who then confirms via POST /api/import/apply.
 *
 * Only allows linktr.ee and portaly.cc hosts (SSRF guard).
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sourceUrl } = await req.json().catch(() => ({}))
  if (typeof sourceUrl !== 'string' || !sourceUrl.trim()) {
    return NextResponse.json({ error: '請提供來源網址' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(sourceUrl.trim())
  } catch {
    return NextResponse.json({ error: '網址格式錯誤' }, { status: 400 })
  }
  if (parsed.protocol !== 'https:') {
    return NextResponse.json({ error: '僅支援 https 網址' }, { status: 400 })
  }

  const host = parsed.hostname.toLowerCase()
  let source: ImportSource | null = null
  if (host === 'linktr.ee' || host.endsWith('.linktr.ee')) source = 'linktree'
  else if (host === 'portaly.cc' || host.endsWith('.portaly.cc')) source = 'portaly'

  if (!source) {
    return NextResponse.json({ error: '目前僅支援 linktr.ee 和 portaly.cc' }, { status: 400 })
  }

  try {
    let profile: ImportedProfile
    if (source === 'linktree') profile = await importFromLinktree(parsed.toString())
    else profile = await importFromPortaly(parsed.toString())
    return NextResponse.json(profile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : '匯入失敗'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
