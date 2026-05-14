/**
 * i18n core — locale list, default, dictionary loader.
 *
 * Pattern: Next.js 16 docs' "manual" approach (no next-intl dependency).
 * Dictionaries live in /messages/{locale}.json and are loaded server-side
 * via dynamic import so each locale ships only when used.
 *
 * Adding a new locale = 3 edits:
 *   1. Add the code below to LOCALES.
 *   2. Create messages/{locale}.json (mirror messages/en.json keys).
 *   3. Add a label + flag emoji to LOCALE_META.
 * The proxy middleware (src/proxy.ts) and language switcher pick it up
 * automatically.
 */

export const LOCALES = ['en', 'ja', 'th', 'zh-TW'] as const
export type Locale = (typeof LOCALES)[number]

/** Default when Accept-Language detection finds no match. English-first. */
export const DEFAULT_LOCALE: Locale = 'en'

/** Type guard — narrow an unknown string to Locale. */
export function isLocale(s: string | null | undefined): s is Locale {
  return !!s && (LOCALES as readonly string[]).includes(s)
}

/** Display metadata for the language switcher UI. */
export const LOCALE_META: Record<Locale, { label: string; native: string; flag: string }> = {
  'en':    { label: 'English',           native: 'English',  flag: '🇺🇸' },
  'ja':    { label: 'Japanese',          native: '日本語',    flag: '🇯🇵' },
  'th':    { label: 'Thai',              native: 'ภาษาไทย',   flag: '🇹🇭' },
  'zh-TW': { label: 'Traditional Chinese', native: '繁體中文', flag: '🇹🇼' },
}

/**
 * Dictionary loader. Server-side only (uses dynamic import). For client
 * components, pass the loaded dictionary as a prop or via context.
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  'en':    () => import('@/../messages/en.json').then(m => m.default),
  'ja':    () => import('@/../messages/ja.json').then(m => m.default),
  'th':    () => import('@/../messages/th.json').then(m => m.default),
  'zh-TW': () => import('@/../messages/zh-TW.json').then(m => m.default),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const load = loaders[locale] ?? loaders[DEFAULT_LOCALE]
  return load()
}

/** Shape of a dictionary JSON file. Keep `en.json` as the source of truth —
 *  every other locale must mirror its key structure. TS doesn't enforce this
 *  across JSON imports, so we document it here and rely on translators to
 *  not drop keys. */
export type Dictionary = typeof import('@/../messages/en.json')
