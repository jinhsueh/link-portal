import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/site'

export const metadata: Metadata = {
  title: '服務條款',
  description: `${SITE_NAME} 服務條款，說明使用本平台的權利與義務。`,
  alternates: { canonical: '/terms' },
  robots: { index: true, follow: true },
}

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '首頁', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: '服務條款', item: `${SITE_URL}/terms` },
  ],
}

export default function TermsPage() {
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
          <span className="text-gray-900">服務條款</span>
        </nav>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">服務條款</h1>
        <p className="mb-10 text-sm text-gray-500">最後更新：2026 年 4 月</p>

        <section className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p>
            歡迎使用 {SITE_NAME}。使用本服務前，請仔細閱讀以下條款。當你註冊、存取或使用 {SITE_NAME}，即表示同意遵守本條款。
          </p>

          <h2 className="text-2xl font-semibold">1. 服務說明</h2>
          <p>
            {SITE_NAME} 提供 Link in Bio 頁面建立、數位商品販售、Email 名單蒐集與數據分析等工具。功能與方案內容可能會隨時更新，我們會透過網站公告或 Email 通知重大變更。
          </p>

          <h2 className="text-2xl font-semibold">2. 帳號註冊</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>註冊時你需提供真實且完整的資料</li>
            <li>帳號與密碼由你自行保管，任何經由你的帳號進行的操作視為你本人行為</li>
            <li>一人原則上僅註冊一個帳號，惡意重複註冊可能被停權</li>
          </ul>

          <h2 className="text-2xl font-semibold">3. 使用限制</h2>
          <p>你同意不會使用 {SITE_NAME} 進行以下行為：</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>散布違法、仇恨、騷擾、色情或侵犯他人權益的內容</li>
            <li>販售違法、仿冒或未授權的商品</li>
            <li>從事詐騙、洗錢或其他犯罪活動</li>
            <li>以自動化工具大量操作平台或進行爬蟲</li>
            <li>逆向工程、破解或嘗試取得未授權的系統存取</li>
          </ul>

          <h2 className="text-2xl font-semibold">4. 付費方案與退款</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Pro 與 Premium 方案採月繳或年繳制，費用於訂閱時自動扣款</li>
            <li>你可隨時取消訂閱，已繳付的費用於當期結束後停止續扣</li>
            <li>除因本平台重大瑕疵無法使用外，原則上不提供退款</li>
            <li>販售數位商品時，平台依方案抽取對應比例手續費</li>
          </ul>

          <h2 className="text-2xl font-semibold">5. 內容所有權</h2>
          <p>
            你在 {SITE_NAME} 上建立的內容（頁面、商品、圖片、文字）其著作權歸你所有。你授權 {SITE_NAME} 在提供服務所必要的範圍內使用、儲存、顯示這些內容。
          </p>

          <h2 className="text-2xl font-semibold">6. 服務中止與帳號終止</h2>
          <p>
            若違反本條款或法律規定，{SITE_NAME} 有權暫停或終止你的帳號，且不退還已繳費用。我們會盡可能事先通知，但涉及平台安全或法律風險時得立即處置。
          </p>

          <h2 className="text-2xl font-semibold">7. 免責聲明</h2>
          <p>
            {SITE_NAME} 依「現狀」與「可用時」提供服務。我們對服務的可用性、正確性與無中斷性不作任何擔保。因使用或無法使用服務所產生的間接損失，我們不負賠償責任。
          </p>

          <h2 className="text-2xl font-semibold">8. 條款變更</h2>
          <p>
            我們可能不時更新本條款。重大變更會在網站公告並透過 Email 通知。繼續使用 {SITE_NAME} 即視為同意修訂後的條款。
          </p>

          <h2 className="text-2xl font-semibold">9. 聯絡我們</h2>
          <p>
            關於本條款的任何問題，請來信{' '}
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
