import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlockData } from '@/types'
import { PasswordGate } from '@/components/ui/PasswordGate'
import { getEffectivePlan } from '@/lib/plan'
import { ProfileView } from '@/components/profile/ProfileView'

// Co-locate this serverless function with the Turso DB (ap-northeast-1).
// Without this, Vercel default-runs in iad1 (Virginia), and every Prisma
// query crosses the Pacific — adds ~150-200ms × N round-trips per request.
// hnd1 (Tokyo) sits in the same AWS region as Turso, cutting query latency
// to single-digit ms. Note: Vercel Hobby ignores this (pins to iad1); the
// data-cache below is what actually buys us speed regardless of plan.
export const preferredRegion = 'hnd1'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

// `searchParams` access opts the route into fully-dynamic rendering, so a
// page-level `revalidate = N` would be ignored. We cache the DATA fetch
// instead via unstable_cache — the page still re-renders on every request,
// but the slow cross-Pacific Turso roundtrip is skipped for 30 seconds.
//
// Cache invalidation: profile-write handlers (e.g. /api/me PATCH, blocks
// CRUD) can call `revalidateTag('profile')` to flush this cache instantly
// when a creator saves changes. In the worst case the cache simply expires
// after 30s on its own.
const getProfileCached = unstable_cache(
  async (username: string) => {
    return prisma.user.findUnique({
      where: { username },
      include: {
        pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
        socialLinks: { orderBy: { order: 'asc' } },
      },
    })
  },
  ['profile-by-username'],
  { revalidate: 30, tags: ['profile'] },
)

// Outer React.cache() dedupes within ONE render so the page component + its
// generateMetadata sibling share a single call to the data-cached fetcher.
const getProfile = cache(async (username: string) => getProfileCached(username))

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { page: pageSlug } = await searchParams
  const user = await getProfile(username)
  if (!user) notFound()

  const now = new Date()
  const pages = user.pages.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    isDefault: p.isDefault,
    order: p.order,
    blocks: p.blocks
      .filter(b => {
        if (b.scheduleStart && new Date(b.scheduleStart) > now) return false
        if (b.scheduleEnd && new Date(b.scheduleEnd) < now) return false
        return true
      })
      .map<BlockData>(b => ({
        id: b.id,
        type: b.type as BlockData['type'],
        title: b.title,
        content: JSON.parse(b.content),
        order: b.order,
        active: b.active,
        clicks: b.clicks,
        views: b.views,
        pinned: b.pinned,
      })),
  }))

  const activePage =
    user.pages.find(p => p.slug === pageSlug) ??
    user.pages.find(p => p.isDefault) ??
    user.pages[0]
  if (!activePage) notFound()
  const hasPassword = !!activePage.password
  const showWatermark = getEffectivePlan(user) === 'free'

  const pageContent = (
    <ProfileView
      username={username}
      name={user.name}
      bio={user.bio}
      avatarUrl={user.avatarUrl}
      bannerUrl={user.bannerUrl}
      theme={user.theme}
      pages={pages}
      socialLinks={user.socialLinks}
      activePageSlug={pageSlug}
      showWatermark={showWatermark}
    />
  )

  if (hasPassword) {
    return (
      <PasswordGate username={username} pageId={activePage.id}>
        {pageContent}
      </PasswordGate>
    )
  }

  return pageContent
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const user = await getProfile(username)
  if (!user) return {}
  const title = `${user.name ?? username} | Beam`
  const description = user.bio ?? `Check out ${username}'s links`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

