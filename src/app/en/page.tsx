import type { Metadata } from 'next'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import {
  Link2, BarChart2, ShoppingBag, Mail, ArrowRight, Check, X, Plus,
  Video, CalendarPlus, DownloadCloud,
  Camera, PlayCircle, Globe, ExternalLink,
  Image as ImageIcon, Type, Timer, HelpCircle,
  Images as ImagesIcon, MapPin, Code, FileStack, Palette, Layers,
} from 'lucide-react'
import { PLAN_PRICING } from '@/lib/plan'
import { SITE_HOST, OG_IMAGE } from '@/lib/site'

// Override the Chinese metadata inherited from the root layout. Without
// this, sharing /en on Telegram / X / FB unfurls with the Chinese title
// and description (`Beam — 免費 Link in Bio 工具…`), confusing English
// audiences. Only locale-aware fields are overridden — metadataBase /
// robots / manifest / formatDetection still inherit from the root.
//
// alternates.languages emits hreflang tags so Google recognises the two
// language versions of the marketing page as alternates rather than
// duplicate content.
export const metadata: Metadata = {
  title: 'Beam — Free link-in-bio for creators',
  description:
    'The link-in-bio for creators and KOLs who want to earn from their following — sell your own products, pitch brands with real numbers, and own your email list. Free, no credit card.',
  keywords: [
    'link in bio',
    'linktree alternative',
    'creator link page',
    'bio link tool',
    'social media link page',
    'sell digital products',
    'email capture',
    'creator economy',
  ],
  alternates: {
    canonical: '/en',
    languages: {
      en: '/en',
      ja: '/ja',
      th: '/th',
      'zh-TW': '/zh-TW',
    },
  },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Beam — Free link-in-bio for creators',
    description:
      'The link-in-bio for creators who want to earn from their following. Sell products, land brand deals, own your list — free.',
    url: '/en',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    images: [OG_IMAGE],
    card: 'summary_large_image',
    title: 'Beam — Free link-in-bio for creators',
    description:
      'The link-in-bio for creators who want to earn from their following. Free, no credit card.',
  },
}

/**
 * English landing page — sits at `/en`.
 *
 * v2 layout (2026-10): fewer, non-overlapping sections — hero → three ways to
 * earn (bento, folds in block types / pages / themes) → switch from Linktree
 * (import + calendar) → how it works → who it's for → compare → testimonials →
 * pricing → FAQ → claim CTA. Visual system lives in globals.css under `.lp`.
 *
 * Pricing numbers come from `PLAN_PRICING` so all locales stay in sync.
 */

const STEPS = [
  { title: 'Claim your username', description: 'Pick beam.io/yourname. No credit card, about 30 seconds.' },
  { title: 'Add your blocks',     description: 'Links, products, email forms, videos — drag to reorder, preview updates live.' },
  { title: 'Share one link',      description: 'Put it in your IG, YouTube, TikTok or Threads bio. Clicks, sales and signups land in one place.' },
]

// Personas follow the three earning modes from onboarding ("How do you want
// to earn?"): affiliate + brand deals, own courses/products, digital goods.
const USE_CASES = [
  {
    icon: Camera,
    title: 'Lifestyle & beauty creators',
    pain: 'Brands ask for numbers, and your bio only holds one link.',
    solution: 'Affiliate picks, a brand-collab page with its own stats, and your latest posts — behind one link.',
    sample: { name: 'Mia Chen', handle: '@miachen.style', blocks: ['My skincare picks', 'Work with me', 'Latest TikTok'] },
  },
  {
    icon: Video,
    title: 'Educators & coaches',
    pain: 'A full website is overkill when you just want to sell.',
    solution: 'Courses, templates and coaching calls with Stripe checkout. No site build, no lock-in.',
    sample: { name: 'Alex Wong', handle: '@alexcoaches', blocks: ['Notion Templates Bundle — $29', 'Coaching Call (60 min)', 'Free Newsletter'] },
  },
  {
    icon: Palette,
    title: 'Artists & illustrators',
    pain: 'Fans want your brushes and prints, but a whole shop is too much.',
    solution: 'Sell digital downloads in one tap and turn stream viewers into subscribers.',
    sample: { name: 'Rae Lin', handle: '@rae.draws', blocks: ['Procreate brush pack — $12', 'Live drawing stream · Fri', 'Join my newsletter'] },
  },
]

const BLOCK_TYPES = [
  { icon: ExternalLink, label: 'Link button' },
  { icon: ImageIcon,    label: 'Banner' },
  { icon: Type,         label: 'Heading' },
  { icon: Video,        label: 'Video embed' },
  { icon: ShoppingBag,  label: 'Product' },
  { icon: Mail,         label: 'Email form' },
  { icon: Timer,        label: 'Countdown' },
  { icon: HelpCircle,   label: 'FAQ' },
  { icon: ImagesIcon,   label: 'Carousel' },
  { icon: MapPin,       label: 'Map embed' },
  { icon: Code,         label: 'HTML embed' },
  { icon: CalendarPlus, label: 'Add to calendar' },
]

// TODO(Jin): confirm these are real customer quotes before launch — flip to
// false to hide the section without touching the layout.
const SHOW_TESTIMONIALS = false
const TESTIMONIALS = [
  { name: 'Sarah K.',    role: 'Beauty creator, 280K followers', quote: 'Migrated from Linktree in literally 30 seconds. The Add-to-Calendar block alone has bumped my livestream attendance ~22%.' },
  { name: 'Marcus L.',   role: 'Online course creator',          quote: 'I make more from the page now than I did with my old Shopify store. 5% fee on Pro is worth it just for the conversion lift.' },
  { name: 'The Bao Pod', role: 'Podcast, 45K listeners',         quote: 'One page, every podcast platform, plus our newsletter form. Support tips went up the week we switched.' },
]

const FAQS = [
  { q: 'Is there really a free plan?', a: 'Yes — free forever. 1 page, 12 blocks, 8 core block types including product sales and email capture, with a 10% platform fee on sales. No credit card required.' },
  { q: 'Can I import my existing Linktree?', a: 'Yes. Paste your linktr.ee, portaly.cc, or openlink.co URL, we pull over your links, social icons, profile name, bio, and avatar. The whole thing takes about 30 seconds.' },
  { q: 'How do you compare to Linktree on price?', a: 'Our Pro plan starts at NT$' + PLAN_PRICING.pro.monthly + '/mo, which is comparable to Linktree Starter — but you also get product sales (5% platform fee), team members, and the Add-to-Calendar block.' },
  { q: 'Can I sell digital products?', a: 'On every plan. Free pages can sell with a 10% platform fee. Pro drops it to 5%, Premium to 2%. Stripe handles checkout — payouts go straight to your account.' },
  { q: 'Do I need to know any code?', a: 'No. Everything is drag-and-drop with live preview. If you do want custom CSS or iframes, the HTML Embed block on Premium has you covered.' },
  { q: 'Can I use my own domain?', a: `Pro plans get a clean ${SITE_HOST}/yourname URL. Premium adds custom domain support — point your own domain at your portal.` },
]

const COMPARISON: { feature: string; us: string | boolean; them: string | boolean }[] = [
  { feature: 'Free plan',                 us: 'Forever',           them: 'Limited' },
  { feature: 'Drag-and-drop builder',     us: true,                them: true },
  { feature: 'Sell digital products',     us: 'All plans',         them: 'Paid only' },
  { feature: 'Email list capture',        us: 'All plans',         them: 'Paid only' },
  { feature: 'Add-to-Calendar block',     us: true,                them: false },
  { feature: 'Linktree / Portaly / OpenLink import', us: true,     them: false },
  { feature: 'Multi-page (tabs)',         us: 'Up to unlimited',   them: 'No' },
  { feature: 'Team members',              us: 'Up to unlimited',   them: 'Limited' },
  { feature: 'Custom domain',             us: 'Premium',           them: 'Top tier only' },
]

const PLANS = [
  {
    name: 'Free', tagline: 'For creators starting to earn', price: 'NT$0', per: '/ forever', annual: null as string | null,
    fee: '10% fee on sales',
    items: ['1 page, 12 blocks', '8 core block types', 'Sell products & capture emails', '30-day analytics', 'Beam branding'],
    cta: 'Start free', featured: false, dark: false,
  },
  {
    name: 'Pro', tagline: 'For creators & KOLs earning monthly', price: `NT$${PLAN_PRICING.pro.monthly}`, per: '/ mo', annual: `NT$${PLAN_PRICING.pro.annual}/mo billed annually`,
    fee: '5% fee on sales',
    items: ['10 pages, 20 blocks each', 'All 12 block types', '90-day analytics', '3 team members', 'Remove branding'],
    cta: 'Upgrade to Pro', featured: true, dark: false,
  },
  {
    name: 'Premium', tagline: 'For creators with a team or manager', price: `NT$${PLAN_PRICING.premium.monthly}`, per: '/ mo', annual: `NT$${PLAN_PRICING.premium.annual}/mo billed annually`,
    fee: '2% fee on sales',
    items: ['Unlimited pages & blocks', 'Unlimited analytics retention', 'Unlimited team members', 'Custom domain / favicon / CSS', 'Priority support'],
    cta: 'Upgrade to Premium', featured: false, dark: true,
  },
]

/* ── Claim-your-username form: GETs /login?username=… which prefills it ── */
function ClaimForm({ dark = false, cta = 'Claim my page' }: { dark?: boolean; cta?: string }) {
  return (
    <form action="/login" method="get" className={`lp-claim ${dark ? 'lp-claim-dark' : ''}`}>
      <span className="lp-claim-host">{SITE_HOST}/</span>
      <input name="username" type="text" placeholder="yourname" aria-label="Choose your username" autoComplete="off" spellCheck={false} />
      <button type="submit" className="lp-btn lp-btn-accent" style={{ padding: '11px 20px' }}>
        <span className="hidden sm:inline">{cta}</span><span className="sm:hidden">Claim</span> <ArrowRight size={16} />
      </button>
    </form>
  )
}

/* ── Tiny inline mockup of a Beam page ── */
function MiniPagePreview({ name, handle, blocks }: { name: string; handle: string; blocks: string[] }) {
  return (
    <div className="lp-mock">
      <div className="flex flex-col items-center pt-2 pb-1">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold mb-2" style={{ background: 'var(--lp-ink)' }}>
          {name.charAt(0)}
        </div>
        <p className="font-semibold text-[13px]">{name}</p>
        <p className="text-[11px] mb-3" style={{ color: 'var(--lp-muted)' }}>{handle}</p>
        <div className="flex flex-col gap-1.5 w-full">
          {blocks.map(b => (
            <div key={b} className="lp-row justify-center text-[12px]" style={{ padding: '8px 10px' }}>
              <span className="truncate">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Check14() {
  return <Check size={15} strokeWidth={2.5} style={{ color: 'var(--lp-accent)', flexShrink: 0 }} />
}

export default function LandingPageEn() {
  return (
    <div className="lp min-h-screen">

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'saturate(180%) blur(14px)', borderBottom: '1px solid var(--lp-line)' }}>
        <div className="lp-wrap px-5 h-16 flex items-center justify-between gap-3">
          <Link href="/en" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--lp-ink)' }}>
              <Link2 size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="lp-display text-[20px]">Beam</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="#features" className="hidden md:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>Features</Link>
            <Link href="#pricing"  className="hidden md:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>Pricing</Link>
            <Link href="/demo"     className="hidden md:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>Demo</Link>
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>Log in</Link>
            <Link href="/login" className="lp-btn lp-btn-primary" style={{ padding: '9px 16px', fontSize: 14 }}>Start free</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(56px, 8vw, 104px) 20px clamp(64px, 8vw, 112px)' }}>
        <div aria-hidden className="lp-hero-bg absolute inset-0" />
        <div className="lp-wrap relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-14 lg:gap-10 items-center">
          <div className="min-w-0">
            <Link href="#switch" className="lp-chip mb-7 hover:border-[#CBD1DC] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lp-accent)' }} />
              Switching from Linktree? Import in 30 seconds
              <ArrowRight size={13} />
            </Link>
            <h1 className="lp-display lp-h1 mb-6">
              Turn your audience<br />
              <span className="lp-accent">into income.</span>
            </h1>
            <p className="lp-lead mb-9 max-w-[520px]">
              Beam is the link-in-bio for creators and KOLs who want to earn from their following — sell your own products, pitch brands with real numbers, and own your email list.
            </p>
            <ClaimForm />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[13px]" style={{ color: 'var(--lp-muted)' }}>
              {['Free forever', 'No credit card', 'Live in 30 seconds'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check size={13} strokeWidth={2.5} style={{ color: 'var(--lp-ok)' }} />{t}</span>
              ))}
              <Link href="#video" className="lp-link text-[13px]" style={{ fontSize: 13 }}>Watch the 45s video <ArrowRight size={13} /></Link>
            </div>
          </div>

          {/* Phone + two floating proof-of-feature cards */}
          <div className="relative flex justify-center">
            <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,144,255,0.22) 0%, transparent 65%)', filter: 'blur(20px)' }} />
            <div className="phone-frame relative" style={{ width: '100%', maxWidth: 290 }}>
              <div className="phone-frame-inner" style={{ height: 560 }}>
                <iframe src="/demo" title="Beam demo page" loading="eager" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
              </div>
            </div>
            <div className="lp-float hidden md:flex" style={{ left: 'max(-8px, calc(50% - 280px))', top: 96 }}>
              <div className="lp-icon" style={{ background: '#DCFCE7', color: 'var(--lp-ok)' }}><ShoppingBag size={17} /></div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--lp-muted)' }}>New sale</p>
                <p className="text-[14px] font-semibold">Notion Bundle <span style={{ color: 'var(--lp-ok)' }}>+$29</span></p>
              </div>
            </div>
            <div className="lp-float hidden md:flex" style={{ right: 'max(-8px, calc(50% - 290px))', bottom: 110 }}>
              <div className="lp-icon"><Mail size={17} /></div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--lp-muted)' }}>New subscriber</p>
                <p className="text-[14px] font-semibold">Joined your list</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platforms strip ─── */}
      <section style={{ padding: '28px 20px', borderTop: '1px solid var(--lp-line)', borderBottom: '1px solid var(--lp-line)' }}>
        <div className="lp-wrap flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-[13px] font-medium" style={{ color: 'var(--lp-muted)' }}>Built for creators on</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              { Icon: Camera,     label: 'Instagram' },
              { Icon: PlayCircle, label: 'YouTube' },
              { Icon: Video,      label: 'TikTok' },
              { Icon: Globe,      label: 'Threads' },
            ].map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 text-[14px] font-semibold" style={{ color: 'var(--lp-ink-2)', opacity: 0.75 }}>
                <Icon size={17} /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Launch video (16:9 desktop / 9:16 phone; preload="none" so only the one played downloads) ─── */}
      <section id="video" className="lp-section" style={{ paddingBottom: 0 }}>
        <div className="lp-wrap">
          <div className="text-center max-w-[620px] mx-auto mb-10">
            <p className="lp-eyebrow">Watch</p>
            <h2 className="lp-h2">Beam in 45 seconds.</h2>
          </div>
          <div className="lp-card lp-shadow overflow-hidden mx-auto hidden md:block" style={{ maxWidth: 1040, padding: 0 }}>
            <video controls playsInline preload="none" poster="/video/beam-launch-16x9.jpg" className="block w-full h-auto" style={{ aspectRatio: '16 / 9' }}>
              <source src="/video/beam-launch-16x9.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="lp-card lp-shadow overflow-hidden mx-auto md:hidden" style={{ maxWidth: 360, padding: 0 }}>
            <video controls playsInline preload="none" poster="/video/beam-launch-9x16.jpg" className="block w-full h-auto" style={{ aspectRatio: '9 / 16' }}>
              <source src="/video/beam-launch-9x16.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* ─── Three ways to earn (bento) ─── */}
      <section id="features" className="lp-section">
        <div className="lp-wrap">
          <div className="max-w-[640px] mb-14">
            <p className="lp-eyebrow">Features</p>
            <h2 className="lp-h2 mb-5">Three ways your following pays you back.</h2>
            <p className="lp-lead">Sell what you make, land brand deals, and own the relationship — on one page you control.</p>
          </div>

          <div className="lp-bento">
            {/* Sell */}
            <div className="lp-card lp-card-pad lp-span-3 flex flex-col">
              <div className="lp-icon mb-5"><ShoppingBag size={18} /></div>
              <h3 className="lp-h3 mb-2">Sell your own products</h3>
              <p className="lp-body mb-7">Courses, e-books, templates, coaching calls. Stripe checkout is built in on every plan — payouts go straight to you.</p>
              <div className="lp-mock mt-auto">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#fff', border: '1px solid var(--lp-line)' }}>
                  <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #DCE8FF, #F3F6FC)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold truncate">Notion Templates Bundle</p>
                    <p className="text-[13px]" style={{ color: 'var(--lp-muted)' }}>Instant download</p>
                  </div>
                  <span className="lp-btn lp-btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>$29 · Buy</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 text-[12px]" style={{ color: 'var(--lp-muted)' }}>
                  Platform fee
                  {['10% Free', '5% Pro', '2% Premium'].map(f => <span key={f} className="lp-chip" style={{ padding: '3px 9px', fontSize: 12 }}>{f}</span>)}
                </div>
              </div>
            </div>

            {/* Own audience */}
            <div className="lp-card lp-card-pad lp-span-3 flex flex-col">
              <div className="lp-icon mb-5"><Mail size={18} /></div>
              <h3 className="lp-h3 mb-2">Own your audience</h3>
              <p className="lp-body mb-7">Email capture on every plan. Stop renting attention from the algorithm — the subscriber list is yours to keep and export.</p>
              <div className="lp-mock mt-auto">
                <div className="flex gap-2">
                  <div className="lp-row flex-1" style={{ color: 'var(--lp-muted)' }}>you@email.com</div>
                  <span className="lp-btn lp-btn-accent" style={{ padding: '8px 16px', fontSize: 13, boxShadow: 'none' }}>Subscribe</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-3">
                  {['jamie@…', 'priya@…'].map((e, i) => (
                    <div key={e} className="flex items-center justify-between text-[12px] px-1" style={{ color: 'var(--lp-ink-2)' }}>
                      <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lp-ok)' }} />{e} joined</span>
                      <span style={{ color: 'var(--lp-muted)' }}>{i === 0 ? 'just now' : '2m ago'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="lp-card lp-card-pad lp-span-2 flex flex-col">
              <div className="lp-icon mb-5"><BarChart2 size={18} /></div>
              <h3 className="lp-h3 mb-2">Know what earns</h3>
              <p className="lp-body mb-6">Clicks, orders and where visitors come from, per block. Cut what doesn&apos;t earn, double down on what does.</p>
              <div className="lp-mock mt-auto">
                <div className="flex items-end gap-1.5 h-16">
                  {[38, 52, 34, 61, 70, 48, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-[4px]" style={{ height: `${h}%`, background: i === 6 ? 'var(--lp-accent)' : '#C9DBFF' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Multi-page */}
            <div className="lp-card lp-card-pad lp-span-2 flex flex-col">
              <div className="lp-icon mb-5"><FileStack size={18} /></div>
              <h3 className="lp-h3 mb-2">Pitch brands with real numbers</h3>
              <p className="lp-body mb-6">Give brands their own page with its own clicks and views. Walk into every deal with data, not screenshots.</p>
              <div className="lp-mock mt-auto flex gap-1.5">
                {['Fans', 'Brands', 'Press'].map((t, i) => (
                  <span key={t} className="flex-1 text-center rounded-lg py-2 text-[13px] font-semibold"
                    style={i === 1 ? { background: 'var(--lp-ink)', color: '#fff' } : { background: '#fff', border: '1px solid var(--lp-line)', color: 'var(--lp-ink-2)' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Themes */}
            <div className="lp-card lp-card-pad lp-span-2 flex flex-col">
              <div className="lp-icon mb-5"><Palette size={18} /></div>
              <h3 className="lp-h3 mb-2">Looks like your brand</h3>
              <p className="lp-body mb-6">8 presets or fully custom colors, gradients and button styles.</p>
              <div className="lp-mock mt-auto flex items-center gap-2">
                {['#0E1220', '#5090FF', '#F472B6', '#F59E0B', '#10B981'].map(c => (
                  <span key={c} className="w-8 h-8 rounded-full" style={{ background: c, boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.6)' }} />
                ))}
                <span className="w-8 h-8 rounded-full" style={{ background: 'linear-gradient(135deg,#5090FF,#F472B6)' }} />
              </div>
            </div>
          </div>

          {/* Block types folded in as a compact row */}
          <div className="mt-14 flex flex-col md:flex-row md:items-center gap-5">
            <p className="flex-shrink-0 inline-flex items-center gap-2 text-[15px] font-semibold"><Layers size={17} style={{ color: 'var(--lp-accent)' }} /> 12 block types, drag to reorder</p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map(({ icon: Icon, label }) => (
                <span key={label} className="lp-chip"><Icon size={14} style={{ color: 'var(--lp-accent-ink)' }} />{label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Switch from Linktree (import + calendar) ─── */}
      <section id="switch" className="lp-section lp-alt">
        <div className="lp-wrap">
          <div className="max-w-[640px] mb-14">
            <p className="lp-eyebrow">Switching is easy</p>
            <h2 className="lp-h2 mb-5">Bring your Linktree. Keep every link.</h2>
            <p className="lp-lead">Paste your old URL — we pull in your links, socials, name, bio and avatar. You review, you publish.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Import */}
            <div className="lp-card lp-card-pad">
              <div className="flex items-center justify-between mb-6">
                <h3 className="lp-h3">Import in ~30 seconds</h3>
                <span className="text-[12px]" style={{ color: 'var(--lp-muted)' }}>Linktree · Portaly · OpenLink</span>
              </div>
              <div className="lp-mock">
                <div className="flex gap-2 mb-4">
                  <div className="lp-row flex-1 font-mono"><Link2 size={14} style={{ color: 'var(--lp-muted)' }} />linktr.ee/yourname</div>
                  <span className="lp-btn lp-btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>Import</span>
                </div>
                <div className="flex items-center justify-between text-[12px] font-semibold mb-2 px-1" style={{ color: 'var(--lp-ok)' }}>
                  <span className="inline-flex items-center gap-1.5"><Check size={13} strokeWidth={3} /> Imported</span>
                  <span style={{ color: 'var(--lp-muted)', fontWeight: 500 }}>9 blocks · 4 socials</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { Icon: PlayCircle, label: 'My YouTube channel' },
                    { Icon: ShoppingBag, label: 'Shop my templates' },
                    { Icon: Mail, label: 'Newsletter signup' },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="lp-row"><Icon size={14} style={{ color: 'var(--lp-accent-ink)' }} />{label}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="lp-card lp-card-pad flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="lp-h3">Add-to-Calendar block</h3>
                <span className="lp-chip" style={{ padding: '3px 10px', fontSize: 12 }}>Pro+</span>
              </div>
              <p className="lp-body mb-6">One tap saves your livestream, pop-up or product drop to Google, Apple or Outlook — in the fan&apos;s own timezone.</p>
              <div className="lp-mock mt-auto">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-ink)', color: '#fff' }}>
                    <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70">May</span>
                    <span className="text-[17px] font-bold leading-none">17</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[14px]">Live Q&amp;A: Building Your Brand</p>
                    <p className="text-[12px]" style={{ color: 'var(--lp-ink-2)' }}>Sat · 8:00 PM your time · YouTube Live</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="lp-btn lp-btn-accent" style={{ padding: '9px 12px', fontSize: 13, boxShadow: 'none' }}><CalendarPlus size={14} /> Google Calendar</span>
                  <span className="lp-btn lp-btn-line" style={{ padding: '9px 12px', fontSize: 13 }}><DownloadCloud size={14} /> .ics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div className="max-w-[560px]">
              <p className="lp-eyebrow">How it works</p>
              <h2 className="lp-h2">Three steps. You&apos;re live.</h2>
            </div>
            <Link href="/demo" className="lp-link">Open the live demo <ArrowRight size={15} /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map(({ title, description }, i) => (
              <div key={title} style={{ borderTop: '2px solid var(--lp-ink)', paddingTop: 22 }}>
                <p className="lp-step-num mb-3">0{i + 1}</p>
                <h3 className="lp-h3 mb-2">{title}</h3>
                <p className="lp-body">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who it's for ─── */}
      <section className="lp-section lp-alt">
        <div className="lp-wrap">
          <div className="max-w-[640px] mb-14">
            <p className="lp-eyebrow">Who it&apos;s for</p>
            <h2 className="lp-h2">Different creators. One link.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {USE_CASES.map(({ icon: Icon, title, pain, solution, sample }) => (
              <div key={title} className="lp-card lp-card-pad flex flex-col">
                <MiniPagePreview {...sample} />
                <div className="flex items-center gap-2 mt-6 mb-2">
                  <Icon size={17} style={{ color: 'var(--lp-accent-ink)' }} />
                  <h3 className="lp-h3" style={{ fontSize: 18 }}>{title}</h3>
                </div>
                <p className="text-[14px] mb-2" style={{ color: 'var(--lp-muted)' }}>{pain}</p>
                <p className="lp-body flex-1">{solution}</p>
                <Link href="/login" className="lp-link mt-5" style={{ fontSize: 14 }}>Build yours <ArrowRight size={14} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Compare ─── */}
      <section className="lp-section">
        <div className="lp-wrap grid lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="lp-eyebrow">Compare</p>
            <h2 className="lp-h2 mb-5">Beam vs. the alternatives</h2>
            <p className="lp-lead">An honest side-by-side of the features creators ask us about most.</p>
          </div>
          <div className="lp-card overflow-hidden">
            <table className="lp-table">
              <thead>
                <tr className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--lp-muted)' }}>
                  <th style={{ fontWeight: 600 }}>Feature</th>
                  <th className="lp-us" style={{ fontSize: 12 }}>Beam</th>
                  <th className="lp-them" style={{ fontWeight: 600 }}>Others</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map(({ feature, us, them }) => (
                  <tr key={feature}>
                    <td style={{ fontWeight: 500 }}>{feature}</td>
                    <td className="lp-us">{us === true ? <Check size={18} strokeWidth={2.5} className="inline" /> : us === false ? <X size={18} className="inline" /> : us}</td>
                    <td className="lp-them">{them === true ? <Check size={18} className="inline" /> : them === false ? <X size={18} className="inline" /> : them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      {SHOW_TESTIMONIALS && (
        <section className="lp-section lp-alt">
          <div className="lp-wrap">
            <div className="max-w-[640px] mb-14">
              <p className="lp-eyebrow">From creators</p>
              <h2 className="lp-h2">Creators who switched</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {TESTIMONIALS.map(({ name, role, quote }) => (
                <figure key={name} className="lp-card lp-card-pad flex flex-col">
                  <blockquote className="flex-1 text-[17px] leading-[1.6]" style={{ color: 'var(--lp-ink)' }}>&ldquo;{quote}&rdquo;</blockquote>
                  <figcaption className="flex items-center gap-3 mt-7">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: 'var(--lp-accent-soft)', color: 'var(--lp-accent-ink)' }}>{name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-[14px]">{name}</p>
                      <p className="text-[13px]" style={{ color: 'var(--lp-muted)' }}>{role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing ─── */}
      <section id="pricing" className={`lp-section ${SHOW_TESTIMONIALS ? '' : 'lp-alt'}`}>
        <div className="lp-wrap">
          <div className="text-center max-w-[620px] mx-auto mb-14">
            <p className="lp-eyebrow">Pricing</p>
            <h2 className="lp-h2 mb-5">Every plan can sell.</h2>
            <p className="lp-lead">Start free. Upgrade when the platform fee costs more than the plan: 10% → 5% → 2%.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-[1040px] mx-auto items-stretch">
            {PLANS.map(p => (
              <div key={p.name} className={`lp-card lp-card-pad flex flex-col relative ${p.featured ? 'lp-shadow' : ''} ${p.dark ? 'lp-dark' : ''}`}
                style={p.featured ? { borderColor: 'var(--lp-accent)', borderWidth: 2 } : p.dark ? { borderColor: 'var(--lp-ink)' } : undefined}>
                {p.featured && (
                  <span className="absolute -top-3 left-7 text-[12px] font-semibold rounded-full px-3 py-1" style={{ background: 'var(--lp-accent)', color: '#fff' }}>Most popular</span>
                )}
                <h3 className="lp-h3" style={p.dark ? { color: '#fff' } : undefined}>{p.name}</h3>
                <p className="text-[14px] mb-6" style={{ color: p.dark ? 'rgba(255,255,255,0.55)' : 'var(--lp-muted)' }}>{p.tagline}</p>
                <p className="lp-display whitespace-nowrap" style={{ fontSize: 40 }}>
                  {p.price} <span className="text-[15px] font-normal" style={{ letterSpacing: 0, color: p.dark ? 'rgba(255,255,255,0.5)' : 'var(--lp-muted)' }}>{p.per}</span>
                </p>
                <p className="text-[13px] mt-1 mb-6" style={{ color: p.dark ? 'rgba(255,255,255,0.5)' : 'var(--lp-muted)', minHeight: 20 }}>{p.annual ?? 'No credit card needed'}</p>
                <p className="text-[14px] font-semibold mb-4 pb-4" style={{ borderBottom: `1px solid ${p.dark ? 'rgba(255,255,255,0.12)' : 'var(--lp-line)'}`, color: p.dark ? '#9FC2FF' : 'var(--lp-accent-ink)' }}>{p.fee}</p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {p.items.map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px]" style={{ color: p.dark ? 'rgba(255,255,255,0.82)' : 'var(--lp-ink-2)' }}>
                      <span className="mt-[3px]"><Check14 /></span>{item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`lp-btn w-full ${p.featured ? 'lp-btn-accent' : p.dark ? '' : 'lp-btn-line'}`}
                  style={p.dark ? { background: '#fff', color: 'var(--lp-ink)' } : undefined}>{p.cta}</Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="lp-link" style={{ fontSize: 14 }}>Full feature comparison &amp; fee calculator <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="lp-section lp-alt">
        <div className="lp-wrap grid lg:grid-cols-[1fr_1.5fr] gap-12">
          <div>
            <p className="lp-eyebrow">FAQ</p>
            <h2 className="lp-h2 mb-5">Questions, answered.</h2>
            <p className="lp-body">Something else? <Link href="/contact" className="lp-link" style={{ fontSize: 15 }}>Get in touch</Link></p>
          </div>
          <div className="lp-faq" style={{ borderTop: '1px solid var(--lp-line)' }}>
            {FAQS.map(({ q, a }) => (
              <details key={q}>
                <summary className="flex items-center justify-between gap-4 cursor-pointer py-5">
                  <span className="font-semibold text-[16px]">{q}</span>
                  <Plus size={18} className="lp-faq-icon flex-shrink-0" style={{ color: 'var(--lp-muted)' }} />
                </summary>
                <p className="lp-body pb-5 pr-8">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="lp-dark relative overflow-hidden" style={{ padding: 'clamp(80px, 11vw, 136px) 20px' }}>
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,144,255,0.35) 0%, transparent 65%)', filter: 'blur(30px)' }} />
        <div className="lp-wrap relative text-center flex flex-col items-center">
          <h2 className="lp-display mb-5" style={{ fontSize: 'clamp(36px, 5.5vw, 64px)' }}>Your page in 30 seconds.</h2>
          <p className="mb-10 max-w-[480px]" style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.65)' }}>
            Claim your username — start taking orders and collecting emails today.
          </p>
          <div className="w-full flex justify-center"><ClaimForm dark cta="Claim it" /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-6 mt-16 pt-10 w-full max-w-[760px]" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { value: '12', label: 'Block types' },
              { value: 'From 2%', label: 'Platform fee' },
              { value: '< 1s', label: 'Page load' },
              { value: 'NT$0', label: 'To start, forever' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="lp-display" style={{ fontSize: 28 }}>{value}</p>
                <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: '36px 20px', borderTop: '1px solid var(--lp-line)' }}>
        <div className="lp-wrap flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[7px] flex items-center justify-center" style={{ background: 'var(--lp-ink)' }}>
              <Link2 size={12} color="white" strokeWidth={2.5} />
            </div>
            <span className="lp-display text-[16px]">Beam</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact'],
              ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/login', 'Log in'], ['/zh-TW', '中文'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="text-[13px] hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-muted)' }}>{label}</Link>
            ))}
          </nav>
          <p className="text-[13px]" style={{ color: 'var(--lp-muted)' }}>&copy; 2026 Beam</p>
        </div>
      </footer>
    </div>
  )
}
