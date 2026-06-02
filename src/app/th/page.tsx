import type { Metadata } from 'next'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
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

// Thai landing page metadata — overrides root layout's English defaults so
// that /th unfurls correctly on Telegram / X / FB with Thai title +
// description. Matches the en page's structure (alternates.languages emits
// hreflang tags so Google recognises the four locale variants as alternates
// rather than duplicate content).
export const metadata: Metadata = {
  title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
  description:
    'ลิงก์เดียวรวมโซเชียล สินค้า และ email list สร้างหน้าครีเอเตอร์ใน 30 วินาที ฟรี ไม่ต้องใช้บัตรเครดิต ทางเลือกของ Linktree สำหรับครีเอเตอร์ที่ใส่ใจดีไซน์',
  keywords: [
    'link in bio',
    'linktree alternative',
    'ลิงก์ในไบโอ',
    'หน้าครีเอเตอร์',
    'bio link',
    'ขายสินค้าดิจิทัล',
    'เก็บอีเมล',
    'creator economy',
  ],
  alternates: {
    canonical: '/th',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
    description:
      'ลิงก์เดียวรวมโซเชียล สินค้า และ email list สร้างใน 30 วินาที ฟรี ไม่ต้องใช้บัตรเครดิต',
    url: '/th',
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beam — link-in-bio ฟรีสำหรับครีเอเตอร์',
    description:
      'ลิงก์เดียวรวมโซเชียล สินค้า และ email list ฟรี ไม่ต้องใช้บัตรเครดิต',
  },
}

/**
 * Thai landing page — sits at `/th`.
 *
 * Mirrors the visually-rich `/en` structure (inline mockups, comparison
 * table, testimonials, FAQ, three pricing tiers) — translated into Thai
 * with locally-appropriate phrasing. Pricing numbers come from
 * `PLAN_PRICING` so all locale pages stay in sync.
 */

const FEATURES = [
  { icon: Layers,    title: 'บล็อกครบทุกแบบที่ต้องใช้', description: 'ลิงก์ แบนเนอร์ วิดีโอ สินค้า ฟอร์ม ปฏิทิน — ลากวางเพื่อสร้างหน้าที่เป็นคุณจริง ๆ' },
  { icon: Palette,   title: 'ปรับธีมให้ตรงแบรนด์',     description: '8 พรีเซ็ตหรือคัสตอมสีได้ทั้งหมด พื้นหลังไล่เฉด สไตล์ปุ่ม แบรนด์ของคุณ pixel-perfect' },
  { icon: BarChart2, title: 'วิเคราะห์เรียลไทม์',       description: 'ติดตามผู้เข้าชม คลิก บล็อกยอดนิยม — ปรับตามข้อมูลจริงที่เวิร์ค' },
  { icon: ShoppingBag, title: 'ขายสินค้าดิจิทัล',       description: 'Stripe ในตัว ขายคอร์ส e-book และเทมเพลตจากหน้าคุณตรง ๆ ไม่ต้องเปิดร้านค้า' },
  { icon: Mail,      title: 'สร้าง email list',         description: 'ฝังฟอร์มเก็บอีเมล เป็นเจ้าของผู้ติดตามของคุณ เลิกเช่าความสนใจจาก algorithm' },
  { icon: FileStack, title: 'หลายหน้า บัญชีเดียว',       description: 'บัญชีเดียว หลายหน้า แบ่งตามหัวข้อ — คอร์ส คอลแลบ ส่วนตัว ด้วย tab ที่ตั้งชื่อได้' },
]

const STEPS = [
  { icon: UserPlus, num: '1', title: 'สร้างบัญชี',     description: 'เลือก username ไม่ต้องใช้บัตรเครดิต เสร็จใน 30 วินาที' },
  { icon: Plus,     num: '2', title: 'เพิ่มบล็อกของคุณ', description: 'ลาก วาง แก้ไข พรีวิวอัปเดตทันทีระหว่างที่สร้าง' },
  { icon: Share2,   num: '3', title: 'แชร์ลิงก์เดียว',  description: 'ใส่ใน IG bio, YouTube, Threads หรือที่ไหนก็ได้ ลิงก์เดียวจบ' },
]

const USE_CASES = [
  {
    icon: Video,
    title: 'ครีเอเตอร์ IG / YouTube',
    pain: 'ลิงก์เดียวใน bio ไม่พอ — แฟนพลาดคอนเทนต์ดี ๆ',
    solution: 'รวมทุกโซเชียล วิดีโอล่าสุด และฟอร์มติดต่อไว้ในลิงก์เดียวที่พอดีกับ bio',
    cta: 'สร้างหน้าครีเอเตอร์',
    sample: { name: 'Mia Chen', handle: '@miachen.cooks', blocks: ['วิดีโอ YouTube ล่าสุด', 'E-book สูตรอาหาร', 'ติดต่อร่วมงาน'] },
  },
  {
    icon: ShoppingBag,
    title: 'ขายคอร์ส / สินค้า',
    pain: 'เว็บไซต์เต็มรูปแบบเกินไป ในเมื่อแค่อยากขาย',
    solution: 'ขายคอร์ส e-book เทมเพลต ด้วย Stripe checkout ในตัว ไม่ต้องสร้างเว็บ ไม่ต้องล็อกกับแพลตฟอร์ม',
    cta: 'เริ่มขาย',
    sample: { name: 'Alex Wong', handle: '@alexcoaches', blocks: ['Notion Templates — $29', 'Coaching Call 60 นาที', 'จดหมายข่าวฟรี'] },
  },
  {
    icon: Headphones,
    title: 'Podcaster',
    pain: 'ผู้ฟังกระจายอยู่ทั้ง Apple, Spotify, YouTube — ไม่มีบ้านที่เดียว',
    solution: 'หน้าเดียวรวมทุกแพลตฟอร์ม podcast ลิงก์สนับสนุน และสมัครรับอีเมล เจอผู้ฟังที่ไหนก็ได้',
    cta: 'สร้างหน้า podcast',
    sample: { name: 'The Drift Show', handle: '@thedriftshow', blocks: ['ฟังบน Spotify', 'ฟังบน Apple Podcasts', 'เลี้ยงกาแฟพวกเรา'] },
  },
]

const BLOCK_TYPES = [
  { icon: ExternalLink, label: 'ปุ่มลิงก์',       color: '#5090FF' },
  { icon: ImageIcon,    label: 'แบนเนอร์',       color: '#F472B6' },
  { icon: Type,         label: 'หัวข้อ',          color: '#A78BFA' },
  { icon: Video,        label: 'ฝังวิดีโอ',       color: '#EF4444' },
  { icon: ShoppingBag,  label: 'สินค้า',          color: '#10B981' },
  { icon: Mail,         label: 'ฟอร์มอีเมล',     color: '#F59E0B' },
  { icon: Timer,        label: 'นับถอยหลัง',     color: '#8B5CF6' },
  { icon: HelpCircle,   label: 'FAQ',            color: '#06B6D4' },
  { icon: ImagesIcon,   label: 'คาร์รูเซล',       color: '#EC4899' },
  { icon: MapPin,       label: 'ฝังแผนที่',       color: '#14B8A6' },
  { icon: Code,         label: 'ฝัง HTML',        color: '#64748B' },
  { icon: CalendarPlus, label: 'เพิ่มในปฏิทิน',   color: '#3B82F6', isNew: true },
]

const TESTIMONIALS = [
  { name: 'Sarah K.',    role: 'ครีเอเตอร์ความสวยงาม ผู้ติดตาม 280K', quote: 'ย้ายจาก Linktree ใน 30 วินาทีจริง ๆ บล็อกเพิ่มในปฏิทินทำให้คนเข้าดู livestream เพิ่มประมาณ 22%', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)' },
  { name: 'Marcus L.',   role: 'ครีเอเตอร์คอร์สออนไลน์',              quote: 'ตอนนี้ทำเงินจากหน้าเพจได้มากกว่าตอนใช้ Shopify ค่าธรรมเนียม 5% บน Pro คุ้มแค่เรื่อง conversion ที่ดีขึ้น', gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' },
  { name: 'The Bao Pod', role: 'Podcast ผู้ฟัง 45K',                    quote: 'หน้าเดียว ทุกแพลตฟอร์ม podcast พร้อมฟอร์ม newsletter ทิปสนับสนุนเพิ่มในสัปดาห์ที่เราย้ายมา', gradient: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' },
]

const FAQS = [
  { q: 'มีแพ็กเกจฟรีจริง ๆ ไหม?', a: 'ใช่ — ฟรีตลอด 1 หน้า 12 บล็อก 6 ประเภทบล็อกหลัก และขายสินค้าได้ด้วยค่าธรรมเนียม 10% ไม่ต้องใช้บัตรเครดิต' },
  { q: 'นำเข้าจาก Linktree เดิมได้ไหม?', a: 'ได้ วาง URL linktr.ee หรือ portaly.cc แล้วเราจะดึงลิงก์ ไอคอนโซเชียล ชื่อโปรไฟล์ bio และรูปอวตารมาให้ทั้งหมดในประมาณ 30 วินาที' },
  { q: 'ราคาเทียบกับ Linktree อย่างไร?', a: 'แพ็กเกจ Pro ของเราเริ่มที่ NT$' + PLAN_PRICING.pro.monthly + '/เดือน เทียบเท่ากับ Linktree Starter — แต่ได้ขายสินค้าด้วย (ค่าธรรมเนียม 5%) สมาชิกทีม และบล็อกเพิ่มในปฏิทิน' },
  { q: 'ขายสินค้าดิจิทัลได้ไหม?', a: 'ได้ทุกแพ็กเกจ Free ขายได้ด้วยค่าธรรมเนียม 10% Pro ลดเหลือ 5% Premium 2% Stripe จัดการ checkout เงินเข้าบัญชีคุณตรง ๆ' },
  { q: 'ต้องเขียนโค้ดเป็นไหม?', a: 'ไม่ต้อง ทุกอย่างลากวางพร้อมพรีวิวสด ถ้าอยากใส่ CSS หรือ iframe เอง บล็อก HTML Embed ใน Premium รองรับ' },
  { q: 'ใช้โดเมนของตัวเองได้ไหม?', a: 'แพ็กเกจ Pro ได้ URL สวย ๆ beam.io/yourname ส่วน Premium รองรับโดเมนเอง — ชี้โดเมนของคุณมาที่ portal ได้เลย' },
]

const COMPARISON = [
  { feature: 'แพ็กเกจฟรี',                us: 'ตลอดไป',         them: 'จำกัด' },
  { feature: 'Builder แบบลากวาง',          us: true,             them: true },
  { feature: 'ขายสินค้าดิจิทัล',           us: 'ทุกแพ็กเกจ',       them: 'แพ็กเกจเสียเงินเท่านั้น' },
  { feature: 'เก็บ email list',            us: 'ทุกแพ็กเกจ',       them: 'แพ็กเกจเสียเงินเท่านั้น' },
  { feature: 'บล็อกเพิ่มในปฏิทิน',         us: true,             them: false },
  { feature: 'นำเข้าจาก Linktree / Portaly', us: true,            them: false },
  { feature: 'หลายหน้า (tab)',             us: 'สูงสุดไม่จำกัด',  them: 'ไม่มี' },
  { feature: 'สมาชิกทีม',                  us: 'สูงสุดไม่จำกัด',  them: 'จำกัด' },
  { feature: 'โดเมนเอง',                   us: 'Premium',         them: 'เฉพาะ tier บนสุด' },
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

export default function LandingPageTh() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-primary)' }}>

      {/* ─── Navbar ─── */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }} className="sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/th" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-blue)' }}>
              <Link2 size={16} color="white" />
            </div>
            <span className="font-bold text-base sm:text-lg whitespace-nowrap" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Beam</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <Link href="/pricing" style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">ราคา</Link>
            <Link href="/login"   style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">เข้าสู่ระบบ</Link>
            <LanguageSwitcher />
            <Link href="/login" className="btn-primary whitespace-nowrap flex-shrink-0" style={{ padding: '9px 16px', fontSize: 13 }}>เริ่มฟรี</Link>
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
              ใหม่: นำเข้าจาก Linktree &amp; เพิ่มในปฏิทิน
            </div>
            <h1 className="font-extrabold mb-5 leading-tight animate-fade-in-up"
              style={{ fontSize: 'clamp(32px, 6vw, 64px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
              ลิงก์เดียว<br />
              <span className="text-gradient">เชื่อมทุก touchpoint กับแฟน</span>
            </h1>
            <p className="mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'var(--color-text-secondary)', lineHeight: 1.7, animationDelay: '0.2s' }}>
              รวม Instagram, YouTube, podcast, สินค้าดิจิทัล และ email list มาไว้ในหน้าเดียว เปลี่ยน attention เป็นรายได้
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
                สร้าง portal ของคุณ <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
                <Play size={16} /> ดูเดโม
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 justify-center lg:justify-start text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {['ฟรีตลอด', 'ไม่ต้องใช้บัตรเครดิต', 'สมัครใน 30 วินาที', 'ยกเลิกได้ทุกเมื่อ'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check size={12} style={{ color: '#10B981' }} />{t}</span>
              ))}
            </div>
          </div>

          {/* Right: phone + floating cards */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="phone-frame animate-float" style={{ width: '100%', maxWidth: 280 }}>
              <div className="phone-frame-inner" style={{ height: 540 }}>
                <iframe src="/demo" title="Beam Demo" loading="eager" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Floating analytics card */}
            <div className="hidden md:block absolute -left-6 lg:-left-12 top-12 rounded-2xl p-3" style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', width: 180 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
                  <TrendingUp size={14} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-text-muted)' }}>สัปดาห์นี้</p>
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
                <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-text-muted)' }}>ขายใหม่</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Notion Bundle</p>
                <p className="text-xs" style={{ color: '#16A34A', fontWeight: 600 }}>+ $29 USD</p>
              </div>
            </div>

            {/* Floating notification card */}
            <div className="hidden lg:flex absolute right-12 -top-2 rounded-2xl p-3 items-center gap-2" style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                <Heart size={13} style={{ color: '#EF4444', fill: '#EF4444' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>247 คลิกใหม่วันนี้</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logo cloud (creator handles as social proof) ─── */}
      <section style={{ padding: '40px 24px', background: '#fff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>
            สร้างขึ้นเพื่อแพลตฟอร์มที่ครีเอเตอร์ใช้จริง
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>เพิ่งเปิดตัว</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              ย้ายจาก Linktree ใน 30 วินาที
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              วาง URL เดิม เราดึงทุกลิงก์ ไอคอนโซเชียล และข้อมูลโปรไฟล์มาให้ คุณยืนยัน เสร็จ
            </p>
          </div>

          {/* Visual flow: URL → arrow → result */}
          <div className="grid md:grid-cols-[1.2fr_auto_1fr] gap-6 items-center max-w-5xl mx-auto">
            {/* Step 1: paste URL */}
            <div className="card" style={{ padding: 24 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>1</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>วาง URL เดิม</span>
              </div>
              <div className="rounded-lg flex items-center gap-2 px-3 py-2.5 mb-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Link2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-mono truncate" style={{ color: 'var(--color-text-primary)' }}>linktr.ee/yourname</span>
              </div>
              <button className="text-xs font-bold w-full rounded-lg py-2" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                ดูตัวอย่างเนื้อหา →
              </button>
            </div>

            {/* Arrow */}
            <div className="flex md:flex-col items-center justify-center gap-2">
              <ArrowRight size={32} className="hidden md:block" style={{ color: 'var(--color-primary)' }} />
              <ArrowRight size={24} className="md:hidden" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>~30 วินาที</span>
            </div>

            {/* Step 2: result */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#DCFCE7', borderBottom: '1px solid #86EFAC' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#15803D' }}>✓ นำเข้าแล้ว</span>
                <span className="text-xs" style={{ color: '#15803D' }}>9 บล็อก · 4 โซเชียล</span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { Icon: PlayCircle, label: 'ช่อง YouTube ของฉัน' },
                  { Icon: ShoppingBag, label: 'ช็อปเทมเพลตของฉัน' },
                  { Icon: Mail,      label: 'สมัครรับ Newsletter' },
                  { Icon: ExternalLink, label: 'คอลแลบล่าสุด' },
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
                ใหม่ · Pro+
              </div>
              <h3 className="font-bold mb-3" style={{ fontSize: 28, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                บล็อกเพิ่มในปฏิทิน
              </h3>
              <p className="mb-5" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                เพิ่ม Google Calendar คลิกเดียวสำหรับ pop-up, livestream, และเปิดตัวสินค้า รองรับ timezone ครบ + ดาวน์โหลด .ics สำหรับ Apple Calendar &amp; Outlook
              </p>
              <ul className="space-y-2">
                {['ตรวจจับ timezone ของแฟนอัตโนมัติ', 'Google Calendar + ดาวน์โหลด .ics', 'เหมาะกับ livestream &amp; เปิดตัวสินค้า'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <Check size={14} style={{ color: 'var(--color-primary)' }} /> <span dangerouslySetInnerHTML={{ __html: t }} />
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock calendar event card */}
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0" style={{ background: 'var(--gradient-blue)' }}>
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">พ.ค.</span>
                  <span className="text-base font-extrabold leading-none">17</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Live Q&amp;A: สร้างแบรนด์ส่วนตัว</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>เสาร์ 17 พ.ค. · 20:00 น. (GMT+7)</p>
                  <p className="text-xs mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={11} /> ออนไลน์ · YouTube Live
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                  <CalendarPlus size={13} /> Google Calendar
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>ประเภทบล็อก</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              12 วิธีสร้างหน้า
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              ผสมและจับคู่ ลากเรียงลำดับใหม่ ซ่อนได้ทันที หน้าของคุณยืดหยุ่นเท่ากับคุณเอง
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BLOCK_TYPES.map(({ icon: Icon, label, color, isNew }) => (
              <div key={label} className="relative rounded-xl flex flex-col items-center justify-center text-center transition-all hover:scale-105"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '20px 12px' }}>
                {isNew && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#F59E0B', color: '#fff' }}>ใหม่</span>
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>ฟีเจอร์</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              ทุกอย่างที่ครีเอเตอร์ต้องการ
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              ไม่ใช่แค่หน้า link — แต่เป็นบ้านของแบรนด์ส่วนตัวของคุณ
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>เดโมสด</span>
            <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              ดูการทำงานจริง
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: 16, maxWidth: 440 }}>
              นี่คือสิ่งที่หน้าของคุณจะเป็นบนมือถือเป๊ะ ๆ จัดเรียงบล็อกใหม่ พรีวิวสด แล้วส่งหน้าที่ดูดีจริง ๆ
            </p>
            <div className="flex flex-col gap-4 mb-8" style={{ maxWidth: 400 }}>
              {[
                'จัดเรียงด้วยลากวาง',
                'สีคัสตอมและพื้นหลังไล่เฉด',
                'สวยเป๊ะทั้งมือถือและคอมพิวเตอร์',
                'โหลดภายใน 1 วินาที',
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
              ดูเดโมเต็ม <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-shrink-0">
            <div className="animate-float phone-frame" style={{ width: 300 }}>
              <div className="phone-frame-inner">
                <iframe src="/demo" title="Beam Demo Preview" loading="lazy" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--color-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>วิธีใช้งาน</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              3 ขั้นตอน คุณก็ขึ้นแล้ว
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>กรณีใช้งาน</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              ครีเอเตอร์ต่างกัน วิธีแก้เดียวกัน
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              ไม่ว่าคุณเป็นครีเอเตอร์แบบไหน Beam เจอคุณตรงจุดที่คุณอยู่
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
                    <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>ปัญหา:</span> {pain}
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>เปรียบเทียบ</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Beam vs ทางเลือกอื่น
            </h2>
            <p className="max-w-lg mx-auto text-sm" style={{ color: 'var(--color-text-muted)' }}>
              เปรียบเทียบตรง ๆ แฟนส่วนใหญ่อาจไม่สนใจทุกฟีเจอร์ — แต่ข้อด้านล่างคือสิ่งที่เราได้ยินบ่อยที่สุด
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="grid grid-cols-3 px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
              <span>ฟีเจอร์</span>
              <span className="text-center" style={{ color: 'var(--color-primary)' }}>Beam</span>
              <span className="text-center">ทางเลือกอื่น</span>
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>รีวิว</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              ครีเอเตอร์รัก Beam
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, quote, gradient }) => (
              <div key={name} className="card flex flex-col gap-4" style={{ padding: 28 }}>
                <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--color-text-primary)', lineHeight: 1.7 }}>
                  &ldquo;{quote}&rdquo;
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>ราคา</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              แพ็กเกจที่เติบโตไปกับคุณ
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              ทุกแพ็กเกจขายสินค้าได้ ค่าธรรมเนียมลดเมื่ออัปเกรด: 10% → 5% → 2%
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card" style={{ padding: 28 }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>Free</h3>
              <p className="mb-5" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>สำหรับครีเอเตอร์ที่เพิ่งเริ่ม</p>
              <p className="font-extrabold mb-5 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                NT$0 <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ ตลอดไป</span>
              </p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['1 หน้า 12 บล็อก', 'วิเคราะห์ 30 วัน', 'บล็อกหลัก 6 ประเภท', 'ขายสินค้า (ค่าธรรมเนียม 10%)', 'มี watermark Beam'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-ghost w-full justify-center" style={{ padding: '10px 20px', fontSize: 14 }}>เริ่มฟรี</Link>
            </div>
            {/* Pro */}
            <div className="card" style={{ padding: 28, border: '2px solid var(--color-primary)', position: 'relative', background: 'white' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap" style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                <Sparkles size={11} /> ยอดนิยม
              </div>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-primary)' }}>Pro</h3>
              <p className="mb-5" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>สำหรับครีเอเตอร์เดี่ยว &amp; KOL</p>
              <p className="font-extrabold mb-1 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                NT${PLAN_PRICING.pro.monthly} <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ เดือน</span>
              </p>
              <p className="mb-5 text-xs" style={{ color: 'var(--color-text-muted)' }}>NT${PLAN_PRICING.pro.annual}/เดือน รายปี</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['10 หน้า 20 บล็อก/หน้า', 'วิเคราะห์ 90 วัน', 'บล็อกครบ 12 ประเภท', 'ค่าธรรมเนียม 5% ต่อการขาย', 'สมาชิกทีม 3 คน', 'ลบ watermark'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-primary w-full justify-center" style={{ padding: '10px 20px', fontSize: 14 }}>อัปเกรดเป็น Pro</Link>
            </div>
            {/* Premium */}
            <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)', border: '2px solid #1A202C', color: 'white' }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: '#F6E05E' }}>Premium</h3>
              <p className="mb-5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>สำหรับแบรนด์ &amp; สตูดิโอ</p>
              <p className="font-extrabold mb-1 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'white', fontFamily: 'var(--font-display)' }}>
                NT${PLAN_PRICING.premium.monthly} <span className="font-normal text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>/ เดือน</span>
              </p>
              <p className="mb-5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>NT${PLAN_PRICING.premium.annual}/เดือน รายปี</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['หน้า &amp; บล็อกไม่จำกัด', 'เก็บข้อมูลวิเคราะห์ไม่จำกัด', 'ค่าธรรมเนียม 2% ต่อการขาย', 'สมาชิกทีมไม่จำกัด', 'โดเมน / favicon / CSS เอง', 'ซัพพอร์ตเร่งด่วน'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#F6E05E' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }} dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
              <Link href="/login" className="w-full inline-flex items-center justify-center rounded-lg font-bold" style={{ background: '#F6E05E', color: '#1A202C', padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}>อัปเกรดเป็น Premium</Link>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              เปรียบเทียบฟีเจอร์เต็ม &amp; เครื่องคำนวณค่าธรรมเนียม <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { Icon: Layers,            value: '12',          label: 'ประเภทบล็อก' },
              { Icon: ShoppingBag,       value: 'จาก 2%',      label: 'ค่าธรรมเนียม' },
              { Icon: Zap,               value: '< 1 วินาที',  label: 'เวลาโหลดหน้า' },
              { Icon: Heart,             value: 'ฟรีตลอด',     label: 'แพ็กเกจเริ่มต้น' },
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
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              คำถามที่พบบ่อย
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
          <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(32px, 5vw, 44px)', color: 'white', fontFamily: 'var(--font-display)' }}>
            หน้าของคุณใน 30 วินาที
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.6 }}>
            จอง username และ URL ของคุณวันนี้
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 max-w-md mx-auto">
            <div className="flex items-center rounded-xl overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="pl-4 text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>beam.io/</span>
              <input type="text" placeholder="yourname" className="flex-1 bg-transparent border-none outline-none py-3.5 pr-4 text-white placeholder:text-white/30" style={{ fontSize: 15 }} />
            </div>
            <Link href="/login" className="btn-primary whitespace-nowrap" style={{ fontSize: 15, padding: '14px 28px', boxShadow: '0 8px 32px rgba(80,144,255,0.4)' }}>
              จองเลย <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['ฟรีตลอด', 'ไม่ต้องใช้บัตรเครดิต', 'สมัครใน 30 วินาที'].map(text => (
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
            <Link href="/pricing" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>ราคา</Link>
            <Link href="/about"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>เกี่ยวกับ</Link>
            <Link href="/contact" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>ติดต่อ</Link>
            <Link href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>ความเป็นส่วนตัว</Link>
            <Link href="/terms"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>ข้อกำหนด</Link>
            <Link href="/login"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>เข้าสู่ระบบ</Link>
            <Link href="/en"      className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>English</Link>
          </nav>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>&copy; 2026 Beam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
