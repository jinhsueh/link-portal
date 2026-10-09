import type { Metadata } from 'next'
import { OG_IMAGE } from '@/lib/site'
import { Landing } from '@/components/landing/Landing'
import { zhTW } from '@/components/landing/copy/zh-TW'

export const metadata: Metadata = {
  title: 'Beam — 免費 Link in Bio 工具｜創作者社群連結整合',
  description: '一個連結整合所有社群、商品、名單蒐集。免費建立,30 秒上線。',
  alternates: {
    canonical: '/zh-TW',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Beam — 免費 Link in Bio 工具｜創作者社群連結整合',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立,30 秒上線。',
    url: '/zh-TW',
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    images: [OG_IMAGE],
    card: 'summary_large_image',
    title: 'Beam — 免費 Link in Bio 工具',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立,30 秒上線。',
  },
}

// Layout + design live in the shared <Landing>; this locale only supplies copy.
export default function LandingPageZhTW() {
  return <Landing c={zhTW} />
}
