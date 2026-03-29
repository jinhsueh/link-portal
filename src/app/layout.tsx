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
  title: 'Link Portal — 創作者的個人品牌傳送門',
  description: '一個連結，整合所有社群、商品、粉絲名單。專屬創作者的 Link in Bio 平台。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
