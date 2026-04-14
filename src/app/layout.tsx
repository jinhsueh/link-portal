import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { SITE_URL, SITE_NAME, SOCIAL_LINKS, CONTACT_EMAIL } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Link Portal — 免費 Link in Bio 工具｜整合 IG、YouTube、商品連結的創作者頁面',
    template: '%s｜Link Portal',
  },
  description:
    '免費建立你的 Link in Bio 頁面，一個連結整合 Instagram、YouTube、Podcast、數位商品與粉絲名單蒐集。專為中文創作者打造的 Linktree 替代方案。',
  keywords: [
    'link in bio',
    'link in bio 工具',
    '創作者連結頁面',
    'IG 連結整合',
    '社群連結整合',
    'bio 連結',
    '個人品牌',
    '數位商品販售',
    'Linktree 替代',
    '中文 link in bio',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Link Portal — 免費 Link in Bio 工具｜創作者社群連結整合',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立，30 秒上線。',
    url: '/',
    siteName: SITE_NAME,
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Link Portal — 免費 Link in Bio 工具',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立，30 秒上線。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  '@id': `${SITE_URL}/#software`,
                  name: SITE_NAME,
                  applicationCategory: 'WebApplication',
                  applicationSubCategory: 'Link in Bio Tool',
                  operatingSystem: 'Web',
                  description:
                    '免費 Link in Bio 工具，一個連結整合 IG、YouTube、Podcast、數位商品與粉絲名單蒐集。',
                  url: SITE_URL,
                  inLanguage: 'zh-TW',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                  offers: [
                    {
                      '@type': 'Offer',
                      name: 'Free',
                      price: '0',
                      priceCurrency: 'TWD',
                      description: '永久免費基礎方案，1 個頁面、12 個區塊',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Pro',
                      price: '159',
                      priceCurrency: 'TWD',
                      description: 'Pro 方案月繳，10 個頁面、20 區塊、移除浮水印',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Premium',
                      price: '249',
                      priceCurrency: 'TWD',
                      description: 'Premium 方案月繳，無限頁面與區塊、自訂網域',
                    },
                  ],
                  featureList: [
                    '多元區塊類型（連結、橫幅、影片、商品、表單）',
                    '主題自訂與品牌風格設定',
                    '即時數據追蹤與分析',
                    '內建金流串接販售數位商品',
                    'Email 訂閱表單蒐集粉絲名單',
                    '多分頁管理',
                  ],
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'Link Portal 是什麼？',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Link Portal 是一款免費的 Link in Bio 工具，讓創作者用一個連結整合所有社群平台、數位商品販售和粉絲名單蒐集。',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Link Portal 是免費的嗎？',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: '是的，Link Portal 提供永久免費的基礎方案，不需要信用卡即可註冊使用，30 秒內即可建立你的頁面。',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: '可以在 Link Portal 上賣東西嗎？',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: '可以，Link Portal 內建金流串接，你可以直接在頁面上販售課程、電子書、設計模板等數位商品。',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Link Portal 和 Linktree 有什麼不同？',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Link Portal 專為中文創作者打造，除了連結整合外還支援數位商品販售、粉絲名單蒐集、多分頁管理等進階功能，基礎方案永久免費。',
                      },
                    },
                  ],
                },
                {
                  '@type': 'Organization',
                  '@id': `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: SITE_URL,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/icon.png`,
                  },
                  description:
                    '專為中文創作者打造的 Link in Bio 工具，整合社群連結、數位商品販售與名單蒐集。',
                  sameAs: SOCIAL_LINKS,
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: CONTACT_EMAIL,
                    availableLanguage: ['zh-Hant', 'en'],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: SITE_NAME,
                  inLanguage: 'zh-TW',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
