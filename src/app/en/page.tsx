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

/**
 * English landing page — sits at `/en`.
 *
 * Visually-rich version: heavy on inline mockups, mini block previews,
 * comparison tables, testimonials, and feature illustrations. The Chinese
 * landing at `/` stays text-first; this page is the marketing-heavy variant
 * for international visitors.
 *
 * Pricing numbers come from `PLAN_PRICING` so both pages stay in sync.
 */

const FEATURES = [
  { icon: Layers,    title: 'Every block you need',     description: 'Links, banners, videos, products, forms, calendars — drag and drop to build a page that\'s truly yours.' },
  { icon: Palette,   title: 'Theme your brand',         description: '8 presets or fully custom colors, gradient backgrounds, and button styles. Your brand, pixel-perfect.' },
  { icon: BarChart2, title: 'Real-time analytics',      description: 'Track visitors, clicks, and top-performing blocks — and iterate on what actually works.' },
  { icon: ShoppingBag, title: 'Sell digital products',  description: 'Stripe built-in. Sell courses, e-books, and templates directly from your page — no storefront needed.' },
  { icon: Mail,      title: 'Grow your email list',     description: 'Embed email capture forms, own your audience, and stop renting attention from the algorithm.' },
  { icon: FileStack, title: 'Multiple pages, one account', description: 'One account, many pages. Split by topic — courses, partnerships, personal — with named tabs.' },
]

const STEPS = [
  { icon: UserPlus, num: '1', title: 'Create an account', description: 'Pick a username. No credit card. Done in 30 seconds.' },
  { icon: Plus,     num: '2', title: 'Add your blocks',   description: 'Drag, drop, and edit. Preview updates instantly as you build.' },
  { icon: Share2,   num: '3', title: 'Share one link',    description: 'Drop it in your IG bio, YouTube, Threads, or anywhere else. One link to rule them all.' },
]

const USE_CASES = [
  {
    icon: Video,
    title: 'IG / YouTube creators',
    pain: 'One bio link isn\'t enough — fans miss your best content.',
    solution: 'Unify every social, your latest video, and a contact form behind a single link that fits in your bio.',
    cta: 'Build creator page',
    sample: { name: 'Mia Chen', handle: '@miachen.cooks', blocks: ['Latest YouTube video', 'My Recipe E-book', 'Brand Partnerships'] },
  },
  {
    icon: ShoppingBag,
    title: 'Course & product sellers',
    pain: 'Full websites are overkill when you just want to sell.',
    solution: 'Sell courses, e-books, and templates with Stripe-powered checkout. No site build. No platform lock-in.',
    cta: 'Start selling',
    sample: { name: 'Alex Wong', handle: '@alexcoaches', blocks: ['Notion Templates Bundle — $29', 'Coaching Call (60 min)', 'Free Newsletter'] },
  },
  {
    icon: Headphones,
    title: 'Podcasters',
    pain: 'Listeners scattered across Apple, Spotify, YouTube — no single home.',
    solution: 'One page with every podcast platform, support links, and email signup. Meet listeners wherever they are.',
    cta: 'Build podcast page',
    sample: { name: 'The Drift Show', handle: '@thedriftshow', blocks: ['Listen on Spotify', 'Listen on Apple Podcasts', 'Buy us a coffee'] },
  },
]

const BLOCK_TYPES = [
  { icon: ExternalLink, label: 'Link button',    color: '#5090FF' },
  { icon: ImageIcon,    label: 'Banner',         color: '#F472B6' },
  { icon: Type,         label: 'Heading',        color: '#A78BFA' },
  { icon: Video,        label: 'Video embed',    color: '#EF4444' },
  { icon: ShoppingBag,  label: 'Product',        color: '#10B981' },
  { icon: Mail,         label: 'Email form',     color: '#F59E0B' },
  { icon: Timer,        label: 'Countdown',      color: '#8B5CF6' },
  { icon: HelpCircle,   label: 'FAQ',            color: '#06B6D4' },
  { icon: ImagesIcon,   label: 'Carousel',       color: '#EC4899' },
  { icon: MapPin,       label: 'Map embed',      color: '#14B8A6' },
  { icon: Code,         label: 'HTML embed',     color: '#64748B' },
  { icon: CalendarPlus, label: 'Add to calendar', color: '#3B82F6', isNew: true },
]

const TESTIMONIALS = [
  { name: 'Sarah K.',    role: 'Beauty creator, 280K followers', quote: 'Migrated from Linktree in literally 30 seconds. The Add-to-Calendar block alone has bumped my livestream attendance ~22%.', gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)' },
  { name: 'Marcus L.',   role: 'Online course creator',          quote: 'I make more from the page now than I did with my old Shopify store. 5% fee on Pro is worth it just for the conversion lift.', gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' },
  { name: 'The Bao Pod', role: 'Podcast, 45K listeners',         quote: 'One page, every podcast platform, plus our newsletter form. Support tips went up the week we switched.', gradient: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)' },
]

const FAQS = [
  { q: 'Is there really a free plan?', a: 'Yes — free forever. 1 page, 12 blocks, 6 core block types, and product sales with a 10% platform fee. No credit card required.' },
  { q: 'Can I import my existing Linktree?', a: 'Yes. Paste your linktr.ee or portaly.cc URL, we pull over your links, social icons, profile name, bio, and avatar. The whole thing takes about 30 seconds.' },
  { q: 'How do you compare to Linktree on price?', a: 'Our Pro plan starts at NT$' + PLAN_PRICING.pro.monthly + '/mo, which is comparable to Linktree Starter — but you also get product sales (5% platform fee), team members, and the Add-to-Calendar block.' },
  { q: 'Can I sell digital products?', a: 'On every plan. Free pages can sell with a 10% platform fee. Pro drops it to 5%, Premium to 2%. Stripe handles checkout — payouts go straight to your account.' },
  { q: 'Do I need to know any code?', a: 'No. Everything is drag-and-drop with live preview. If you do want custom CSS or iframes, the HTML Embed block on Premium has you covered.' },
  { q: 'Can I use my own domain?', a: 'Pro plans get a clean beam.io/yourname URL. Premium adds custom domain support — point your own domain at your portal.' },
]

const COMPARISON = [
  { feature: 'Free plan',                 us: 'Forever',           them: 'Limited' },
  { feature: 'Drag-and-drop builder',     us: true,                them: true },
  { feature: 'Sell digital products',     us: 'All plans',         them: 'Paid only' },
  { feature: 'Email list capture',        us: 'All plans',         them: 'Paid only' },
  { feature: 'Add-to-Calendar block',     us: true,                them: false },
  { feature: 'Linktree / Portaly import', us: true,                them: false },
  { feature: 'Multi-page (tabs)',         us: 'Up to unlimited',   them: 'No' },
  { feature: 'Team members',              us: 'Up to unlimited',   them: 'Limited' },
  { feature: 'Custom domain',             us: 'Premium',           them: 'Top tier only' },
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

export default function LandingPageEn() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-primary)' }}>

      {/* ─── Navbar ─── */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }} className="sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/en" className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-blue)' }}>
              <Link2 size={16} color="white" />
            </div>
            <span className="font-bold text-base sm:text-lg whitespace-nowrap" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Beam</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <Link href="/pricing" style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">Pricing</Link>
            <Link href="/login"   style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">Log in</Link>
            <Link href="/"        style={{ color: 'var(--color-text-muted)',     fontSize: 13, fontWeight: 500 }} className="hidden sm:inline-block whitespace-nowrap hover:opacity-70 transition-opacity">中文</Link>
            <Link href="/login" className="btn-primary whitespace-nowrap flex-shrink-0" style={{ padding: '9px 16px', fontSize: 13 }}>Start free</Link>
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
              Now with Linktree import &amp; Add-to-Calendar
            </div>
            <h1 className="font-extrabold mb-5 leading-tight animate-fade-in-up"
              style={{ fontSize: 'clamp(32px, 6vw, 64px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', animationDelay: '0.1s' }}>
              One link.<br />
              <span className="text-gradient">Every fan touchpoint.</span>
            </h1>
            <p className="mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up" style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'var(--color-text-secondary)', lineHeight: 1.7, animationDelay: '0.2s' }}>
              Bring your Instagram, YouTube, podcast, digital products, and email list together on one page. Turn attention into income.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/login" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
                Create your portal <ArrowRight size={18} />
              </Link>
              <Link href="/demo" className="btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
                <Play size={16} /> See demo
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 justify-center lg:justify-start text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {['Free forever', 'No credit card', '30-second signup', 'Cancel anytime'].map(t => (
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
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-text-muted)' }}>This week</p>
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
                <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--color-text-muted)' }}>New sale</p>
                <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Notion Bundle</p>
                <p className="text-xs" style={{ color: '#16A34A', fontWeight: 600 }}>+ $29 USD</p>
              </div>
            </div>

            {/* Floating notification card */}
            <div className="hidden lg:flex absolute right-12 -top-2 rounded-2xl p-3 items-center gap-2" style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                <Heart size={13} style={{ color: '#EF4444', fill: '#EF4444' }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>247 new clicks today</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logo cloud (creator handles as social proof) ─── */}
      <section style={{ padding: '40px 24px', background: '#fff', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.15em' }}>
            Built for the platforms creators actually use
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
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Migrate from Linktree in 30 seconds
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Paste your old URL. We pull every link, social icon, and profile field. You confirm. Done.
            </p>
          </div>

          {/* Visual flow: URL → arrow → result */}
          <div className="grid md:grid-cols-[1.2fr_auto_1fr] gap-6 items-center max-w-5xl mx-auto">
            {/* Step 1: paste URL */}
            <div className="card" style={{ padding: 24 }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--color-primary)' }}>1</span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Paste your old URL</span>
              </div>
              <div className="rounded-lg flex items-center gap-2 px-3 py-2.5 mb-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Link2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="text-sm font-mono truncate" style={{ color: 'var(--color-text-primary)' }}>linktr.ee/yourname</span>
              </div>
              <button className="text-xs font-bold w-full rounded-lg py-2" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
                Preview content →
              </button>
            </div>

            {/* Arrow */}
            <div className="flex md:flex-col items-center justify-center gap-2">
              <ArrowRight size={32} className="hidden md:block" style={{ color: 'var(--color-primary)' }} />
              <ArrowRight size={24} className="md:hidden" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>~30s</span>
            </div>

            {/* Step 2: result */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#DCFCE7', borderBottom: '1px solid #86EFAC' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#15803D' }}>✓ Imported</span>
                <span className="text-xs" style={{ color: '#15803D' }}>9 blocks · 4 socials</span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { Icon: PlayCircle, label: 'My YouTube channel' },
                  { Icon: ShoppingBag, label: 'Shop my templates' },
                  { Icon: Mail,      label: 'Newsletter signup' },
                  { Icon: ExternalLink, label: 'Latest collab' },
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
              <h3 className="font-bold mb-3" style={{ fontSize: 28, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                Add-to-Calendar block
              </h3>
              <p className="mb-5" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                One-click Google Calendar for pop-ups, livestreams, and product drops. Full timezone support and .ics download for Apple Calendar &amp; Outlook.
              </p>
              <ul className="space-y-2">
                {['Auto-detects fan timezone', 'Google Calendar + .ics download', 'Perfect for livestreams &amp; sales'].map(t => (
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
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">May</span>
                  <span className="text-base font-extrabold leading-none">17</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Live Q&amp;A: Building Your Brand</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Sat, May 17 · 8:00 PM (GMT+8)</p>
                  <p className="text-xs mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <MapPin size={11} /> Online · YouTube Live
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>BLOCK TYPES</span>
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              12 ways to build a page
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Mix and match. Reorder by drag. Hide on the fly. Your page is exactly as flexible as you are.
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
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Everything creators need
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Not just a link page — your personal brand hub.
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
            <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              See it in action
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: 16, maxWidth: 440 }}>
              This is exactly what your page looks like on mobile. Rearrange any block, preview live, and ship a page that actually looks good.
            </p>
            <div className="flex flex-col gap-4 mb-8" style={{ maxWidth: 400 }}>
              {[
                'Drag-and-drop sorting',
                'Custom colors and gradient backgrounds',
                'Perfect on mobile and desktop',
                'Loads in under a second',
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
              View full demo <ArrowRight size={16} />
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>HOW IT WORKS</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Three steps. You&apos;re live.
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
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Different creators. One solution.
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Whatever kind of creator you are, Beam meets you where you are.
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
                    <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Pain:</span> {pain}
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
            <h2 className="font-bold mb-3" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Beam vs. the alternatives
            </h2>
            <p className="max-w-lg mx-auto text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Honest side-by-side. Most fans won&apos;t care about every feature — but the ones below are the ones we hear about most.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
            <div className="grid grid-cols-3 px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
              <span>Feature</span>
              <span className="text-center" style={{ color: 'var(--color-primary)' }}>Beam</span>
              <span className="text-center">Other tools</span>
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
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Loved by creators
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
            <span className="inline-block font-bold uppercase tracking-widest mb-3 text-xs" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>PRICING</span>
            <h2 className="font-bold" style={{ fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              Plans that grow with you
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Every plan can sell products. Platform fee drops as you upgrade: 10% → 5% → 2%.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="card" style={{ padding: 28 }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>Free</h3>
              <p className="mb-5" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>For creators getting started</p>
              <p className="font-extrabold mb-5 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                NT$0 <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ forever</span>
              </p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['1 page, 12 blocks', '30-day analytics', '6 core block types', 'Sell products (10% fee)', 'Beam branding'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-ghost w-full justify-center" style={{ padding: '10px 20px', fontSize: 14 }}>Start free</Link>
            </div>
            {/* Pro */}
            <div className="card" style={{ padding: 28, border: '2px solid var(--color-primary)', position: 'relative', background: 'white' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap" style={{ background: 'var(--gradient-blue)', color: 'white' }}>
                <Sparkles size={11} /> Most popular
              </div>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: 'var(--color-primary)' }}>Pro</h3>
              <p className="mb-5" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>For solo creators &amp; KOLs</p>
              <p className="font-extrabold mb-1 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                NT${PLAN_PRICING.pro.monthly} <span className="font-normal text-sm" style={{ color: 'var(--color-text-muted)' }}>/ mo</span>
              </p>
              <p className="mb-5 text-xs" style={{ color: 'var(--color-text-muted)' }}>NT${PLAN_PRICING.pro.annual}/mo billed annually</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['10 pages, 20 blocks each', '90-day analytics', 'All 12 block types', '5% platform fee on sales', '3 team members', 'Remove branding'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="btn-primary w-full justify-center" style={{ padding: '10px 20px', fontSize: 14 }}>Upgrade to Pro</Link>
            </div>
            {/* Premium */}
            <div className="card" style={{ padding: 28, background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)', border: '2px solid #1A202C', color: 'white' }}>
              <h3 className="font-bold mb-1" style={{ fontSize: 22, color: '#F6E05E' }}>Premium</h3>
              <p className="mb-5" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>For small brands &amp; studios</p>
              <p className="font-extrabold mb-1 whitespace-nowrap" style={{ fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'white', fontFamily: 'var(--font-display)' }}>
                NT${PLAN_PRICING.premium.monthly} <span className="font-normal text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>/ mo</span>
              </p>
              <p className="mb-5 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>NT${PLAN_PRICING.premium.annual}/mo billed annually</p>
              <div className="flex flex-col gap-2.5 mb-6">
                {['Unlimited pages &amp; blocks', 'Unlimited analytics retention', '2% platform fee on sales', 'Unlimited team members', 'Custom domain / favicon / CSS', 'Priority support'].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <Check size={14} style={{ color: '#F6E05E' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }} dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
              <Link href="/login" className="w-full inline-flex items-center justify-center rounded-lg font-bold" style={{ background: '#F6E05E', color: '#1A202C', padding: '10px 20px', fontSize: 14, textDecoration: 'none' }}>Upgrade to Premium</Link>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
              Full feature comparison &amp; fee calculator <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { Icon: Layers,            value: '12',         label: 'Block types' },
              { Icon: ShoppingBag,       value: 'From 2%',    label: 'Platform fee' },
              { Icon: Zap,               value: '< 1s',       label: 'Page load' },
              { Icon: Heart,             value: 'Free forever', label: 'Starter plan' },
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
              Frequently asked questions
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
            Your page in 30 seconds
          </h2>
          <p className="mb-10" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.6 }}>
            Grab your username and claim your URL today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 max-w-md mx-auto">
            <div className="flex items-center rounded-xl overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="pl-4 text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>beam.io/</span>
              <input type="text" placeholder="yourname" className="flex-1 bg-transparent border-none outline-none py-3.5 pr-4 text-white placeholder:text-white/30" style={{ fontSize: 15 }} />
            </div>
            <Link href="/login" className="btn-primary whitespace-nowrap" style={{ fontSize: 15, padding: '14px 28px', boxShadow: '0 8px 32px rgba(80,144,255,0.4)' }}>
              Claim it <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['Free forever', 'No credit card', '30-second signup'].map(text => (
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
            <Link href="/pricing" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>Pricing</Link>
            <Link href="/about"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>About</Link>
            <Link href="/contact" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>Contact</Link>
            <Link href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>Privacy</Link>
            <Link href="/terms"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>Terms</Link>
            <Link href="/login"   className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>Log in</Link>
            <Link href="/"        className="text-xs hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>中文</Link>
          </nav>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>&copy; 2026 Beam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export const metadata = {
  title: 'Beam — One link. Every fan touchpoint.',
  description:
    'Link-in-bio for creators: unite Instagram, YouTube, podcasts, digital products, and your email list on one page. Import from Linktree in 30 seconds. Free forever plan.',
  alternates: {
    canonical: '/en',
    languages: {
      en: '/en',
      'zh-TW': '/',
    },
  },
}
