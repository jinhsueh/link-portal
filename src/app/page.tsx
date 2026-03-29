import Link from 'next/link'
import {
  Link2, BarChart2, ShoppingBag, Mail, ArrowRight, Users, Zap,
  Layers, Palette, FileStack, UserPlus, Plus, Share2, Check, Play, Globe,
  Video, Headphones, PenTool, Mic, Star, Crown, TrendingUp
} from 'lucide-react'

const FEATURES = [
  {
    icon: Layers,
    title: '多元區塊類型',
    description: '連結、橫幅、影片、商品、表單、標題⋯⋯自由拖放排列，打造獨一無二的頁面。',
  },
  {
    icon: Palette,
    title: '主題自訂',
    description: '8 款預設主題一鍵套用，或自訂色彩、漸層背景、按鈕風格，品牌風格完全掌控。',
  },
  {
    icon: BarChart2,
    title: '數據追蹤',
    description: '即時掌握訪客數、點擊率、熱門連結，用數據優化你的每一個區塊。',
  },
  {
    icon: ShoppingBag,
    title: '數位商品販售',
    description: '內建金流串接，直接在頁面上販售課程、電子書、模板，秒變個人商店。',
  },
  {
    icon: Mail,
    title: '粉絲名單蒐集',
    description: '嵌入 Email 訂閱表單，建立私域流量，擺脫平台演算法的束縛。',
  },
  {
    icon: FileStack,
    title: '多分頁管理',
    description: '一個帳號多個頁面，用分頁標籤分類你的內容 — 課程、合作、個人⋯⋯',
  },
]

const STEPS = [
  {
    icon: UserPlus,
    num: '1',
    title: '建立帳號',
    description: '輸入用戶名，一鍵註冊，不需要信用卡，30 秒內完成。',
  },
  {
    icon: Plus,
    num: '2',
    title: '新增區塊',
    description: '拖放連結、商品、影片、表單等區塊，直覺編輯即時預覽。',
  },
  {
    icon: Share2,
    num: '3',
    title: '分享連結',
    description: '把你的專屬連結放到 IG Bio、YouTube、Threads，一個連結搞定。',
  },
]

const USE_CASES = [
  {
    icon: Video,
    title: 'IG / YouTube 創作者',
    pain: 'Bio 只能放一個連結，粉絲找不到你的其他內容',
    solution: '一個連結整合所有社群、最新影片、合作邀約表單，放在 IG Bio 就搞定。',
    cta: '建立創作者頁面',
  },
  {
    icon: ShoppingBag,
    title: '線上課程 / 數位商品賣家',
    pain: '架站太複雜，只想簡單賣課程和模板',
    solution: '內建金流串接，直接在頁面上販售電子書、模板、課程，免架站免抽成。',
    cta: '開始販售商品',
  },
  {
    icon: Headphones,
    title: 'Podcast 主持人',
    pain: '聽眾分散在 Apple、Spotify、KKBOX，沒有統一入口',
    solution: '一頁整合所有收聽平台連結 + 贊助連結 + Email 訂閱，讓聽眾一次找到你。',
    cta: '建立 Podcast 頁面',
  },
]

const TESTIMONIALS = [
  {
    name: 'Mia Chen',
    role: 'YouTuber / 10 萬訂閱',
    quote: '終於不用一直換 Bio 連結了，粉絲可以在一個頁面找到我所有的內容和課程。',
    avatar: 'M',
    metric: '連結點擊率提升 3 倍',
  },
  {
    name: 'Alex Wang',
    role: '自由設計師',
    quote: '用 Link Portal 賣設計模板，不用另外架站，收款直接入帳超方便。',
    avatar: 'A',
    metric: '月銷售額 NT$ 45,000+',
  },
  {
    name: 'Sarah Lin',
    role: 'Podcast 主持人',
    quote: '主題客製功能超讚，調出來的頁面完全符合我的品牌風格，而且免費！',
    avatar: 'S',
    metric: 'Email 名單成長 200%',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-primary), var(--font-cjk)' }}>

      {/* ─── Navbar ─── */}
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

      {/* ─── Hero ─── */}
      <section style={{ background: 'var(--gradient-hero)', padding: '100px 24px 60px', textAlign: 'center', overflow: 'hidden' }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-semibold animate-fade-in-up"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Users size={14} />
            超過 10,000 位創作者使用
          </div>
          <h1 className="font-extrabold mb-6 leading-tight animate-fade-in-up"
            style={{ fontSize: 'clamp(40px, 6vw, 64px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)', animationDelay: '0.1s' }}>
            一個連結整合所有社群<br />
            <span className="text-gradient">創作者的 Link in Bio 工具</span>
          </h1>
          <p className="mb-10 max-w-xl mx-auto animate-fade-in-up" style={{ fontSize: 18, color: 'var(--color-text-secondary)', lineHeight: 1.7, animationDelay: '0.2s' }}>
            把 IG Bio、YouTube、Podcast、數位商品、粉絲名單<br className="hidden sm:block" />
            全部整合在一個頁面。讓粉絲找到你，讓流量變現金。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
              免費建立傳送門
              <ArrowRight size={18} />
            </Link>
            <Link href="/demo" className="btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
              <Play size={16} />
              查看範例
            </Link>
          </div>
        </div>

        {/* Hero phone mockup */}
        <div className="mt-16 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="animate-float phone-frame" style={{ width: 280 }}>
            <div className="phone-frame-inner" style={{ height: 520 }}>
              <iframe
                src="/demo"
                title="Link Portal Demo"
                loading="eager"
                style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>FEATURES</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              一站式創作者工具
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              不只是連結頁面，更是你的個人品牌中心
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card group" style={{ padding: 32, borderColor: 'transparent', transition: 'all 0.3s' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--color-primary-light)', transition: 'background 0.3s' }}>
                  <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 18 }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Demo Preview ─── */}
      <section style={{ padding: '100px 24px', background: 'white' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>LIVE DEMO</span>
            <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              看看實際效果
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: 16, maxWidth: 440 }}>
              你的頁面在手機上就是這樣呈現。所有區塊都能自由組合、即時預覽，怎麼排都好看。
            </p>

            <div className="flex flex-col gap-4 mb-8" style={{ maxWidth: 400 }}>
              {[
                '拖放排序，直覺編輯',
                '自訂主題色、漸層背景',
                '手機、桌面完美適配',
                '載入速度 < 1 秒',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-primary-light)' }}>
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: 15, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/demo" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              查看完整範例
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex-shrink-0">
            <div className="animate-float phone-frame" style={{ width: 300 }}>
              <div className="phone-frame-inner">
                <iframe
                  src="/demo"
                  title="Link Portal Demo Preview"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>HOW IT WORKS</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              三步驟，立即上線
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {STEPS.map(({ icon: Icon, num, title, description }, i) => (
              <div key={num} className={`text-center relative ${i < STEPS.length - 1 ? 'step-connector' : ''}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 relative"
                  style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 24px rgba(80,144,255,0.25)' }}>
                  <Icon size={24} color="white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'white', color: 'var(--color-primary)', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
                    {num}
                  </div>
                </div>
                <h3 className="font-bold mb-2" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>{title}</h3>
                <p className="text-sm mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: 260 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use Cases (ICP Targeting) ─── */}
      <section style={{ padding: '100px 24px', background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>USE CASES</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              不同身份，同一個解決方案
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              不管你是哪種類型的創作者，Link Portal 都能解決你的痛點
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {USE_CASES.map(({ icon: Icon, title, pain, solution, cta }) => (
              <div key={title} className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--color-primary-light)' }}>
                  <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="font-bold" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>{title}</h3>
                <div className="rounded-lg px-4 py-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>痛點：</span>{pain}
                  </p>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{solution}</p>
                <Link href="/login" className="btn-primary" style={{ fontSize: 14, padding: '10px 20px', alignSelf: 'flex-start' }}>
                  {cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ padding: '100px 24px', background: 'white' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>TESTIMONIALS</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              創作者怎麼說
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, quote, avatar, metric }) => (
              <div key={name} className="card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold self-start"
                  style={{ background: 'rgba(80,200,120,0.1)', color: 'rgb(34,139,34)' }}>
                  <TrendingUp size={12} />
                  {metric}
                </div>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: 15, flex: 1 }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs"
              style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>PRICING</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              簡單透明的方案
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              免費方案已能滿足大多數創作者，需要更多功能再升級
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="card" style={{ padding: 32 }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>Free</h3>
              <p className="mb-6" style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>永久免費，不需信用卡</p>
              <p className="font-extrabold mb-6" style={{ fontSize: 40, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                $0 <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ 永久</span>
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {[
                  '無限連結區塊',
                  '8 款預設主題',
                  '基礎數據追蹤',
                  '1 個分頁',
                  'Email 訂閱表單',
                  'Link Portal 品牌標示',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-ghost w-full justify-center" style={{ padding: '12px 24px' }}>
                免費開始
              </Link>
            </div>
            {/* Pro Plan */}
            <div className="card" style={{ padding: 32, border: '2px solid var(--color-primary)', position: 'relative' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                <Crown size={12} />
                最受歡迎
              </div>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>Pro</h3>
              <p className="mb-6" style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>適合認真經營的創作者</p>
              <p className="font-extrabold mb-6" style={{ fontSize: 40, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                $199 <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ 月 (TWD)</span>
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {[
                  'Free 方案所有功能',
                  '自訂色彩 / 漸層 / 按鈕風格',
                  '進階數據分析 + UTM 追蹤',
                  '無限分頁',
                  '數位商品販售',
                  '移除 Link Portal 品牌標示',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={16} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-primary w-full justify-center" style={{ padding: '12px 24px' }}>
                免費試用 14 天
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '10,000+', label: '活躍創作者' },
              { value: '500萬+', label: '每月瀏覽量' },
              { value: '< 1s', label: '頁面載入' },
              { value: '永久免費', label: '基礎方案' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-extrabold mb-1" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{value}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D5E 100%)' }}>
        <div className="max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 32px rgba(80,144,255,0.4)' }}>
            <Zap size={32} color="white" />
          </div>
          <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(32px, 5vw, 44px)', color: 'white', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
            30 秒建立你的頁面
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.6 }}>
            輸入你的用戶名，立即搶佔你的專屬網址
          </p>
          {/* Username claim input */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 max-w-md mx-auto">
            <div className="flex items-center rounded-xl overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="pl-4 text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>linkportal.to/</span>
              <input
                type="text"
                placeholder="你的名字"
                className="flex-1 bg-transparent border-none outline-none py-3.5 pr-4 text-white placeholder:text-white/30"
                style={{ fontSize: 15 }}
              />
            </div>
            <Link href="/login" className="btn-primary whitespace-nowrap" style={{ fontSize: 15, padding: '14px 28px', boxShadow: '0 8px 32px rgba(80,144,255,0.4)' }}>
              免費搶佔
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['免費使用', '不需信用卡', '30 秒完成註冊'].map(text => (
              <div key={text} className="flex items-center gap-1.5">
                <Check size={14} style={{ color: 'rgba(80,200,120,0.9)' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '32px 24px', background: 'white' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
              <Link2 size={12} color="white" />
            </div>
            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Link Portal</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/demo" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>範例</Link>
            <Link href="/login" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>登入</Link>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>&copy; 2026 Link Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
