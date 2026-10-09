import type { Locale } from '@/lib/i18n'

/** Every string on the marketing landing, per locale. Keep lines short — the page is image-first. */
export type LandingCopy = {
  locale: Locale
  nav: { features: string; pricing: string; video: string; login: string; start: string }
  hero: {
    chip: string; h1a: string; h1b: string; sub: string
    claim: string; claimShort: string; claimAria: string
    trust: string[]; watch: string
  }
  floats: { sale: string; saleItem: string; sub: string; subText: string }
  strip: string
  video: { eyebrow: string; title: string }
  /** rows order is fixed: sell, list, analytics, themes, import (matches SHOTS in Landing.tsx) */
  show: { eyebrow: string; title: string; rows: { title: string; line: string; chips?: string[] }[] }
  /** alt text for the five product shots, same order as show.rows */
  alt: string[]
  /** 12 labels, order matches BLOCK_ICONS */
  blocks: { label: string; items: string[] }
  steps: { eyebrow: string; title: string; demo: string; items: string[] }
  who: {
    eyebrow: string; title: string; build: string
    items: { title: string; line: string; sample: { name: string; handle: string; blocks: string[] } }[]
  }
  compare: { eyebrow: string; title: string; head: [string, string, string]; rows: { feature: string; us: string | boolean; them: string | boolean }[] }
  pricing: {
    eyebrow: string; title: string; sub: string; popular: string; noCard: string; full: string
    annual: (n: number) => string
    plans: { name: string; tagline: string; per: string; fee: string; items: string[]; cta: string }[]
  }
  faq: { eyebrow: string; title: string; contact: string; contactLink: string; items: { q: string; a: string }[] }
  cta: { title: string; claim: string }
  stats: { value: string; label: string }[]
  footer: { links: [string, string][] }
}
