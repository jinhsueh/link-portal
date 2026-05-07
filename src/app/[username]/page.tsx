import { cache } from 'react'
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
// to single-digit ms. This is a per-route hint for the App Router; the
// homepage / static routes can stay wherever Vercel decides.
export const preferredRegion = 'hnd1'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

// Wrap in React's `cache()` so the same lookup inside one render — page
// component + generateMetadata BOTH call this — dedupes to a single Turso
// round-trip. Without this, the public profile route hit Turso twice per
// request and (because Turso is in ap-northeast-1 while Vercel functions
// default to iad1) added ~1.5s of avoidable latency to every page load.
const getProfile = cache(async (username: string) => {
  return prisma.user.findUnique({
    where: { username },
    include: {
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })
})

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

