import Link from 'next/link'
import { Link2, BarChart2, ShoppingBag, Mail, ArrowRight, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: Link2,
    title: '個人連結頁面',
    description: '把所有社群、連結集中在一個漂亮的個人頁面，一個網址搞定一切。',
  },
  {
    icon: BarChart2,
    title: '數據分析',
    description: '即時掌握訪客數、點擊率、熱門連結，用數據優化你的頁面。',
  },
  {
    icon: ShoppingBag,
    title: '數位商品銷售',
    description: '直接在頁面上販售電子書、課程、模板，輕鬆開始創作者經濟。',
  },
  {
    icon: Mail,
    title: '粉絲名單蒐集',
    description: '一鍵加入 Email 訂閱表單，建立你的私域流量，不再依賴平台演算法。',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 z-30 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-violet-700 text-xl">Link Portal</span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              登入
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 bg-violet-600 text-white rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              免費開始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
            <Users size={14} />
            超過 10,000 位創作者使用
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            專屬創作者的
            <br />
            <span className="text-violet-600">個人品牌傳送門</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            一個連結，整合所有社群、商品、名單蒐集。讓粉絲找到你，讓流量變現金。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-full text-lg font-bold hover:bg-violet-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-200"
            >
              免費建立傳送門
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-violet-200 text-violet-700 rounded-full text-lg font-semibold hover:bg-violet-50 transition-colors"
            >
              查看範例頁面
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-3">功能特色</p>
            <h2 className="text-4xl font-bold text-gray-900">一站式創作者工具</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-violet-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: '10,000+', label: '活躍創作者' },
              { value: '500萬+', label: '每月頁面瀏覽' },
              { value: '免費', label: '永久基礎方案' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-violet-700 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">現在就開始</h2>
          <p className="text-gray-500 mb-8">免費建立你的專屬傳送門，不需要信用卡。</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-full text-lg font-bold hover:bg-violet-700 transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-200"
          >
            建立我的傳送門
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-violet-700">Link Portal</span>
          <p className="text-xs text-gray-400">© 2026 Link Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
