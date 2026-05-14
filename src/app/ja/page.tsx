import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n'
import { LandingSimple } from '@/components/i18n/LandingSimple'

export const metadata: Metadata = {
  title: 'Beam — クリエイターのための無料 link-in-bio',
  description:
    '1つのリンクでInstagram、YouTube、ポッドキャスト、デジタル商品、メールリストを集約。30秒で完成、クレジットカード不要。Linktreeに代わるデザイン重視のクリエイター向けツール。',
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
    title: 'Beam — クリエイターのための無料 link-in-bio',
    description: '1つのリンクで全SNS・商品・メールリストを集約。30秒で完成、クレカ不要。',
    url: '/ja',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beam — クリエイターのための無料 link-in-bio',
    description: '1つのリンクで全SNS・商品・メールリストを集約。30秒で完成、クレカ不要。',
  },
}

export default async function JapaneseLanding() {
  const dict = await getDictionary('ja')
  return <LandingSimple dict={dict} locale="ja" />
}
