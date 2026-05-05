import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlockData } from '@/types'
import { PasswordGate } from '@/components/ui/PasswordGate'
import { getEffectivePlan } from '@/lib/plan'
import { ProfileView } from '@/components/profile/ProfileView'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

async function getProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })
}

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
    theme: p.theme,
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

