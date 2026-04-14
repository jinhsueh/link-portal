import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: '隱私權政策',
  description: `${SITE_NAME} 隱私權政策，說明我們如何蒐集、使用與保護你的個人資料。`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '隱私權政策', item: `${SITE_URL}/privacy` },
  ],
}

export default function PrivacyPage() {
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
          <span className="text-gray-900">隱私權政策</span>
        </nav>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">隱私權政策</h1>
        <p className="mb-10 text-sm text-gray-500">最後更新：2026 年 4 月</p>

        <section className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p>
            {SITE_NAME}（以下簡稱「我們」）尊重並保護所有使用者的個人隱私權。本政策說明我們蒐集哪些資料、如何使用，以及你擁有的權利。
          </p>

          <h2 className="text-2xl font-semibold">1. 我們蒐集的資料</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>帳號資料：</strong>註冊時提供的 Email、使用者名稱、密碼（加密儲存）。
            </li>
            <li>
              <strong>內容資料：</strong>你在 {SITE_NAME} 上建立的頁面、區塊、商品與表單內容。
            </li>
            <li>
              <strong>使用資料：</strong>訪客點擊、曝光、來源、裝置類型等匿名統計資料。
            </li>
            <li>
              <strong>金流資料：</strong>信用卡資料由 Stripe 處理，我們不儲存完整卡號。
            </li>
          </ul>

          <h2 className="text-2xl font-semibold">2. 資料的使用方式</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>提供、維運並改善 {SITE_NAME} 的產品與服務</li>
            <li>處理訂單、發票、退款與客戶支援</li>
            <li>傳送產品更新、重要公告與行銷訊息（可隨時取消訂閱）</li>
            <li>偵測詐欺、濫用行為並維護平台安全</li>
          </ul>

          <h2 className="text-2xl font-semibold">3. 資料分享</h2>
          <p>
            我們不會販售你的個人資料。僅在以下情況會與第三方分享資料：
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>金流處理（Stripe）</li>
            <li>雲端服務商（Vercel、資料庫供應商）</li>
            <li>法律要求或主管機關依法請求時</li>
          </ul>

          <h2 className="text-2xl font-semibold">4. 你的權利</h2>
          <p>
            你可以隨時查閱、更正、下載或刪除你的個人資料。如需行使上述權利，請來信{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-purple-600 underline hover:text-purple-700"
            >
              {CONTACT_EMAIL}
            </a>
            。
          </p>

          <h2 className="text-2xl font-semibold">5. Cookie 使用</h2>
          <p>
            我們使用 Cookie 與類似技術來維持登入狀態、記錄使用者偏好以及分析網站流量。你可以透過瀏覽器設定管理或停用 Cookie。
          </p>

          <h2 className="text-2xl font-semibold">6. 政策更新</h2>
          <p>
            我們可能會不時更新本政策。重大變更會透過 Email 或網站公告通知。繼續使用 {SITE_NAME} 即視為同意修訂後的條款。
          </p>

          <h2 className="text-2xl font-semibold">7. 聯絡我們</h2>
          <p>
            若對本隱私權政策有任何疑問，請來信{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-purple-600 underline hover:text-purple-700"
            >
              {CONTACT_EMAIL}
            </a>
            。
          </p>
        </section>
      </main>
    </>
  )
}
