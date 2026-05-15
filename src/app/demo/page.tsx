import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { ProfileView, type ProfileViewProps } from '@/components/profile/ProfileView'
import { DictProvider } from '@/components/i18n/DictProvider'
import { BlockData } from '@/types'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

// Static demo profile — does NOT depend on the database.
// Used by the landing page hero iframe and as a permanent showcase URL.
// To preview a real, dynamic profile, log in and visit /<your-username>.
//
// The Mia persona structure (block types, image URLs, click stats) lives here
// in code. Every textual field (title, caption, description, button text) is
// pulled from dict.demo.{main,collab}[i] so the demo reads in the visitor's
// chosen locale.

async function resolveLocale(): Promise<Locale> {
  const c = await cookies()
  const cookieLocale = c.get('lp_locale')?.value
  if (isLocale(cookieLocale)) return cookieLocale
  const h = await headers()
  const acceptLanguage = h.get('accept-language') ?? ''
  if (!acceptLanguage) return DEFAULT_LOCALE
  try {
    const langs = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages()
    const matched = matchLocale(langs, LOCALES as unknown as string[], DEFAULT_LOCALE)
    return isLocale(matched) ? matched : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  return {
    title: dict.demo.metaTitle,
    description: dict.demo.metaDescription,
    robots: { index: false, follow: true },
  }
}

const THEME_JSON = JSON.stringify({
  primaryColor: '#E84393',
  bgType: 'gradient',
  bgColor: '#FFF5F7',
  bgGradient: 'linear-gradient(135deg, #FFF5F7 0%, #FFECD2 50%, #FCB69F 100%)',
  buttonStyle: 'rounded',
  fontStyle: 'modern',
})

/**
 * Block skeletons — everything except the text. The dict provides title +
 * content text fields at hydration time.
 */
type SkeletonBlock = Omit<BlockData, 'title' | 'content'> & {
  /** Static content fields like image URLs, target URLs — merged with dict text */
  content: Record<string, unknown>
}

const mainSkeleton: SkeletonBlock[] = [
  {
    id: 'demo-block-0',
    type: 'heading',
    content: {},
    order: 0,
    active: true,
    clicks: 0,
    views: 0,
  },
  {
    id: 'demo-block-1',
    type: 'link',
    content: { url: 'https://youtube.com/@mia-style' },
    order: 1,
    active: true,
    clicks: 2847,
    views: 8920,
  },
  {
    id: 'demo-block-2',
    type: 'link',
    content: { url: 'https://open.spotify.com' },
    order: 2,
    active: true,
    clicks: 1356,
    views: 4210,
  },
  {
    id: 'demo-block-3',
    type: 'banner',
    content: {
      url: 'https://example.com/spring-lookbook',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',
    },
    order: 3,
    active: true,
    clicks: 1534,
    views: 5890,
  },
  {
    id: 'demo-block-4',
    type: 'product',
    content: {
      price: 299,
      currency: 'NT$',
      checkoutUrl: 'https://example.com/buy/style-ebook',
    },
    order: 4,
    active: true,
    clicks: 876,
    views: 3456,
  },
  {
    id: 'demo-block-5',
    type: 'product',
    content: {
      price: 199,
      currency: 'NT$',
      checkoutUrl: 'https://example.com/buy/presets',
    },
    order: 5,
    active: true,
    clicks: 643,
    views: 2178,
  },
  {
    id: 'demo-block-6',
    type: 'video',
    content: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    order: 6,
    active: true,
    clicks: 1267,
    views: 4890,
  },
  {
    id: 'demo-block-7',
    type: 'link',
    content: { url: 'https://shopee.tw' },
    order: 7,
    active: true,
    clicks: 2145,
    views: 6320,
  },
  {
    id: 'demo-block-8',
    type: 'link',
    content: { url: 'https://xiaohongshu.com' },
    order: 8,
    active: true,
    clicks: 945,
    views: 2920,
  },
  {
    id: 'demo-block-9',
    type: 'email_form',
    content: {},
    order: 9,
    active: true,
    clicks: 0,
    views: 0,
  },
  {
    id: 'demo-block-10',
    type: 'link',
    content: { url: 'https://buymeacoffee.com' },
    order: 10,
    active: true,
    clicks: 312,
    views: 1890,
  },
]

const collabSkeleton: SkeletonBlock[] = [
  {
    id: 'demo-collab-0',
    type: 'heading',
    content: {},
    order: 0,
    active: true,
    clicks: 0,
    views: 0,
  },
  {
    id: 'demo-collab-1',
    type: 'link',
    content: { url: 'https://example.com/media-kit' },
    order: 1,
    active: true,
    clicks: 534,
    views: 1270,
  },
  {
    id: 'demo-collab-2',
    type: 'link',
    content: { url: 'https://example.com/media-kit.pdf' },
    order: 2,
    active: true,
    clicks: 267,
    views: 810,
  },
  {
    id: 'demo-collab-3',
    type: 'link',
    content: { url: 'https://example.com/portfolio' },
    order: 3,
    active: true,
    clicks: 189,
    views: 560,
  },
  {
    id: 'demo-collab-4',
    type: 'link',
    content: { url: 'mailto:mia@example.com' },
    order: 4,
    active: true,
    clicks: 145,
    views: 445,
  },
]

/** Merge a skeleton block with its dict entry — dict provides title + textual content fields. */
function hydrate(
  skeleton: SkeletonBlock,
  localized: { title?: string; content?: Record<string, unknown> } | undefined,
): BlockData {
  return {
    ...skeleton,
    title: localized?.title ?? '',
    content: { ...skeleton.content, ...(localized?.content ?? {}) } as never,
  }
}

interface DemoPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
  const { page: pageSlug } = await searchParams
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  const d = dict.demo

  // Hydrate static skeletons with localized title + content text.
  const mainBlocks = mainSkeleton.map((sk, i) => hydrate(sk, d.main?.[i]))
  const collabBlocks = collabSkeleton.map((sk, i) => hydrate(sk, d.collab?.[i]))

  const profile: ProfileViewProps = {
    username: 'demo',
    name: d.profile.name,
    bio: d.profile.bio,
    avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face',
    theme: THEME_JSON,
    pages: [
      { id: 'demo-page-main',   name: d.pageMain,   slug: 'home',  isDefault: true,  order: 0, blocks: mainBlocks },
      { id: 'demo-page-collab', name: d.pageCollab, slug: 'collab', isDefault: false, order: 1, blocks: collabBlocks },
    ],
    socialLinks: [
      { id: 'demo-s-1', platform: 'instagram', url: 'https://instagram.com/mia.style.tw' },
      { id: 'demo-s-2', platform: 'youtube',   url: 'https://youtube.com/@mia-style' },
      { id: 'demo-s-3', platform: 'tiktok',    url: 'https://tiktok.com/@mia.style' },
      { id: 'demo-s-4', platform: 'threads',   url: 'https://threads.net/@mia.style.tw' },
      { id: 'demo-s-5', platform: 'spotify',   url: 'https://open.spotify.com' },
    ],
    showWatermark: false,
    isDemo: true,
  }

  return (
    <DictProvider value={{ dict, locale }}>
      <ProfileView {...profile} activePageSlug={pageSlug} />
    </DictProvider>
  )
}
