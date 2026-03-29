import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { BlockData } from '@/types'
import { Link2 } from 'lucide-react'

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

  const activePage =
    user.pages.find(p => p.slug === pageSlug) ??
    user.pages.find(p => p.isDefault) ??
    user.pages[0]
  if (!activePage) notFound()

  const blocks: BlockData[] = activePage.blocks.map(b => ({
    id: b.id, type: b.type as BlockData['type'],
    title: b.title, content: JSON.parse(b.content),
    order: b.order, active: b.active, clicks: b.clicks, views: b.views,
  }))

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 16px 64px' }}>

        {/* Profile header */}
        <div className="text-center mb-8">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name ?? username}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              style={{ border: '4px solid white', boxShadow: 'var(--shadow-md)' }} />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4"
              style={{ background: 'var(--gradient-blue)', color: 'white', border: '4px solid white', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-display)' }}>
              {(user.name ?? username).charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>{user.name ?? username}</h1>
          {user.bio && <p className="mt-2 text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{user.bio}</p>}
        </div>

        {/* Social icons */}
        {user.socialLinks.length > 0 && (
          <div className="flex justify-center gap-3 mb-8">
            {user.socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} />)}
          </div>
        )}

        {/* Page tabs */}
        {user.pages.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {user.pages.map(p => (
              <a key={p.id} href={`/${username}?page=${p.slug}`}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
                style={{
                  background: p.id === activePage.id ? 'var(--color-primary)' : 'white',
                  color: p.id === activePage.id ? 'white' : 'var(--color-text-secondary)',
                  border: `1px solid ${p.id === activePage.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  textDecoration: 'none',
                }}>
                {p.name}
              </a>
            ))}
          </div>
        )}

        {/* Blocks */}
        <div className="flex flex-col gap-3">
          {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
        </div>

        {/* Watermark */}
        <div className="mt-12 text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            <Link2 size={12} />
            Link Portal
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
