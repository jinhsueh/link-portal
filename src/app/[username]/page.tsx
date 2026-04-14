import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { AnimatedBlock } from '@/components/blocks/AnimatedBlock'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { PageTracker } from '@/components/tracking/PageTracker'
import { parseTheme, themeToCSS } from '@/lib/theme'
import { ShareBar } from '@/components/sharing/ShareBar'
import { BlockData } from '@/types'
import { Link2 } from 'lucide-react'
import Link from 'next/link'
import { PasswordGate } from '@/components/ui/PasswordGate'
import { getEffectivePlan } from '@/lib/plan'

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

  const now = new Date()
  const blocks: BlockData[] = activePage.blocks
    .filter(b => {
      // Filter out scheduled blocks outside their window
      if (b.scheduleStart && new Date(b.scheduleStart) > now) return false
      if (b.scheduleEnd && new Date(b.scheduleEnd) < now) return false
      return true
    })
    .map(b => ({
      id: b.id, type: b.type as BlockData['type'],
      title: b.title, content: JSON.parse(b.content),
      order: b.order, active: b.active, clicks: b.clicks, views: b.views,
    }))

  const theme = parseTheme(activePage.theme)
  const themeCSS = themeToCSS(theme)
  const isDark = isColorDark(theme.bgColor)
  const bg = theme.bgType === 'gradient' && theme.bgGradient ? theme.bgGradient : theme.bgColor
  const hasPassword = !!activePage.password

  // Subtle gradient halo behind avatar — derived from theme primary color
  const haloGradient = `radial-gradient(circle at center, ${theme.primaryColor}33 0%, ${theme.primaryColor}00 70%)`

  const pageContent = (
    <div className="min-h-screen" style={{ ...themeCSS, background: bg, fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 64px' }}>

        {/* Profile header */}
        <div className="text-center mb-7">
          {/* Avatar with gradient halo */}
          <div className="relative mx-auto mb-5" style={{ width: 112, height: 112 }}>
            <div aria-hidden className="absolute inset-0 rounded-full"
              style={{ background: haloGradient, transform: 'scale(1.6)', filter: 'blur(8px)', pointerEvents: 'none' }} />
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name ?? username}
                className="relative w-full h-full rounded-full object-cover"
                style={{
                  border: '4px solid white',
                  boxShadow: `0 8px 28px ${theme.primaryColor}40, 0 2px 8px rgba(0,0,0,0.08)`,
                }} />
            ) : (
              <div className="relative w-full h-full rounded-full flex items-center justify-center font-bold"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
                  color: 'white',
                  fontSize: 40,
                  border: '4px solid white',
                  boxShadow: `0 8px 28px ${theme.primaryColor}40, 0 2px 8px rgba(0,0,0,0.08)`,
                  fontFamily: 'var(--font-display)',
                }}>
                {(user.name ?? username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="font-bold" style={{ fontSize: 22, color: isDark ? '#fff' : 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>{user.name ?? username}</h1>
          {user.bio && (
            <p className="mt-2.5 text-sm mx-auto"
              style={{ color: isDark ? 'rgba(255,255,255,0.78)' : 'var(--color-text-secondary)', lineHeight: 1.65, maxWidth: 320 }}>
              {user.bio}
            </p>
          )}
        </div>

        {/* Social icons */}
        {user.socialLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2.5 mb-7">
            {user.socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} />)}
          </div>
        )}

        {/* Page tabs */}
        {user.pages.length > 1 && (
          <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-1 -mx-2 px-2">
            {user.pages.map(p => {
              const active = p.id === activePage.id
              return (
                <a key={p.id} href={`/${username}?page=${p.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: active ? theme.primaryColor : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)'),
                    color: active ? 'white' : (isDark ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)'),
                    border: active ? `1px solid ${theme.primaryColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)'}`,
                    boxShadow: active ? `0 4px 12px ${theme.primaryColor}40` : '0 1px 3px rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    textDecoration: 'none',
                  }}>
                  {p.name}
                </a>
              )
            })}
          </div>
        )}

        {/* Share tools */}
        <div className="mb-7">
          <ShareBar url={`https://link-portal.vercel.app/${username}`} title={`${user.name ?? username} | Link Portal`} />
        </div>

        {/* View tracking */}
        <PageTracker pageId={activePage.id} />

        {/* Blocks */}
        <div className="flex flex-col gap-3">
          {blocks.map((block, i) => (
            <AnimatedBlock key={block.id} index={i}>
              <BlockRenderer block={block} pageId={activePage.id} btnStyle={theme.buttonStyle} />
            </AnimatedBlock>
          ))}
        </div>

        {/* Watermark — hidden for Pro and Premium users */}
        {getEffectivePlan(user) === 'free' && (
          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs"
              style={{
                color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--color-text-muted)',
                textDecoration: 'none',
              }}>
              <Link2 size={12} />
              Link Portal
            </Link>
          </div>
        )}
      </div>
    </div>
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
  const title = `${user.name ?? username} | Link Portal`
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

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return false
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
