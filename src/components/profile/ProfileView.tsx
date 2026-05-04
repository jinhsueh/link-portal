import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { AnimatedBlock } from '@/components/blocks/AnimatedBlock'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { PageTracker } from '@/components/tracking/PageTracker'
import { ShareBar } from '@/components/sharing/ShareBar'
import { parseTheme, themeToCSS } from '@/lib/theme'
import { BlockData } from '@/types'
import { Link2 } from 'lucide-react'
import Link from 'next/link'

export interface ProfileViewProps {
  username: string
  name?: string | null
  bio?: string | null
  avatarUrl?: string | null
  bannerUrl?: string | null
  pages: Array<{
    id: string
    name: string
    slug: string
    isDefault: boolean
    order: number
    theme: string | null
    blocks: BlockData[]
  }>
  socialLinks: Array<{ id: string; platform: string; url: string; iconUrl?: string | null; label?: string | null }>
  activePageSlug?: string
  showWatermark?: boolean
  // If true, ShareBar uses the live origin URL; if false, points to the canonical demo path.
  isDemo?: boolean
}

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return false
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

export function ProfileView({
  username,
  name,
  bio,
  avatarUrl,
  bannerUrl,
  pages,
  socialLinks,
  activePageSlug,
  showWatermark = true,
  isDemo = false,
}: ProfileViewProps) {
  const activePage =
    pages.find(p => p.slug === activePageSlug) ??
    pages.find(p => p.isDefault) ??
    pages[0]
  if (!activePage) return null

  const blocks = activePage.blocks
  const theme = parseTheme(activePage.theme)
  const themeCSS = themeToCSS(theme)
  const isDark = isColorDark(theme.bgColor)
  const bg = theme.bgType === 'gradient' && theme.bgGradient ? theme.bgGradient : theme.bgColor
  const haloGradient = `radial-gradient(circle at center, ${theme.primaryColor}33 0%, ${theme.primaryColor}00 70%)`
  const displayName = name ?? username
  const shareUrl = isDemo ? `https://link-portal.vercel.app/demo` : `https://link-portal.vercel.app/${username}`

  return (
    <div className="min-h-screen" style={{ ...themeCSS, background: bg, fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      {/* Banner — full-width hero above the avatar. Avatar overlaps the bottom
          edge by half its height, mirroring the Portaly "橫幅看板" layout. The
          bottom 30% fades into the page background so the avatar overlap reads
          as a soft transition rather than a hard image cut. */}
      {bannerUrl && (
        <div style={{ width: '100%', maxHeight: 220, overflow: 'hidden', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt={`${displayName} banner`}
            style={{ width: '100%', height: 'auto', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
          <div aria-hidden style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '40%',
            background: `linear-gradient(to bottom, transparent 0%, ${bg} 100%)`,
            pointerEvents: 'none',
          }} />
        </div>
      )}
      <div className="profile-frame" style={{
        // Wider on desktop (>=640px) so the public page doesn't look like a phone
        // mockup pinned to the centre of a huge screen. Mobile keeps 480 max.
        maxWidth: 560,
        margin: '0 auto',
        // When a banner is present, pull the avatar up so it overlaps the banner edge.
        padding: bannerUrl ? '0 20px 64px' : '40px 20px 64px',
        marginTop: bannerUrl ? -56 : 0,
        position: 'relative',
        // 底版 — wrap profile content in a soft white card so the page bg frames it.
        // Only kicks in when theme.bgPanel is enabled; otherwise content sits flat
        // on the page background (current default).
        ...(theme.bgPanel ? {
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 12px 40px rgba(80,144,255,0.10)',
          padding: bannerUrl ? '70px 24px 48px' : '40px 24px 48px',
          marginTop: bannerUrl ? -28 : 24,
          marginBottom: 24,
        } : {}),
      }}>

        {/* Profile header */}
        <div className="text-center mb-7">
          <div className="relative mx-auto mb-5" style={{ width: 112, height: 112 }}>
            <div aria-hidden className="absolute inset-0 rounded-full"
              style={{ background: haloGradient, transform: 'scale(1.6)', filter: 'blur(8px)', pointerEvents: 'none' }} />
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName}
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
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="font-bold" style={{ fontSize: 22, color: isDark ? '#fff' : 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>{displayName}</h1>
          {bio && (
            <p className="mt-2.5 text-sm mx-auto"
              style={{
                color: isDark ? 'rgba(255,255,255,0.78)' : 'var(--color-text-secondary)',
                lineHeight: 1.65,
                maxWidth: 320,
                whiteSpace: 'pre-line', // honor newlines from textarea so bios can be multi-paragraph
              }}>
              {bio}
            </p>
          )}
        </div>

        {/* Social icons */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2.5 mb-7">
            {socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} iconUrl={l.iconUrl} label={l.label} />)}
          </div>
        )}

        {/* Page tabs */}
        {pages.length > 1 && (
          <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-1 -mx-2 px-2">
            {pages.map(p => {
              const active = p.id === activePage.id
              const tabHref = isDemo ? `/demo?page=${p.slug}` : `/${username}?page=${p.slug}`
              return (
                <a key={p.id} href={tabHref}
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
          <ShareBar url={shareUrl} title={`${displayName} | Beam`} />
        </div>

        {/* View tracking — only on real profiles */}
        {!isDemo && <PageTracker pageId={activePage.id} />}

        {/* Blocks */}
        <div className="flex flex-col gap-3">
          {blocks.map((block, i) => (
            <AnimatedBlock key={block.id} index={i}>
              <BlockRenderer block={block} pageId={activePage.id} btnStyle={theme.buttonStyle} />
            </AnimatedBlock>
          ))}
        </div>

        {/* Watermark */}
        {showWatermark && (
          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs"
              style={{
                color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--color-text-muted)',
                textDecoration: 'none',
              }}>
              <Link2 size={12} />
              Beam
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
