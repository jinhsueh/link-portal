import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getPlanLimits, getEffectivePlan, isBlockTypeAllowed } from '@/lib/plan'
import type { ImportedBlock, ImportedSocialLink } from '@/lib/importers/types'

/**
 * POST /api/import/apply — write a curated import into the DB.
 *
 * Body: {
 *   pageId: string           // target page
 *   name?: string            // optional: update User.name
 *   bio?: string             // optional: update User.bio
 *   avatarUrl?: string       // optional: update User.avatarUrl
 *   blocks: ImportedBlock[]
 *   socialLinks: ImportedSocialLink[]
 * }
 *
 * Behavior:
 * - Respects plan gating: skips disallowed block types; truncates blocks
 *   that would exceed `maxBlocksPerPage`.
 * - Appends blocks after existing ones (does NOT delete existing blocks).
 * - Social links: merges — existing URLs kept; new URLs appended.
 * - Profile fields only updated if the user's current value is empty.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const {
    pageId,
    name,
    bio,
    avatarUrl,
    blocks,
    socialLinks,
  } = body as {
    pageId?: string
    name?: string
    bio?: string
    avatarUrl?: string
    blocks?: ImportedBlock[]
    socialLinks?: ImportedSocialLink[]
  }

  if (!pageId) return NextResponse.json({ error: 'pageId required' }, { status: 400 })
  if (!Array.isArray(blocks)) return NextResponse.json({ error: 'blocks array required' }, { status: 400 })

  const page = await prisma.page.findFirst({ where: { id: pageId, userId: session.id } })
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, bio: true, avatarUrl: true, plan: true, trialEndsAt: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const limits = getPlanLimits(user)
  const plan = getEffectivePlan(user)

  // Filter blocks by plan-allowed types
  const allowedBlocks = blocks.filter(b => isBlockTypeAllowed(plan, b.type))
  const skippedByType = blocks.length - allowedBlocks.length

  // Compute remaining capacity
  const existingCount = await prisma.block.count({ where: { pageId } })
  const capacity = Math.max(0, limits.maxBlocksPerPage - existingCount)
  const toCreate = allowedBlocks.slice(0, capacity)
  const truncated = allowedBlocks.length - toCreate.length

  const lastBlock = await prisma.block.findFirst({
    where: { pageId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const startOrder = (lastBlock?.order ?? -1) + 1

  // Dedupe social links against existing
  const existingLinks = await prisma.socialLink.findMany({
    where: { userId: user.id },
    select: { url: true, order: true },
  })
  const existingUrls = new Set(existingLinks.map(l => l.url))
  const existingSocialMaxOrder = existingLinks.reduce((m, l) => Math.max(m, l.order ?? 0), -1)
  const newSocials = (socialLinks ?? []).filter(s => s.url && !existingUrls.has(s.url))

  // ── Single transaction for the whole write ──
  await prisma.$transaction(async (tx) => {
    // Profile fields (only fill empties)
    const profileUpdate: Record<string, string> = {}
    if (name && !user.name) profileUpdate.name = name
    if (bio && !user.bio) profileUpdate.bio = bio
    if (avatarUrl && !user.avatarUrl) profileUpdate.avatarUrl = avatarUrl
    if (Object.keys(profileUpdate).length > 0) {
      await tx.user.update({ where: { id: user.id }, data: profileUpdate })
    }

    // Blocks
    let i = 0
    for (const b of toCreate) {
      await tx.block.create({
        data: {
          userId: user.id,
          pageId,
          type: b.type,
          title: b.title ?? '',
          content: JSON.stringify(b.content ?? {}),
          order: startOrder + i,
        },
      })
      i++
    }

    // Social links
    let j = 0
    for (const s of newSocials) {
      await tx.socialLink.create({
        data: {
          userId: user.id,
          platform: s.platform || 'custom',
          url: s.url,
          order: existingSocialMaxOrder + 1 + j,
        },
      })
      j++
    }
  })

  return NextResponse.json({
    ok: true,
    blocksCreated: toCreate.length,
    socialsCreated: newSocials.length,
    skippedByType,
    truncated,
    maxBlocksPerPage: limits.maxBlocksPerPage,
  })
}
