import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { BlockData } from '@/types'

interface Props {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string }>
}

async function getProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      pages: {
        orderBy: { order: 'asc' },
        include: {
          blocks: { orderBy: { order: 'asc' } },
        },
      },
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })
  return user
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params
  const { page: pageSlug } = await searchParams

  const user = await getProfile(username)
  if (!user) notFound()

  const activePage =
    user.pages.find(p => p.slug === pageSlug) ??
    user.pages.find(p => p.isDefault) ??
    user.pages[0]

  if (!activePage) notFound()

  const blocks: BlockData[] = activePage.blocks.map(b => ({
    id: b.id,
    type: b.type as BlockData['type'],
    title: b.title,
    content: JSON.parse(b.content),
    order: b.order,
    active: b.active,
    clicks: b.clicks,
    views: b.views,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-[480px] mx-auto px-4 py-10">

        {/* Avatar & Profile */}
        <div className="flex flex-col items-center text-center mb-8">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name ?? username}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-violet-200 flex items-center justify-center text-3xl font-bold text-violet-700 border-4 border-white shadow-md mb-4">
              {(user.name ?? username).charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">{user.name ?? username}</h1>
          {user.bio && <p className="mt-2 text-sm text-gray-500 max-w-xs">{user.bio}</p>}
        </div>

        {/* Social Links */}
        {user.socialLinks.length > 0 && (
          <div className="flex justify-center gap-3 mb-8">
            {user.socialLinks.map(link => (
              <SocialIcon key={link.id} platform={link.platform} url={link.url} />
            ))}
          </div>
        )}

        {/* Page Tabs */}
        {user.pages.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {user.pages.map(p => (
              <a
                key={p.id}
                href={`/${username}?page=${p.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  p.id === activePage.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.name}
              </a>
            ))}
          </div>
        )}

        {/* Blocks */}
        <div className="flex flex-col gap-3">
          {blocks.map(block => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>

        {/* Footer watermark */}
        <div className="mt-12 text-center">
          <a href="/" className="text-xs text-gray-400 hover:text-violet-500 transition-colors">
            built with Link Portal
          </a>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const user = await getProfile(username)
  if (!user) return {}
  return {
    title: `${user.name ?? username} | Link Portal`,
    description: user.bio ?? `${username}'s link page`,
  }
}
