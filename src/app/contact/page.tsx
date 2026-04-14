import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: '聯絡我們',
  description: `聯絡 ${SITE_NAME} 團隊。產品問題、合作提案、媒體邀約，歡迎來信 ${CONTACT_EMAIL}。`,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `聯絡 ${SITE_NAME}`,
    description: '產品問題、合作提案、媒體邀約',
    url: '/contact',
    type: 'website',
  },
}

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '聯絡我們', item: `${SITE_URL}/contact` },
  ],
}

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            首頁
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">聯絡我們</span>
        </nav>

        <h1 className="mb-6 text-4xl font-bold tracking-tight">聯絡我們</h1>

        <p className="mb-10 text-lg leading-relaxed text-gray-700">
          有任何問題、合作提案或回饋嗎？我們很樂意聽到你的聲音。
        </p>

        <section className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-xl font-semibold">一般詢問與客戶支援</h2>
          <p className="mb-3 text-gray-700">
            產品使用問題、帳號問題、金流問題、退款申請
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-purple-600 underline hover:text-purple-700"
          >
            {CONTACT_EMAIL}
          </a>
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-xl font-semibold">商務合作與媒體</h2>
          <p className="mb-3 text-gray-700">
            合作提案、創作者計畫、媒體採訪邀約
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-purple-600 underline hover:text-purple-700"
          >
            {CONTACT_EMAIL}
          </a>
        </section>

        <p className="text-sm text-gray-500">
          我們通常會在 1–2 個工作天內回覆所有來信。
        </p>
      </main>
    </>
  )
}
