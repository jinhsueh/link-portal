import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'

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
  title: 'Link Portal — 免費 Link in Bio 工具｜整合 IG、YouTube、商品連結的創作者頁面',
  description: '免費建立你的 Link in Bio 頁面，一個連結整合 Instagram、YouTube、Podcast、數位商品與粉絲名單蒐集。10,000+ 創作者都在用的社群連結整合工具。',
  keywords: ['link in bio', 'link in bio 工具', '創作者連結頁面', 'IG 連結整合', '社群連結整合', 'bio 連結', '個人品牌', '數位商品販售'],
  alternates: {
    canonical: 'https://link-portal-eight.vercel.app',
  },
  openGraph: {
    title: 'Link Portal — 免費 Link in Bio 工具｜創作者社群連結整合',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立，30 秒上線。',
    url: 'https://link-portal-eight.vercel.app',
    siteName: 'Link Portal',
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
                  name: 'Link Portal',
                  applicationCategory: 'WebApplication',
                  operatingSystem: 'Web',
                  description: '免費 Link in Bio 工具，一個連結整合 IG、YouTube、Podcast、數位商品與粉絲名單蒐集。',
                  url: 'https://link-portal-eight.vercel.app',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'TWD',
                    description: '永久免費基礎方案',
                  },
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
                  name: 'Link Portal',
                  url: 'https://link-portal-eight.vercel.app',
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
