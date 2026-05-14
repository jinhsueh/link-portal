import type { Metadata } from 'next'
import { getDictionary } from '@/lib/i18n'
import { LandingSimple } from '@/components/i18n/LandingSimple'

export const metadata: Metadata = {
  title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
  description:
    'ลิงก์เดียวรวมทุกโซเชียล สินค้า และ email list สร้างหน้าครีเอเตอร์ใน 30 วินาที ฟรี ไม่ต้องใช้บัตรเครดิต Linktree alternative ที่เน้นดีไซน์',
  keywords: [
    'link in bio',
    'linktree alternative',
    'ลิงก์ในไบโอ',
    'หน้าครีเอเตอร์',
    'bio link',
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
    title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
    description: 'ลิงก์เดียวรวมทุกโซเชียล สินค้า และ email list สร้างใน 30 วินาที ฟรี',
    url: '/th',
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
    description: 'ลิงก์เดียวรวมทุกโซเชียล สินค้า และ email list สร้างใน 30 วินาที ฟรี',
  },
}

export default async function ThaiLanding() {
  const dict = await getDictionary('th')
  return <LandingSimple dict={dict} locale="th" />
}
