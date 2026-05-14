import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Link2, BarChart2, ShoppingBag, Mail, ArrowRight, Zap,
  Layers, Palette, FileStack, UserPlus, Plus, Share2, Check, Play, X,
  Video, Headphones, Sparkles, CalendarPlus, DownloadCloud,
  Camera, PlayCircle, Music2, Globe, ExternalLink,
  Image as ImageIcon, Type, Timer, HelpCircle,
  Images as ImagesIcon, MapPin, Code, Heart, Star,
  TrendingUp, ChevronDown,
} from 'lucide-react'
import { PLAN_PRICING } from '@/lib/plan'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'

/**
 * Traditional Chinese landing page (zh-TW).
 *
 * Originally lived at `/`; the root now redirects via middleware based on
 * Accept-Language. This page is the canonical zh-TW landing — mirrors
 * `/en/page.tsx` 1:1 in structure. If you change one, change all locales
 * to keep them in sync.
 */
export const metadata: Metadata = {
  title: 'Beam — 免費 Link in Bio 工具｜創作者社群連結整合',
  description: '一個連結整合所有社群、商品、名單蒐集。免費建立,30 秒上線。',
  alternates: {
    canonical: '/zh-TW',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    title: 'Beam — 免費 Link in Bio 工具｜創作者社群連結整合',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立,30 秒上線。',
    url: '/zh-TW',
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beam — 免費 Link in Bio 工具',
    description: '一個連結整合所有社群、商品、名單蒐集。免費建立,30 秒上線。',
  },
}

const FEATURES = [
  { icon: Layers,      title: '十二種區塊類型',     description: '連結、橫幅、影片、商品、表單、日曆⋯⋯ 拖放排列,做出真正屬於你的頁面。' },
  { icon: Palette,     title: '主題自訂',           description: '8 款預設主題一鍵套用,或自訂色彩、漸層背景、按鈕風格。品牌風格,逐像素掌控。' },
  { icon: BarChart2,   title: '即時數據追蹤',       description: '掌握訪客數、點擊率、熱門連結 — 用數據優化你的每一個區塊。' },
  { icon: ShoppingBag, title: '販售數位商品',       description: '內建 Stripe 金流,直接在頁面上販售課程、電子書、模板,不用架站、免抽成上限。' },
  { icon: Mail,        title: '蒐集粉絲名單',       description: '嵌入 Email 訂閱表單,擁有自己的私域流量,擺脫平台演算法束縛。' },
  { icon: FileStack,   title: '多分頁管理',         description: '一個帳號多個頁面,用分頁標籤分類內容 — 課程、合作、個人,一次管好。' },
]

const STEPS = [
  { icon: UserPlus, num: '1', title: '建立帳號',   description: '輸入用戶名,不需要信用卡,30 秒內完成註冊。' },
  { icon: Plus,     num: '2', title: '新增區塊',   description: '拖放、編輯、即時預覽,所見即所得。' },
  { icon: Share2,   num: '3', title: '分享連結',   description: '把連結放到 IG Bio、YouTube、Threads,一個連結搞定全部。' },
]

const USE_CASES = [
  {
    icon: Video,
    title: 'IG / YouTube 創作者',
    pain: 'Bio 只能放一個連結,粉絲找不到你的其他內容。',
    solution: '一個連結整合所有社群、最新影片、合作邀約表單,直接放在 IG Bio 就搞定。',
    cta: '建立創作者頁面',
    sample: { name: '米亞', handle: '@miachen.cooks', blocks: ['最新 YouTube 影片', '我的食譜電子書', '品牌合作邀約'] },
  },
  {
    icon: ShoppingBag,
    title: '線上課程 / 數位商品賣家',
    pain: '架站太複雜,只想簡單賣課程和模板。',
    solution: '內建 Stripe 金流,直接在頁面上販售電子書、模板、課程 — 免架站、免被平台綁。',
    cta: '開始販售商品',
    sample: { name: '阿翔', handle: '@alexcoaches', blocks: ['Notion 模板套組 — NT$890', '一對一教練 (60 分鐘)', '免費電子報'] },
  },
  {
    icon: Headphones,
    title: 'Podcast 主持人',
    pain: '聽眾分散在 Apple、Spotify、KKBOX,沒有統一入口。',
    solution: '一頁整合所有收聽平台連結 + 贊助連結 + Email 訂閱,讓聽眾一次找到你。',
    cta: '建立 Podcast 頁面',
    sample: { name: '漂流電台', handle: '@thedriftshow', blocks: ['Spotify 收聽', 'Apple Podcasts 收聽', '請我喝杯咖啡'] },
  },
]

const BLOCK_TYPES = [
  { icon: ExternalLink, label: '連結按鈕',    color: '#5090FF' },
  { icon: ImageIcon,    label: '橫幅圖片',    color: '#F472B6' },
  { icon: Type,         label: '標題文字',    color: '#A78BFA' },
  { icon: Video,        label: '影片嵌入',    color: '#EF4444' },
  { icon: ShoppingBag,  label: '數位商品',    color: '#10B981' },
  { icon: Mail,         label: 'Email 表單',  color: '#F59E0B' },
  { icon: Timer,        label: '倒數計時',    color: '#8B5CF6' },
  { icon: HelpCircle,   label: 'FAQ 問答',    color: '#06B6D4' },
  { icon: ImagesIcon,   label: '圖片輪播',    color: '#EC4899' },
  { icon: MapPin,       label: '地圖嵌入',    color: '#14B8A6' },
  { icon: Code,         label: 'HTML 嵌入',   color: '#64748B' },
  { icon: CalendarPlus, label: '加入日曆',    color: '#3B82F6', isNew: true },
]

const TESTIMONIALS = [
  { name: '小薇',       role: '美妝創作者,IG 28 萬粉絲',   quote: '從 Linktree 搬家真的只花 30 秒。光是「加入日曆」這個區塊就讓直播出席率多了 22%。', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)' },
  { name: 'Marcus',     role: '線上課程創作者',           quote: '我現在從這個頁面賺的比之前的 Shopify 還多。Pro 方案 5% 抽成,光是轉換率提升就值回票價。', gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' },
  { name: '包子廣播',   role: 'Podcast,4.5 萬聽眾',       quote: '一個頁面、所有 Podcast 平台、加上電子報訂閱。換過來那週,贊助打賞直接成長。', gradient: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' },
]

const FAQS = [
  { q: '真的有永久免費方案嗎?', a: '是的,免費方案永久可用。1 個頁面、12 個區塊、6 種核心區塊類型、商品販售(10% 平台抽成)。不需要信用卡。' },
  { q: '可以從 Linktree 匯入嗎?', a: '可以。貼上你的 linktr.ee 或 portaly.cc 網址,Beam 會自動把你的連結、社群圖標、名稱、簡介、頭像全部抓過來,整個過程約 30 秒。' },
  { q: 'Beam 跟 Linktree 比起來價格如何?', a: 'Beam Pro 月費 NT$' + PLAN_PRICING.pro.monthly + ',跟 Linktree Starter 差不多 — 但你還能販售商品(5% 抽成)、3 位團隊成員、加入日曆區塊。' },
  { q: '可以販售數位商品嗎?', a: '可以,所有方案皆可。免費方案 10% 抽成、Pro 5%、Premium 2%。Stripe 處理金流,款項直接進你的帳戶。' },
  { q: '需要懂程式嗎?', a: '完全不用。所有設定都是拖放 + 即時預覽。如果你想要自訂 CSS 或 iframe,Premium 方案的 HTML 嵌入區塊都支援。' },
  { q: '可以用自己的網域嗎?', a: 'Pro 方案會給你乾淨的 beam.io/yourname 網址。Premium 方案支援自訂網域,把你自己的域名指向你的頁面。' },
]

const COMPARISON = [
  { feature: '免費方案',              us: '永久',           them: '受限' },
  { feature: '拖放編輯器',            us: true,             them: true },
  { feature: '販售數位商品',          us: '所有方案',       them: '需付費方案' },
  { feature: 'Email 名單蒐集',        us: '所有方案',       them: '需付費方案' },
  { feature: '加入日曆區塊',          us: true,             them: false },
  { feature: 'Linktree / Portaly 匯入', us: true,           them: false },
  { feature: '多分頁(Tabs)',         us: '最高無限',       them: '不支援' },
  { feature: '團隊協作成員',          us: '最高無限',       them: '受限' },
  { feature: '自訂網域',              us: 'Premium',        them: '頂級方案才有' },
]

/* ── Tiny inline mockup of a Beam page (used in mockup cards) ── */
function MiniPagePreview({ name, handle, blocks, accent = '#5090FF' }: { name: string; handle: string; blocks: string[]; accent?: string }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Fake mobile chrome */}
      <div className="flex items-center gap-1 px-3 py-1.5" style={{ background: '#F1F5F9', borderBottom: '1px solid var(--color-border)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#EF4444' }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981' }} />
        <span className="ml-2 text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>beam.io/{handle.replace('@', '')}</span>
      </div>
      <div className="p-4 flex flex-col items-center" style={{ background: 'linear-gradient(180deg, rgba(80,144,255,0.06) 0%, transparent 60%)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-2" style={{ background: accent }}>
          {initial}
        </div>
        <p className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
        <p className="text-[10px] mb-3" style={{ color: 'var(--color-text-muted)' }}>{handle}</p>
        <div className="flex flex-col gap-1.5 w-full">
          {blocks.map(b => (
            <div key={b} className="flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold"
              style={{ background: '#fff', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
              <span className="truncate">{b}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-primary), var(--font-cjk)' }}>

      {/* ─── Navbar ─── */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }} className="sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/zh-TW" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-blue)' }}>
              <Link2 size={16} color="white" />
            </div>
            <span className="font-bold text-base sm:text-lg whitespace-nowrap" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Beam</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <Link href="/pricing" style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">定價</Link>
            <Link href="/login"   style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">登入</Link>
            <LanguageSwitcher />
            <Link href="/login" className="btn-primary whitespace-nowrap flex-shrink-0" style={{ padding: '9px 16px', fontSize: 13 }}>免費開始</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero (with floating mockup cards) ─── */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-28 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Decorative blurs */}
        <div aria-hidden className="absolute -top-24 -left-24 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,144,255,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div aria-hidden className="absolute -bottom-32 -right-24 w-[480px] h-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }} />

        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center relative">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs sm:text-sm font-semibold animate-fade-in-up"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Sparkles size={14} />
              新功能:Linktree 一鍵搬家、加入日曆區塊
            </div>
            <h1 className="font-extrabold mb-5 leading-tight animate-fade-in-up"
              style={{ fontSize: 'clamp(28px, 6vw, 60px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)', animationDelay: '0.1s', wordBreak: 'keep-all' }}>
              一個連結,<br />
              <span className="text-gradient">整合所有粉絲觸點</span>
            </h1>
            <p className="mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'var(--color-text-secondary)', lineHeight: 1.7, animationDelay: '0.2s' }}>
              把 IG Bio、YouTube、Podcast、數位商品、粉絲名單,全部整合在一個頁面。讓粉絲找到你,讓流量變現金。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
                免費建立傳送門 <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
                <Play size={16} /> 查看範例
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 justify-center lg:justify-start text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {['永久免費', '不需信用卡', '30 秒完成註冊', '隨時取消'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check size={12} style={{ color: '#10B981' }} />{t}</span>
              ))}
            </div>
          </div>

          {/* Right: phone + floating cards */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="phone-frame animate-float" style={{ width: '100%', maxWidth: 280 }}>
              <div className="phone-frame-inner" style={{ height: 540 }}>
                <iframe src="/demo" title="Beam 範例" loading="eager" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Floating analytics card */}
            <div className="hidden md:block absolute -left-6 lg:-left-12 top-12 rounded-2xl p-3" style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', width: 180 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                  <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-text-muted)' }}>本週</p>
                  <p className="text-sm font-extrabold" style={{ color: 'var(--color-text-primary)' }}>+18.4%</p>
                </div>
              </div>
              <div className="flex items-end gap-1 h-8">
                {[40, 55, 35, 60, 70, 50, 85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: 'var(--gradient-blue)' }} />
                ))}
              </div>
            </div>

            {/* Floating sale card */}
            <div className="hidden md:block absolute -right-2 lg:-right-6 bottom-20 rounded-2xl p-3 flex items-center gap-3" style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', width: 220 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#DCFCE7' }}>
                <ShoppingBag size={16} style={{ color: '#16A34A' }} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-text-muted)' }}>新訂單</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Notion 模板組</p>
                <p className="text-xs" style={{ color: '#16A34A', fontWeight: 600 }}>+ NT$890</p>
              </div>
            </div>

            {/* Floating notification card */}
            <div className="hidden lg:flex absolute right-12 -top-2 rounded-2xl p-3 items-center gap-2" style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                <Heart size={13} style={{ color: '#EF4444', fill: '#EF4444' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>今日新增 247 次點擊</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logo cloud (creator handles as social proof) ─── */}
      <section style={{ padding: '40px 24px', background: '#fff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>
            支援所有創作者使用的平台
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              { Icon: Camera,      label: 'Instagram' },
              { Icon: PlayCircle,  label: 'YouTube' },
              { Icon: Music2,      label: 'Spotify' },
              { Icon: Video,       label: 'TikTok' },
              { Icon: Globe,       label: 'Threads' },
              { Icon: Headphones,  label: 'Apple Podcasts' },
            ].map(({ Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <Icon size={18} style={{ color: 'var(--color-text-secondary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What's New (visual import flow) ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>JUST SHIPPED</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              從 Linktree 搬家,只要 30 秒
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              貼上你的舊網址。我們把所有連結、社群圖標、個人欄位抓過來。你確認,完成。
            </p>
          </div>

          {/* Visual flow: URL → arrow → result */}
          <div className="grid md:grid-cols-[1.2fr_auto_1fr] gap-6 items-center max-w-5xl mx-auto">
            {/* Step 1: paste URL */}
            <div className="card" style={{ padding: 24 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>1</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>貼上舊網址</span>
              </div>
              <div className="rounded-lg flex items-center gap-2 px-3 py-2.5 mb-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Link2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-mono truncate" style={{ color: 'var(--color-text-primary)' }}>linktr.ee/yourname</span>
              </div>
              <button className="text-xs font-bold w-full rounded-lg py-2" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                預覽內容 →
              </button>
            </div>

            {/* Arrow */}
            <div className="flex md:flex-col items-center justify-center gap-2">
              <ArrowRight size={32} className="hidden md:block" style={{ color: 'var(--color-primary)' }} />
              <ArrowRight size={24} className="md:hidden" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>~30 秒</span>
            </div>

            {/* Step 2: result */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#DCFCE7', borderBottom: '1px solid #86EFAC' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#15803D' }}>✓ 已匯入</span>
                <span className="text-xs" style={{ color: '#15803D' }}>9 個區塊 · 4 個社群</span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { Icon: PlayCircle,   label: '我的 YouTube 頻道' },
                  { Icon: ShoppingBag,  label: '販售模板商店' },
                  { Icon: Mail,         label: '電子報訂閱' },
                  { Icon: ExternalLink, label: '最新合作案' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <Icon size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                    <Check size={14} className="ml-auto" style={{ color: '#16A34A' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add-to-Calendar showcase */}
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-center mt-20 max-w-5xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 mb-3 text-[11px] font-bold" style={{ background: '#FEF3C7', color: '#92400E' }}>
                NEW · Pro+
              </div>
              <h3 className="font-bold mb-3" style={{ fontSize: 28, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
                加入日曆區塊
              </h3>
              <p className="mb-5" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                快閃店、直播、團購結單,粉絲一鍵加入 Google 日曆。完整時區支援、可下載 .ics 給 Apple Calendar 與 Outlook。
              </p>
              <ul className="space-y-2">
                {['自動偵測粉絲時區', 'Google Calendar + .ics 下載', '直播、活動、限時優惠最佳搭檔'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <Check size={14} style={{ color: 'var(--color-primary)' }} /> <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock calendar event card */}
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0" style={{ background: 'var(--gradient-blue)' }}>
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">5 月</span>
                  <span className="text-base font-extrabold leading-none">17</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>直播 Q&amp;A:打造你的個人品牌</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>5 月 17 日(六) · 晚上 8:00 (GMT+8)</p>
                  <p className="text-xs mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={11} /> 線上 · YouTube Live
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                  <CalendarPlus size={13} /> Google 日曆
                </button>
                <button className="rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: '#fff', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}>
                  <DownloadCloud size={13} /> .ics
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Block types showcase ─── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>BLOCK TYPES</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              12 種區塊,自由組合
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              拖放排序、即時隱藏、混搭組合 — 你的頁面,跟你一樣靈活。
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BLOCK_TYPES.map(({ icon: Icon, label, color, isNew }) => (
              <div key={label} className="relative rounded-xl flex flex-col items-center justify-center text-center transition-all hover:scale-105"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px 12px' }}>
                {isNew && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#F59E0B', color: '#fff' }}>NEW</span>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: color + '15' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>FEATURES</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              一站式創作者工具
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              不只是連結頁面,更是你的個人品牌中心。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card group" style={{ padding: 32, borderColor: 'transparent', transition: 'all 0.3s' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'var(--color-primary-light)' }}>
                  <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-text-primary)', fontSize: 18 }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live demo (split) ─── */}
      <section style={{ padding: '100px 24px', background: 'white' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>LIVE DEMO</span>
            <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              看看實際效果
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: 16, maxWidth: 440 }}>
              你的頁面在手機上就是這樣呈現。所有區塊都能自由組合、即時預覽,做出來真的好看。
            </p>
            <div className="flex flex-col gap-4 mb-8" style={{ maxWidth: 400 }}>
              {[
                '拖放排序,直覺編輯',
                '自訂主題色、漸層背景',
                '手機、桌面完美適配',
                '載入速度 < 1 秒',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-light)' }}>
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <span style={{ color: 'var(--color-text-primary)', fontSize: 15, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/demo" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
              查看完整範例 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-shrink-0">
            <div className="animate-float phone-frame" style={{ width: 300 }}>
              <div className="phone-frame-inner">
                <iframe src="/demo" title="Beam 範例預覽" loading="lazy" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>HOW IT WORKS</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              三步驟,立即上線
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-4">
            {STEPS.map(({ icon: Icon, num, title, description }, i) => (
              <div key={num} className={`text-center relative ${i < STEPS.length - 1 ? 'step-connector' : ''}`}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 relative" style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 24px rgba(80,144,255,0.25)' }}>
                  <Icon size={24} color="white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'white', color: 'var(--color-primary)', border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-sm)' }}>
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

      {/* ─── Use cases (with mini page mockups) ─── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>USE CASES</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              不同身份,同一個解決方案
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              不管你是哪種類型的創作者,Beam 都能解決你的痛點。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map(({ icon: Icon, title, pain, solution, cta, sample }, i) => (
              <div key={title} className="card flex flex-col" style={{ padding: 24, gap: 14 }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                  <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3 className="font-bold" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>{title}</h3>
                <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>痛點:</span> {pain}
                  </p>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{solution}</p>

                {/* Mini mockup */}
                <MiniPagePreview {...sample} accent={i === 0 ? '#F472B6' : i === 1 ? '#5090FF' : '#10B981'} />

                <Link href="/login" className="btn-primary mt-1" style={{ fontSize: 14, padding: '10px 20px', alignSelf: 'flex-start' }}>
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison vs Linktree ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>COMPARE</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              Beam vs. 其他 Link in Bio 工具
            </h2>
            <p className="max-w-lg mx-auto text-sm" style={{ color: 'var(--color-text-muted)' }}>
              我們把最常被問到的差異攤出來。誠實比較,你自己決定。
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="grid grid-cols-3 px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
              <span>功能</span>
              <span className="text-center" style={{ color: 'var(--color-primary)' }}>Beam</span>
              <span className="text-center">其他工具</span>
            </div>
            {COMPARISON.map(({ feature, us, them }, i) => (
              <div key={feature} className="grid grid-cols-3 px-5 py-3 items-center text-sm" style={{ borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{feature}</span>
                <span className="text-center font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {us === true ? <Check size={18} className="inline" style={{ color: '#10B981' }} /> : us === false ? <X size={18} className="inline" style={{ color: 'var(--color-text-muted)' }} /> : us}
                </span>
                <span className="text-center" style={{ color: 'var(--color-text-muted)' }}>
                  {them === true ? <Check size={18} className="inline" style={{ color: 'var(--color-text-muted)' }} /> : them === false ? <X size={18} className="inline" style={{ color: '#EF4444' }} /> : them}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>TESTIMONIALS</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              創作者的真實回饋
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, quote, gradient }) => (
              <div key={name} className="card flex flex-col gap-4" style={{ padding: 28 }}>
                <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-text-primary)', lineHeight: 1.7 }}>
                  「{quote}」
                </p>
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: gradient }}>
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{name}</p>
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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>PRICING</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              成長到哪,方案跟到哪
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              全方案皆可販售商品,平台抽成隨方案遞減:10% → 5% → 2%。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card" style={{ padding: 28 }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>Free</h3>
              <p className="mb-5" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>新手創作者入門</p>
              <p className="font-extrabold mb-5 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                NT$0 <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ 永久</span>
              </p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['1 個分頁、12 個區塊', '30 天數據分析', '6 種核心區塊類型', '商品販售(10% 抽成)', 'Beam 浮水印'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-ghost w-full justify-center" style={{ padding: '10px 20px', fontSize: 14 }}>免費開始</Link>
            </div>
            {/* Pro */}
            <div className="card" style={{ padding: 28, border: '2px solid var(--color-primary)', position: 'relative', background: 'white' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap" style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                <Sparkles size={11} /> 最受歡迎
              </div>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-primary)' }}>Pro</h3>
              <p className="mb-5" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>個人創作者 / KOL</p>
              <p className="font-extrabold mb-1 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                NT${PLAN_PRICING.pro.monthly} <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ 月</span>
              </p>
              <p className="mb-5 text-xs" style={{ color: 'var(--color-text-muted)' }}>年繳均 NT${PLAN_PRICING.pro.annual} / 月</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['10 個分頁、每頁 20 區塊', '90 天數據分析', '所有 12 種區塊類型', '商品抽成降為 5%', '3 位團隊成員', '移除浮水印'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-primary w-full justify-center" style={{ padding: '10px 20px', fontSize: 14 }}>升級 Pro</Link>
            </div>
            {/* Premium */}
            <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)', border: '2px solid #1A202C', color: 'white' }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: '#F6E05E' }}>Premium</h3>
              <p className="mb-5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>小型品牌 / 工作室</p>
              <p className="font-extrabold mb-1 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'white', fontFamily: 'var(--font-display)' }}>
                NT${PLAN_PRICING.premium.monthly} <span className="font-normal text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>/ 月</span>
              </p>
              <p className="mb-5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>年繳均 NT${PLAN_PRICING.premium.annual} / 月</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['無限分頁與區塊', '無限數據保留', '商品抽成降為 2%', '無限團隊成員', '自訂網域 / favicon / CSS', '優先客服'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#F6E05E' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="w-full inline-flex items-center justify-center rounded-lg font-bold" style={{ background: '#F6E05E', color: '#1A202C', padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}>升級 Premium</Link>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              查看完整功能比較與抽成試算 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { Icon: Layers,      value: '12 種',     label: '區塊類型' },
              { Icon: ShoppingBag, value: '低至 2%',   label: '商品抽成' },
              { Icon: Zap,         value: '< 1s',      label: '頁面載入' },
              { Icon: Heart,       value: '永久免費',  label: '入門方案' },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="text-center rounded-2xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--color-primary-light)' }}>
                  <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="font-extrabold mb-1" style={{ fontSize: 'clamp(22px, 3vw, 28px)', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{value}</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>FAQ</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
              常見問題
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group rounded-xl" style={{ background: '#fff', border: '1px solid var(--color-border)' }}>
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 list-none">
                  <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{q}</span>
                  <ChevronDown size={18} className="group-open:rotate-180 transition-transform flex-shrink-0 ml-3" style={{ color: 'var(--color-text-muted)' }} />
                </summary>
                <div className="px-5 pb-4 text-sm" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2D5E 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative dots */}
        <div aria-hidden className="absolute top-10 left-10 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,144,255,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }} />
        <div aria-hidden className="absolute bottom-10 right-10 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.25) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="max-w-xl mx-auto relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 32px rgba(80,144,255,0.4)' }}>
            <Zap size={32} color="white" />
          </div>
          <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(32px, 5vw, 44px)', color: 'white', fontFamily: 'var(--font-display), var(--font-cjk)' }}>
            30 秒建立你的頁面
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.6 }}>
            輸入你的用戶名,立即搶佔你的專屬網址。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 max-w-md mx-auto">
            <div className="flex items-center rounded-xl overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="pl-4 text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>beam.io/</span>
              <input type="text" placeholder="你的名字" className="flex-1 bg-transparent border-none outline-none py-3.5 pr-4 text-white placeholder:text-white/30" style={{ fontSize: 15 }} />
            </div>
            <Link href="/login" className="btn-primary whitespace-nowrap" style={{ fontSize: 15, padding: '14px 28px', boxShadow: '0 8px 32px rgba(80,144,255,0.4)' }}>
              免費搶佔 <ArrowRight size={16} />
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
            <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>Beam</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/pricing" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>定價</Link>
            <Link href="/about"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>關於我們</Link>
            <Link href="/contact" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>聯絡</Link>
            <Link href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>隱私權</Link>
            <Link href="/terms"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>服務條款</Link>
            <Link href="/login"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>登入</Link>
            <Link href="/en"      className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>EN</Link>
          </nav>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>&copy; 2026 Beam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
