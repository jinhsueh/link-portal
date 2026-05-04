import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: '關於我們',
  description:
    'Beam 是專為中文創作者打造的 Link in Bio 工具。我們相信每位創作者都值得擁有一個能整合社群、販售商品、經營粉絲關係的專屬頁面。',
  alternates: { canonical: '/about' },
  openGraph: {
    title: '關於 Beam',
    description: '專為中文創作者打造的 Link in Bio 工具',
    url: '/about',
    type: 'website',
  },
}

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '關於我們', item: `${SITE_URL}/about` },
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            首頁
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">關於我們</span>
        </nav>

        <h1 className="mb-6 text-4xl font-bold tracking-tight">關於 {SITE_NAME}</h1>

        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          {SITE_NAME} 是一款專為中文創作者打造的 Link in Bio 工具。我們相信每位創作者都值得擁有一個能整合所有社群、販售商品、經營粉絲關係的專屬頁面，而不需要被國外工具的語言、金流與客服問題困擾。
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-semibold">我們的使命</h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          讓中文創作者可以在 30 秒內建立屬於自己的品牌頁面，並且從一開始就具備販售數位商品、蒐集名單、追蹤數據的完整能力——而不需要付費訂閱就能享用核心功能。
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-semibold">為什麼選擇 {SITE_NAME}？</h2>
        <ul className="mb-6 space-y-3 text-gray-700">
          <li>
            <strong>中文原生體驗。</strong>介面、客服、金流、發票全部在地化，不用為了一個 bio 連結頁面跟美國客服用英文吵。
          </li>
          <li>
            <strong>永久免費方案。</strong>核心功能不藏在付費牆後。Free 方案就能建立頁面、加上 12 個區塊、販售數位商品。
          </li>
          <li>
            <strong>內建金流與 Email 名單。</strong>無需整合第三方服務，開箱即用 Stripe 金流與 Email 訂閱表單。
          </li>
          <li>
            <strong>為數據而生。</strong>點擊、曝光、CTR、來源分析內建在每個方案裡，讓你真正了解粉絲行為。
          </li>
        </ul>

        <h2 className="mt-12 mb-4 text-2xl font-semibold">下一步</h2>
        <p className="mb-8 leading-relaxed text-gray-700">
          準備好開始了嗎？
          <Link href="/" className="ml-1 text-purple-600 underline hover:text-purple-700">
            建立你的第一個頁面
          </Link>
          ，或
          <Link
            href="/pricing"
            className="ml-1 text-purple-600 underline hover:text-purple-700"
          >
            比較方案功能
          </Link>
          。
        </p>
      </main>
    </>
  )
}
