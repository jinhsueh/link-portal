import { NextRequest, NextResponse } from 'next/server'
import { getSession, requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

/**
 * GET / POST /api/account/cleanup-imports
 *
 * One-shot DB cleanup for blocks polluted by Emotion CSS-in-JS leak from the
 * Portaly importer (pre-fix). Scans the calling user's blocks and rewrites
 * titles that contain Emotion-style CSS rules, stripping them and keeping
 * only the real text. If nothing real remains, the block is deleted.
 *
 * GET allowed too so the user can just open the URL in a logged-in browser
 * tab — no curl / fetch / DevTools needed.
 *
 * Idempotent: running twice is safe.
 */

/**
 * Match a single CSS rule like `.css-abc{width:1.75em;color:red}` or
 * `#foo{color:red}`. Greedy on rule-body so it spans the full `{...}`.
 */
const FULL_CSS_RULE = /[.#]?[\w-]+\s*\{[^{}]*\}/g

/**
 * Match a *truncated* / unclosed CSS rule that runs to the end of the string,
 * e.g. when the title was cut off mid-rule by a column length limit:
 *   ".css-kkoiw7{width:1.75em;height:1.75em;display..."
 * Strips the entire dangling rule.
 */
const UNCLOSED_CSS_RULE_AT_END = /[.#]?[\w-]+\s*\{[^{}]*$/

/** Strip every CSS rule (closed or unclosed-at-end) from a string. */
function stripCssRules(s: string): string {
  let out = s.replace(FULL_CSS_RULE, ' ').replace(UNCLOSED_CSS_RULE_AT_END, ' ')
  // Collapse whitespace and trim. Also strip leading/trailing punctuation
  // that might be left over (commas, dots, slashes).
  out = out.replace(/\s+/g, ' ').trim()
  out = out.replace(/^[\s.,/\\]+|[\s.,/\\]+$/g, '')
  return out
}

/**
 * Whether the title looks polluted enough to need cleaning. Conservative —
 * we only touch titles that clearly contain Emotion-style class+brace patterns.
 */
function looksLikeCssLeak(title: string): boolean {
  return /[.#]?[\w-]+\s*\{/.test(title) && /(css-|style|width|height|max-width|display|position|margin|padding|color|background|font|flex)/i.test(title)
}

async function cleanup(userId: string) {
  const blocks = await prisma.block.findMany({
    where: { userId },
    select: { id: true, title: true, type: true },
  })

  let fixed = 0
  let deleted = 0
  const samples: Array<{ id: string; before: string; after: string; action: 'fixed' | 'deleted' }> = []

  for (const b of blocks) {
    const before = b.title ?? ''
    if (!looksLikeCssLeak(before)) continue

    const after = stripCssRules(before)

    if (!after) {
      await prisma.block.delete({ where: { id: b.id } })
      deleted++
      if (samples.length < 20) samples.push({ id: b.id, before: before.slice(0, 100), after: '(deleted)', action: 'deleted' })
    } else {
      await prisma.block.update({ where: { id: b.id }, data: { title: after } })
      fixed++
      if (samples.length < 20) samples.push({ id: b.id, before: before.slice(0, 100), after, action: 'fixed' })
    }
  }

  return { scanned: blocks.length, fixed, deleted, samples }
}

/**
 * Resolve which user's blocks to clean. By default: the authenticated caller's
 * own blocks. With `?username=xxx` an admin can target a specific account
 * (used to fix imports that were done while logged in as a different test
 * account).
 */
async function resolveTargetUserId(req: NextRequest): Promise<{ id: string; username: string } | { error: string; status: number }> {
  const url = new URL(req.url)
  const target = url.searchParams.get('username')

  if (target) {
    const admin = await requireAdmin()
    if (!admin) return { error: 'Forbidden — username override requires super-admin', status: 403 }
    const user = await prisma.user.findUnique({ where: { username: target }, select: { id: true, username: true } })
    if (!user) return { error: `User "${target}" not found`, status: 404 }
    return user
  }

  const session = await getSession()
  if (!session) return { error: 'Unauthorized — log in first', status: 401 }
  return { id: session.id, username: session.username }
}

export async function POST(req: NextRequest) {
  const target = await resolveTargetUserId(req)
  if ('error' in target) return NextResponse.json({ error: target.error }, { status: target.status })
  const result = await cleanup(target.id)
  return NextResponse.json({ targetUsername: target.username, ...result })
}

export async function GET(req: NextRequest) {
  const target = await resolveTargetUserId(req)
  if ('error' in target) return NextResponse.json({ error: target.error }, { status: target.status })
  const result = await cleanup(target.id)
  // Pretty JSON so the browser tab is readable
  return new NextResponse(JSON.stringify({ targetUsername: target.username, ...result }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
