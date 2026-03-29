import Link from 'next/link'
import { Link2, BarChart2, ShoppingBag, Mail, ArrowRight, Users, Zap } from 'lucide-react'

const FEATURES = [
  {
    icon: Link2,
    title: '個人連結頁面',
    description: '把所有社群、連結集中在一個漂亮的頁面，一個網址搞定一切。',
  },
  {
    icon: BarChart2,
    title: '數據分析',
    description: '即時掌握訪客數、點擊率、熱門連結，用數據優化你的頁面。',
  },
  {
    icon: ShoppingBag,
    title: '數位商品銷售',
    description: '直接在頁面上販售電子書、課程、模板，輕鬆開始創作者變現。',
  },
  {
    icon: Mail,
    title: '粉絲名單蒐集',
    description: '一鍵加入 Email 訂閱表單，建立私域流量，不再依賴演算法。',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-primary), var(--font-cjk)' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }} className="sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
              <Link2 size={16} color="white" />
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Link Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hover:opacity-70 transition-opacity">
              登入
            </Link>
            <Link href="/login" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
              免費開始
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'var(--gradient-hero)', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={14} />
            超過 10,000 位創作者使用
          </div>
          <h1 className="font-extrabold mb-6 leading-tight"
            style={{ fontSize: 'clamp(40px, 6vw, 60px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
            專屬創作者的<br />
            <span style={{ color: 'var(--color-primary)' }}>個人品牌傳送門</span>
          </h1>
          <p className="mb-10 max-w-xl mx-auto" style={{ fontSize: 18, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            一個連結，整合所有社群、商品、名單蒐集。讓粉絲找到你，讓流量變現金。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
              免費建立傳送門
              <ArrowRight size={18} />
            </Link>
            <Link href="/demo" className="btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
              查看範例
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-sm"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.1em' }}>功能特色</span>
            <h2 className="font-bold" style={{ fontSize: 36, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              一站式創作者工具
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card" style={{ padding: 28 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--gradient-blue)' }}>
                  <Icon size={22} color="white" />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 17 }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '64px 24px', background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '10,000+', label: '活躍創作者' },
              { value: '500萬+', label: '每月頁面瀏覽' },
              { value: '永久免費', label: '基礎方案' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-extrabold mb-1" style={{ fontSize: 40, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{value}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--gradient-hero)' }}>
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--gradient-blue)' }}>
            <Zap size={28} color="white" />
          </div>
          <h2 className="font-extrabold mb-4" style={{ fontSize: 36, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
            現在就開始
          </h2>
          <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>免費建立你的專屬傳送門，不需要信用卡。</p>
          <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
            建立我的傳送門
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '24px', background: 'white' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
              <Link2 size={12} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Link Portal</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>© 2026 Link Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
