import type { Metadata } from 'next'
import { OG_IMAGE } from '@/lib/site'
import { Landing } from '@/components/landing/Landing'
import { en } from '@/components/landing/copy/en'

// Override the Chinese metadata inherited from the root layout. Without
// this, sharing /en on Telegram / X / FB unfurls with the Chinese title
// and description (`Beam — 免費 Link in Bio 工具…`), confusing English
// audiences. Only locale-aware fields are overridden — metadataBase /
// robots / manifest / formatDetection still inherit from the root.
//
// alternates.languages emits hreflang tags so Google recognises the two
// language versions of the marketing page as alternates rather than
// duplicate content.
export const metadata: Metadata = {
  title: 'Beam — Free link-in-bio for creators',
  description:
    'The link-in-bio for creators and KOLs who want to earn from their following — sell your own products, pitch brands with real numbers, and own your email list. Free, no credit card.',
  keywords: [
    'link in bio',
    'linktree alternative',
    'creator link page',
    'bio link tool',
    'social media link page',
    'sell digital products',
    'email capture',
    'creator economy',
  ],
  alternates: {
    canonical: '/en',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Beam — Free link-in-bio for creators',
    description:
      'The link-in-bio for creators who want to earn from their following. Sell products, land brand deals, own your list — free.',
    url: '/en',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    images: [OG_IMAGE],
    card: 'summary_large_image',
    title: 'Beam — Free link-in-bio for creators',
    description:
      'The link-in-bio for creators who want to earn from their following. Free, no credit card.',
  },
}

// Layout + design live in the shared <Landing>; this locale only supplies copy.
export default function LandingPageEn() {
  return <Landing c={en} />
}
