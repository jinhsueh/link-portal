import Image from 'next/image'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import {
  Link2, ShoppingBag, Mail, ArrowRight, Check, X, Plus, Video, Camera, PlayCircle, Globe,
  ExternalLink, Image as ImageIcon, Type, Timer, HelpCircle, Images as ImagesIcon, MapPin,
  Code, CalendarPlus, Palette, Layers,
} from 'lucide-react'
import { PLAN_PRICING } from '@/lib/plan'
import { SITE_HOST } from '@/lib/site'
import type { LandingCopy } from './copy/types'

/**
 * Shared marketing landing for every locale (/en, /zh-TW, /th, /ja).
 *
 * Image-first, text-light: each feature is one large product shot (stills from
 * the launch video in public/landing/) plus a single line of copy. All strings
 * live in ./copy/<locale>.ts so the four languages can't drift apart again.
 * Visual tokens are the `.lp` block in globals.css.
 *
 * ICP: creators & KOLs earning from their following — own products, brand
 * deals, owned email list (see positioning commit 283992f).
 */

const BLOCK_ICONS = [ExternalLink, ImageIcon, Type, Video, ShoppingBag, Mail, Timer, HelpCircle, ImagesIcon, MapPin, Code, CalendarPlus]
const PERSONA_ICONS = [Camera, Video, Palette]

// Order matches copy.show.rows: sell, list, analytics, themes, import.
const SHOTS = [
  { src: '/landing/sell.webp',      w: 1400, h: 684 },
  { src: '/landing/list.webp',      w: 1400, h: 547 },
  { src: '/landing/analytics.webp', w: 1400, h: 539 },
  { src: '/landing/themes.webp',    w: 1600, h: 599 },
  { src: '/landing/import.webp',    w: 1000, h: 807 },
]

function ClaimForm({ c, dark = false, label }: { c: LandingCopy; dark?: boolean; label: string }) {
  return (
    <form action="/login" method="get" className={`lp-claim ${dark ? 'lp-claim-dark' : ''}`}>
      <input type="hidden" name="lang" value={c.locale} />
      <span className="lp-claim-host">{SITE_HOST}/</span>
      <input name="username" type="text" placeholder="yourname" aria-label={c.hero.claimAria} autoComplete="off" spellCheck={false} />
      <button type="submit" className="lp-btn lp-btn-accent" style={{ padding: '11px 20px' }}>
        <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{c.hero.claimShort}</span> <ArrowRight size={16} />
      </button>
    </form>
  )
}

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

function Mark({ v }: { v: string | boolean }) {
  if (v === true) return <Check size={18} strokeWidth={2.5} className="inline" />
  if (v === false) return <X size={18} className="inline" />
  return <>{v}</>
}

export function Landing({ c }: { c: LandingCopy }) {
  const home = `/${c.locale}`
  const prices = [
    { price: 'NT$0', annual: null },
    { price: `NT$${PLAN_PRICING.pro.monthly}`, annual: c.pricing.annual(PLAN_PRICING.pro.annual) },
    { price: `NT$${PLAN_PRICING.premium.monthly}`, annual: c.pricing.annual(PLAN_PRICING.premium.annual) },
  ]

  return (
    <div className="lp min-h-screen" lang={c.locale}>

      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'saturate(180%) blur(14px)', borderBottom: '1px solid var(--lp-line)' }}>
        <div className="lp-wrap px-5 h-16 flex items-center justify-between gap-3">
          <Link href={home} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--lp-ink)' }}>
              <Link2 size={16} color="white" strokeWidth={2.5} />
            </div>
            <span className="lp-display text-[20px]" style={{ letterSpacing: '-0.02em' }}>Beam</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="#features" className="hidden md:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>{c.nav.features}</Link>
            <Link href="#pricing"  className="hidden md:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>{c.nav.pricing}</Link>
            <Link href="#video"    className="hidden md:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>{c.nav.video}</Link>
            <LanguageSwitcher />
            <Link href={`/login?lang=${c.locale}`} className="hidden sm:inline text-[14px] font-medium hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-ink-2)' }}>{c.nav.login}</Link>
            <Link href={`/login?lang=${c.locale}`} className="lp-btn lp-btn-primary" style={{ padding: '9px 16px', fontSize: 14 }}>{c.nav.start}</Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(56px, 8vw, 104px) 20px clamp(64px, 8vw, 112px)' }}>
        <div aria-hidden className="lp-hero-bg absolute inset-0" />
        <div className="lp-wrap relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-14 lg:gap-10 items-center">
          <div className="min-w-0">
            <Link href="#import" className="lp-chip mb-7 hover:border-[#CBD1DC] transition-colors">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lp-accent)' }} />
              {c.hero.chip}
              <ArrowRight size={13} />
            </Link>
            <h1 className="lp-display lp-h1 mb-6">
              {c.hero.h1a}<br />
              <span className="lp-accent">{c.hero.h1b}</span>
            </h1>
            <p className="lp-lead mb-9 max-w-[520px]">{c.hero.sub}</p>
            <ClaimForm c={c} label={c.hero.claim} />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-[13px]" style={{ color: 'var(--lp-muted)' }}>
              {c.hero.trust.map(t => (
                <span key={t} className="inline-flex items-center gap-1.5"><Check size={13} strokeWidth={2.5} style={{ color: 'var(--lp-ok)' }} />{t}</span>
              ))}
              <Link href="#video" className="lp-link" style={{ fontSize: 13 }}>{c.hero.watch} <ArrowRight size={13} /></Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] max-w-full h-[420px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,144,255,0.22) 0%, transparent 65%)', filter: 'blur(20px)' }} />
            <div className="phone-frame relative" style={{ width: '100%', maxWidth: 290 }}>
              <div className="phone-frame-inner" style={{ height: 560 }}>
                <iframe src={`/demo?lang=${c.locale}`} title="Beam demo page" loading="eager" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
              </div>
            </div>
            <div className="lp-float hidden md:flex" style={{ left: 'max(-8px, calc(50% - 280px))', top: 96 }}>
              <div className="lp-icon" style={{ background: '#DCFCE7', color: 'var(--lp-ok)' }}><ShoppingBag size={17} /></div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--lp-muted)' }}>{c.floats.sale}</p>
                <p className="text-[14px] font-semibold">{c.floats.saleItem} <span style={{ color: 'var(--lp-ok)' }}>+$29</span></p>
              </div>
            </div>
            <div className="lp-float hidden md:flex" style={{ right: 'max(-8px, calc(50% - 290px))', bottom: 110 }}>
              <div className="lp-icon"><Mail size={17} /></div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: 'var(--lp-muted)' }}>{c.floats.sub}</p>
                <p className="text-[14px] font-semibold">{c.floats.subText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Platforms strip ─── */}
      <section style={{ padding: '28px 20px', borderTop: '1px solid var(--lp-line)', borderBottom: '1px solid var(--lp-line)' }}>
        <div className="lp-wrap flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-[13px] font-medium" style={{ color: 'var(--lp-muted)' }}>{c.strip}</p>
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
            <p className="lp-eyebrow">{c.video.eyebrow}</p>
            <h2 className="lp-h2">{c.video.title}</h2>
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

      {/* ─── Features: one product shot + one line each ─── */}
      <section id="features" className="lp-section">
        <div className="lp-wrap">
          <div className="text-center max-w-[680px] mx-auto mb-16">
            <p className="lp-eyebrow">{c.show.eyebrow}</p>
            <h2 className="lp-h2">{c.show.title}</h2>
          </div>

          <div className="flex flex-col gap-6">
            {c.show.rows.map((row, i) => {
              const shot = SHOTS[i]
              const wide = i === 3 // themes strip spans full width
              return (
                <div key={row.title} id={i === 4 ? 'import' : undefined}
                  className={`lp-card overflow-hidden grid grid-cols-1 ${wide ? '' : 'lg:grid-cols-[2fr_3fr]'} items-center`}
                  style={{ background: 'var(--lp-paper-2)' }}>
                  <div className={`p-8 lg:p-12 ${wide ? 'text-center' : ''} ${!wide && i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <h3 className="lp-h2 lp-h2-sm mb-3">{row.title}</h3>
                    <p className="lp-lead" style={{ fontSize: 17 }}>{row.line}</p>
                    {row.chips && (
                      <div className={`flex flex-wrap gap-2 mt-5 ${wide ? 'justify-center' : ''}`}>
                        {row.chips.map(ch => <span key={ch} className="lp-chip">{ch}</span>)}
                      </div>
                    )}
                  </div>
                  <div className={wide ? 'lp-scroll-x px-6 pb-8 lg:px-12 lg:pb-12' : 'px-6 pb-6 lg:p-8'}>
                    <Image src={shot.src} alt={c.alt[i]} width={shot.w} height={shot.h} sizes={wide ? '(max-width: 768px) 900px, 1160px' : '(max-width: 1024px) 100vw, 680px'}
                      className="w-full h-auto rounded-2xl" style={wide ? { minWidth: 760 } : undefined} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-12 flex flex-col md:flex-row md:items-center gap-5">
            <p className="flex-shrink-0 inline-flex items-center gap-2 text-[15px] font-semibold"><Layers size={17} style={{ color: 'var(--lp-accent)' }} /> {c.blocks.label}</p>
            <div className="flex flex-wrap gap-2">
              {c.blocks.items.map((label, i) => {
                const Icon = BLOCK_ICONS[i]
                return <span key={label} className="lp-chip"><Icon size={14} style={{ color: 'var(--lp-accent-ink)' }} />{label}</span>
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="lp-section lp-alt">
        <div className="lp-wrap">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="lp-eyebrow">{c.steps.eyebrow}</p>
              <h2 className="lp-h2">{c.steps.title}</h2>
            </div>
            <Link href={`/demo?lang=${c.locale}`} className="lp-link">{c.steps.demo} <ArrowRight size={15} /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {c.steps.items.map((title, i) => (
              <div key={title} style={{ borderTop: '2px solid var(--lp-ink)', paddingTop: 20 }}>
                <p className="lp-display" style={{ fontSize: 56, color: 'var(--lp-accent)' }}>0{i + 1}</p>
                <h3 className="lp-h3 mt-3">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who it's for ─── */}
      <section className="lp-section">
        <div className="lp-wrap">
          <div className="max-w-[640px] mb-12">
            <p className="lp-eyebrow">{c.who.eyebrow}</p>
            <h2 className="lp-h2">{c.who.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.who.items.map(({ title, line, sample }, i) => {
              const Icon = PERSONA_ICONS[i]
              return (
                <div key={title} className="lp-card lp-card-pad flex flex-col">
                  <MiniPagePreview {...sample} />
                  <div className="flex items-center gap-2 mt-6 mb-1.5">
                    <Icon size={17} style={{ color: 'var(--lp-accent-ink)' }} />
                    <h3 className="lp-h3" style={{ fontSize: 18 }}>{title}</h3>
                  </div>
                  <p className="lp-body flex-1">{line}</p>
                  <Link href={`/login?lang=${c.locale}`} className="lp-link mt-4" style={{ fontSize: 14 }}>{c.who.build} <ArrowRight size={14} /></Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Compare ─── */}
      <section className="lp-section lp-alt">
        <div className="lp-wrap grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="lp-eyebrow">{c.compare.eyebrow}</p>
            <h2 className="lp-h2">{c.compare.title}</h2>
          </div>
          <div className="lp-card overflow-hidden">
            <table className="lp-table">
              <thead>
                <tr className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--lp-muted)' }}>
                  <th style={{ fontWeight: 600 }}>{c.compare.head[0]}</th>
                  <th className="lp-us" style={{ fontSize: 12 }}>{c.compare.head[1]}</th>
                  <th className="lp-them" style={{ fontWeight: 600 }}>{c.compare.head[2]}</th>
                </tr>
              </thead>
              <tbody>
                {c.compare.rows.map(({ feature, us, them }) => (
                  <tr key={feature}>
                    <td style={{ fontWeight: 500 }}>{feature}</td>
                    <td className="lp-us"><Mark v={us} /></td>
                    <td className="lp-them"><Mark v={them} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="lp-section">
        <div className="lp-wrap">
          <div className="text-center max-w-[620px] mx-auto mb-14">
            <p className="lp-eyebrow">{c.pricing.eyebrow}</p>
            <h2 className="lp-h2 mb-4">{c.pricing.title}</h2>
            <p className="lp-lead">{c.pricing.sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1040px] mx-auto items-stretch">
            {c.pricing.plans.map((p, i) => {
              const featured = i === 1, dark = i === 2
              return (
                <div key={p.name} className={`lp-card lp-card-pad flex flex-col relative ${featured ? 'lp-shadow' : ''} ${dark ? 'lp-dark' : ''}`}
                  style={featured ? { borderColor: 'var(--lp-accent)', borderWidth: 2 } : dark ? { borderColor: 'var(--lp-ink)' } : undefined}>
                  {featured && (
                    <span className="absolute -top-3 left-7 text-[12px] font-semibold rounded-full px-3 py-1" style={{ background: 'var(--lp-accent)', color: '#fff' }}>{c.pricing.popular}</span>
                  )}
                  <h3 className="lp-h3" style={dark ? { color: '#fff' } : undefined}>{p.name}</h3>
                  <p className="text-[14px] mb-6" style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'var(--lp-muted)' }}>{p.tagline}</p>
                  <p className="lp-display whitespace-nowrap" style={{ fontSize: 40, letterSpacing: '-0.03em' }}>
                    {prices[i].price} <span className="text-[15px] font-normal" style={{ letterSpacing: 0, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--lp-muted)' }}>{p.per}</span>
                  </p>
                  <p className="text-[13px] mt-1 mb-6" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--lp-muted)', minHeight: 20 }}>{prices[i].annual ?? c.pricing.noCard}</p>
                  <p className="text-[14px] font-semibold mb-4 pb-4" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'var(--lp-line)'}`, color: dark ? '#9FC2FF' : 'var(--lp-accent-ink)' }}>{p.fee}</p>
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {p.items.map(item => (
                      <li key={item} className="flex items-start gap-2.5 text-[14px]" style={{ color: dark ? 'rgba(255,255,255,0.82)' : 'var(--lp-ink-2)' }}>
                        <Check size={15} strokeWidth={2.5} className="mt-[3px] flex-shrink-0" style={{ color: 'var(--lp-accent)' }} />{item}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/login?lang=${c.locale}`} className={`lp-btn w-full ${featured ? 'lp-btn-accent' : dark ? '' : 'lp-btn-line'}`}
                    style={dark ? { background: '#fff', color: 'var(--lp-ink)' } : undefined}>{p.cta}</Link>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="lp-link" style={{ fontSize: 14 }}>{c.pricing.full} <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="lp-section lp-alt">
        <div className="lp-wrap grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10">
          <div>
            <p className="lp-eyebrow">{c.faq.eyebrow}</p>
            <h2 className="lp-h2 mb-5">{c.faq.title}</h2>
            <p className="lp-body">{c.faq.contact} <Link href="/contact" className="lp-link" style={{ fontSize: 15 }}>{c.faq.contactLink}</Link></p>
          </div>
          <div className="lp-faq" style={{ borderTop: '1px solid var(--lp-line)' }}>
            {c.faq.items.map(({ q, a }) => (
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
        <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] max-w-full h-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(80,144,255,0.35) 0%, transparent 65%)', filter: 'blur(30px)' }} />
        <div className="lp-wrap relative text-center flex flex-col items-center">
          <h2 className="lp-display mb-10" style={{ fontSize: 'clamp(34px, 5.5vw, 64px)' }}>{c.cta.title}</h2>
          <div className="w-full flex justify-center"><ClaimForm c={c} dark label={c.cta.claim} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-6 mt-16 pt-10 w-full max-w-[760px]" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {c.stats.map(({ value, label }) => (
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
            <span className="lp-display text-[16px]" style={{ letterSpacing: '-0.02em' }}>Beam</span>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {c.footer.links.map(([href, label]) => (
              <Link key={href} href={href === '/login' ? `/login?lang=${c.locale}` : href} className="text-[13px] hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-muted)' }}>{label}</Link>
            ))}
            <span aria-hidden style={{ color: 'var(--lp-line)' }}>|</span>
            {([['en', 'English'], ['zh-TW', '中文'], ['th', 'ไทย'], ['ja', '日本語']] as const).filter(([l]) => l !== c.locale).map(([l, label]) => (
              <Link key={l} href={`/${l}`} hrefLang={l} className="text-[13px] hover:opacity-60 transition-opacity" style={{ color: 'var(--lp-muted)' }}>{label}</Link>
            ))}
          </nav>
          <p className="text-[13px]" style={{ color: 'var(--lp-muted)' }}>&copy; 2026 Beam</p>
        </div>
      </footer>
    </div>
  )
}
