import type { Metadata } from 'next'
import { OG_IMAGE } from '@/lib/site'
import { Landing } from '@/components/landing/Landing'
import { ja } from '@/components/landing/copy/ja'

export const metadata: Metadata = {
  title: 'Beam — クリエイターのための無料 link-in-bio',
  description:
    'フォロワーで稼ぎたいクリエイターのための link-in-bio。商品販売・ブランド案件・自分のメールリストを 1 つのリンクに。30秒で完成、クレジットカード不要。',
  keywords: [
    'link in bio',
    'リンクインバイオ',
    'linktree 代替',
    'クリエイター リンク',
    'プロフィール リンク',
  ],
  alternates: {
    canonical: '/ja',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Beam — クリエイターのための無料 link-in-bio',
    description: '1つのリンクで全SNS・商品・メールリストを集約。30秒で完成、クレカ不要。',
    url: '/ja',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    images: [OG_IMAGE],
    card: 'summary_large_image',
    title: 'Beam — クリエイターのための無料 link-in-bio',
    description: '1つのリンクで全SNS・商品・メールリストを集約。30秒で完成、クレカ不要。',
  },
}

// Layout + design live in the shared <Landing>; this locale only supplies copy.
export default function LandingPageJa() {
  return <Landing c={ja} />
}
