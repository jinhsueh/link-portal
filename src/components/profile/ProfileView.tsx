'use client'

import { useEffect, useState } from 'react'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { AnimatedBlock } from '@/components/blocks/AnimatedBlock'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { PageTracker } from '@/components/tracking/PageTracker'
import { ShareBar } from '@/components/sharing/ShareBar'
import { VisitorShareButton } from '@/components/profile/VisitorShareButton'
import { parseTheme, themeToCSS, RICH_BLOCK_TYPES, computeBgPanelStyle } from '@/lib/theme'
import { BlockData } from '@/types'
import { Link2 } from 'lucide-react'
import Link from 'next/link'

export interface ProfileViewProps {
  username: string
  name?: string | null
  bio?: string | null
  avatarUrl?: string | null
  bannerUrl?: string | null
  /**
   * Account-level theme (JSON string). Single visual identity across all pages —
   * switching tabs only changes blocks, never visual style.
   */
  theme?: string | null
  pages: Array<{
    id: string
    name: string
    slug: string
    isDefault: boolean
    order: number
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
  theme: userTheme,
  pages,
  socialLinks,
  activePageSlug,
  showWatermark = true,
  isDemo = false,
}: ProfileViewProps) {
  // Initial active slug: prop takes priority, then default flag, then first.
  const initialSlug = activePageSlug
    ?? pages.find(p => p.isDefault)?.slug
    ?? pages[0]?.slug
  // Local state so tab clicks switch INSTANTLY without a full-page nav.
  // Customer feedback: 主頁 ↔ 產品介紹 換頁要等整頁重 load,體驗很卡。
  const [activeSlug, setActiveSlug] = useState(initialSlug)

  // Keep state in sync if the slug prop changes (e.g. browser back/forward
  // or someone shares a URL that routes to a different tab).
  useEffect(() => {
    if (activePageSlug !== undefined) setActiveSlug(activePageSlug)
  }, [activePageSlug])

  const activePage =
    pages.find(p => p.slug === activeSlug) ??
    pages.find(p => p.isDefault) ??
    pages[0]
  if (!activePage) return null

  // Pinned blocks float to the top (above-the-fold spotlight) regardless of
  // their drag-sorted order. Within pinned/non-pinned groups, original order
  // is preserved.
  const blocks = [...activePage.blocks].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
    return 0
  })
  // Theme is account-level — single source of truth on User.
  const theme = parseTheme(userTheme)
  const themeCSS = themeToCSS(theme)
  const isDark = isColorDark(theme.bgColor)
  const bg = theme.bgType === 'gradient' && theme.bgGradient ? theme.bgGradient : theme.bgColor
  const haloGradient = `radial-gradient(circle at center, ${theme.primaryColor}33 0%, ${theme.primaryColor}00 70%)`
  const displayName = name ?? username
  const shareUrl = isDemo ? `https://link-portal.vercel.app/demo` : `https://link-portal.vercel.app/${username}`

  // ── Layout preset → Tailwind classes ──
  // Two axes: container width (narrow vs wide) and block grid (1-col vs 2-col).
  // Each preset is just a class string we apply at the right spot.
  const layout = theme.layout ?? 'stacked'
  const isWide = layout === 'fullwidth' || layout === 'cards'
  const isGrid = layout === 'horizontal' || layout === 'cards'

  // Outer frame width on lg+. Mobile is always max-w-[560px] so phones never
  // care about layout choice.
  const frameMaxWidthClass = isWide ? 'lg:max-w-7xl' : 'lg:max-w-5xl'

  // Blocks container — single column or 2-col grid. Rich blocks (videos,
  // banners, calendars…) span both columns even in grid mode (see
  // RICH_BLOCK_TYPES) so they don't shrink past usability.
  const blocksContainerClass = isGrid
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
    : 'flex flex-col gap-3'

  // ── HERO-BANNER layout (Portaly-style) ──
  // Full-bleed banner across the entire viewport, avatar overlapping the
  // banner's bottom-left, name + socials in a horizontal row to the right.
  // Below: wide bio + 2-col blocks grid. Mobile collapses everything to
  // a centred single-column stack so it stays scannable on phones.
  if (layout === 'hero-banner') {
    return (
      <div className="min-h-screen" style={{ ...themeCSS, background: bg, fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
        {/* Hero banner — full viewport width (no max-w cap). Falls back to
            a brand-tinted gradient panel when no banner image is set, so
            the layout still reads as "hero-led" without an upload. */}
        <div style={{
          width: '100%',
          aspectRatio: '21 / 9',
          maxHeight: 440,
          minHeight: 220,
          overflow: 'hidden',
          position: 'relative',
          background: bannerUrl
            ? undefined
            : `linear-gradient(135deg, ${theme.primaryColor}30 0%, ${theme.primaryColor}10 50%, ${bg} 100%)`,
        }}>
          {bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt={`${displayName} banner`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          )}
        </div>

        {/* Content area — wider than narrow layouts to match hero scale */}
        <div className="mx-auto px-4 lg:px-6" style={{ maxWidth: 1080 }}>

          {/* Profile header row: avatar overlaps banner; name + social to right */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-5 lg:gap-7"
            style={{ marginTop: -64 }}>
            {/* Avatar — large (140px) so it reads strong against the banner */}
            <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                  style={{
                    border: '5px solid white',
                    boxShadow: `0 12px 36px ${theme.primaryColor}50, 0 4px 12px rgba(0,0,0,0.10)`,
                  }} />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}cc)`,
                    color: 'white',
                    fontSize: 52,
                    border: '5px solid white',
                    boxShadow: `0 12px 36px ${theme.primaryColor}50, 0 4px 12px rgba(0,0,0,0.10)`,
                    fontFamily: 'var(--font-display)',
                  }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + socials, horizontally aligned next to avatar on desktop */}
            <div className="flex-1 min-w-0 text-center lg:text-left lg:pb-2">
              <h1 className="font-bold" style={{
                fontSize: 30,
                color: isDark ? '#fff' : 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}>
                {displayName}
              </h1>
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
                  {socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} iconUrl={l.iconUrl} label={l.label} />)}
                </div>
              )}
            </div>

            {/* Share controls — hidden on mobile (we render below); on desktop
                sits at the right edge of the header row, top-aligned with the
                avatar, mirroring Portaly's [share][qr][收藏] strip. */}
            <div className="hidden lg:block lg:pb-2 lg:ml-auto">
              <ShareBar url={shareUrl} title={`${displayName} | Beam`} />
            </div>
          </div>

          {/* Bio — wide, single paragraph below the header row */}
          {bio && (
            <p className="mt-6 text-center lg:text-left text-sm" style={{
              color: isDark ? 'rgba(255,255,255,0.78)' : 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: 720,
              whiteSpace: 'pre-line',
              margin: '24px auto 0',
            }}>
              {bio}
            </p>
          )}

          {/* Mobile share — desktop has it inline above */}
          <div className="mt-6 lg:hidden">
            <ShareBar url={shareUrl} title={`${displayName} | Beam`} />
          </div>

          {/* Page tabs — same instant-toggle pattern as the other layouts */}
          {pages.length > 1 && (
            <div className="flex justify-center lg:justify-start gap-2 mt-8 overflow-x-auto pb-1 -mx-2 px-2">
              {pages.map(p => {
                const active = p.id === activePage.id
                return (
                  <button key={p.id}
                    onClick={() => {
                      setActiveSlug(p.slug)
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href)
                        if (p.isDefault) url.searchParams.delete('page')
                        else url.searchParams.set('page', p.slug)
                        window.history.replaceState(null, '', url.toString())
                      }
                    }}
                    className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                    style={{
                      background: active ? theme.primaryColor : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)'),
                      color: active ? 'white' : (isDark ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)'),
                      border: active ? `1px solid ${theme.primaryColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)'}`,
                      boxShadow: active ? `0 4px 12px ${theme.primaryColor}40` : '0 1px 3px rgba(0,0,0,0.04)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      cursor: 'pointer',
                    }}>
                    {p.name}
                  </button>
                )
              })}
            </div>
          )}

          {!isDemo && <PageTracker pageId={activePage.id} />}

          {/* Blocks — 2-col grid on lg with rich blocks spanning full width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-8 pb-16">
            {blocks.map((block, i) => {
              const fullSpan = RICH_BLOCK_TYPES.has(block.type)
              return (
                <AnimatedBlock key={block.id} index={i}
                  animation={theme.entranceAnimation}
                  className={fullSpan ? 'lg:col-span-2' : undefined}>
                  <BlockRenderer block={block} pageId={activePage.id} btnStyle={theme.buttonStyle} />
                </AnimatedBlock>
              )
            })}
          </div>

          {showWatermark && (
            <div className="pb-12 text-center">
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

  return (
    <div className="min-h-screen" style={{ ...themeCSS, background: bg, fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      {/* Banner — full-width hero above the avatar. Avatar overlaps the bottom
          edge by half its height, mirroring the Portaly "橫幅看板" layout. The
          bottom 30% fades into the page background so the avatar overlap reads
          as a soft transition rather than a hard image cut. */}
      {bannerUrl && (
        // Lock the container to the banner's 3:1 aspect at all viewports so
        // mobile and desktop see the SAME cropped image — only the rendered
        // pixel size differs. Customer feedback was that desktop's prior
        // maxHeight: 220 cap chopped off the bottom of wide-screen banners
        // while mobile showed everything, making "upload preview" deceptive.
        // Cap the container width on huge screens (max-w-5xl ≈ 1024px) so a
        // 3:1 banner doesn't dominate 4K monitors at 600+px tall.
        <div className="mx-auto" style={{ width: '100%', maxWidth: 1024, aspectRatio: '3 / 1', overflow: 'hidden', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bannerUrl} alt={`${displayName} banner`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          <div aria-hidden style={{
            position: 'absolute', left: 0, right: 0, bottom: 0,
            height: '40%',
            background: `linear-gradient(to bottom, transparent 0%, ${bg} 100%)`,
            pointerEvents: 'none',
          }} />
        </div>
      )}
      <div
        className={`profile-frame mx-auto max-w-[560px] ${frameMaxWidthClass} lg:grid lg:grid-cols-[320px_1fr] lg:gap-12 lg:items-start`}
        style={{
          // Mobile / tablet: single-column max 560 (set via max-w-[560px] class).
          // Desktop (lg, ≥1024): 2-column grid — left = profile (sticky), right = blocks.
          // Tailwind's max-w-5xl = 1024px, providing room for the 320 sidebar + blocks.
          // When a banner is present, pull the avatar up so it overlaps the banner edge.
          padding: bannerUrl ? '0 20px 64px' : '40px 20px 64px',
          marginTop: bannerUrl ? -56 : 0,
          position: 'relative',
          // 底版 — D-plan 5-mode design: none / frosted-light / frosted-dark /
          // brand / custom. Visual properties are computed in theme.ts so the
          // ThemeEditor preview matches the public render exactly. Layout
          // properties (radius / padding / margin offsets) stay here because
          // they depend on the banner state.
          ...((typeof theme.bgPanel === 'boolean' ? theme.bgPanel : theme.bgPanel && theme.bgPanel !== 'none')
            ? {
                ...computeBgPanelStyle(theme),
                borderRadius: 24,
                padding: bannerUrl ? '70px 24px 48px' : '40px 24px 48px',
                marginTop: bannerUrl ? -28 : 24,
                marginBottom: 24,
              }
            : {}),
        }}>

        {/* ─── Left column (mobile: top stack / desktop: sticky sidebar) ─── */}
        <aside className="lg:sticky lg:top-8 lg:self-start lg:text-left">
          {/* Profile header */}
          <div className="text-center lg:text-left mb-7">
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
            <p className="mt-2.5 text-sm mx-auto lg:mx-0"
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
          <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 mb-7">
            {socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} iconUrl={l.iconUrl} label={l.label} />)}
          </div>
        )}

        {/* Share tools — on desktop, lives in the sidebar so the share affordance
            stays close to the profile identity. */}
        <div className="mb-7 hidden lg:block">
          <ShareBar url={shareUrl} title={`${displayName} | Beam`} />
        </div>
        </aside>

        {/* ─── Right column (desktop) / continues below profile (mobile) ─── */}
        <main className="lg:min-w-0">

        {/* Page tabs — instant client-side toggle (was <a href> doing a full
            navigation, which made 主頁 ↔ 產品介紹 feel sluggish). The URL is
            still kept in sync via history.replaceState so deep-links + share
            URLs continue to work, but no network round-trip happens. */}
        {pages.length > 1 && (
          <div className="flex justify-center lg:justify-start gap-2 mb-6 overflow-x-auto pb-1 -mx-2 px-2">
            {pages.map(p => {
              const active = p.id === activePage.id
              return (
                <button key={p.id}
                  onClick={() => {
                    setActiveSlug(p.slug)
                    // Mirror the chosen tab into the URL so refresh + share
                    // land on the same view. Default page strips ?page= so
                    // the canonical URL stays clean.
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href)
                      if (p.isDefault) url.searchParams.delete('page')
                      else url.searchParams.set('page', p.slug)
                      window.history.replaceState(null, '', url.toString())
                    }
                  }}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: active ? theme.primaryColor : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)'),
                    color: active ? 'white' : (isDark ? 'rgba(255,255,255,0.85)' : 'var(--color-text-secondary)'),
                    border: active ? `1px solid ${theme.primaryColor}` : `1px solid ${isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)'}`,
                    boxShadow: active ? `0 4px 12px ${theme.primaryColor}40` : '0 1px 3px rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    cursor: 'pointer',
                  }}>
                  {p.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Share tools — mobile only; desktop renders this in the sidebar above. */}
        <div className="mb-7 lg:hidden">
          <ShareBar url={shareUrl} title={`${displayName} | Beam`} />
        </div>

        {/* View tracking — only on real profiles */}
        {!isDemo && <PageTracker pageId={activePage.id} />}

        {/* Blocks — container class depends on layout preset.
            In grid layouts, "rich" block types still span both columns so
            videos/banners/carousels don't get crushed at half-width. */}
        <div className={blocksContainerClass}>
          {blocks.map((block, i) => {
            const fullSpan = isGrid && RICH_BLOCK_TYPES.has(block.type)
            return (
              <AnimatedBlock key={block.id} index={i}
                animation={theme.entranceAnimation}
                className={fullSpan ? 'sm:col-span-2' : undefined}>
                <BlockRenderer block={block} pageId={activePage.id} btnStyle={theme.buttonStyle} />
              </AnimatedBlock>
            )
          })}
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
        </main>
      </div>

      {/* Floating share for visitors — Web Share API on mobile, clipboard on
          desktop. Demo pages don't get it (would just share the demo URL). */}
      {!isDemo && <VisitorShareButton shareUrl={shareUrl} shareTitle={`${displayName} | Beam`} />}
    </div>
  )
}
