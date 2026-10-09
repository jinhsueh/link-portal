import type { Metadata } from 'next'
import { OG_IMAGE } from '@/lib/site'
import { Landing } from '@/components/landing/Landing'
import { th } from '@/components/landing/copy/th'

// Thai landing page metadata — overrides root layout's English defaults so
// that /th unfurls correctly on Telegram / X / FB with Thai title +
// description. Matches the en page's structure (alternates.languages emits
// hreflang tags so Google recognises the four locale variants as alternates
// rather than duplicate content).
export const metadata: Metadata = {
  title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
  description:
    'ลิงก์เดียวรวมโซเชียล สินค้า และ email list สร้างหน้าครีเอเตอร์ใน 30 วินาที ฟรี ไม่ต้องใช้บัตรเครดิต ทางเลือกของ OpenLink และ Linktree สำหรับครีเอเตอร์ที่อยากทำเงิน',
  keywords: [
    'link in bio',
    'linktree alternative',
    'ลิงก์ในไบโอ',
    'หน้าครีเอเตอร์',
    'bio link',
    'ขายสินค้าดิจิทัล',
    'เก็บอีเมล',
    'creator economy',
  ],
  alternates: {
    canonical: '/th',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
    description:
      'ลิงก์เดียวรวมโซเชียล สินค้า และ email list สร้างใน 30 วินาที ฟรี ไม่ต้องใช้บัตรเครดิต',
    url: '/th',
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    images: [OG_IMAGE],
    card: 'summary_large_image',
    title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
    description:
      'ลิงก์เดียวรวมโซเชียล สินค้า และ email list ฟรี ไม่ต้องใช้บัตรเครดิต',
  },
}

// Layout + design live in the shared <Landing>; this locale only supplies copy.
export default function LandingPageTh() {
  return <Landing c={th} />
}
