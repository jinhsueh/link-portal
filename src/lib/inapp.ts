/**
 * Beam glue around the vendored shared module `./inapp-escape.js` (never edit that file here).
 *
 * Google sign-in is blocked inside IG / Threads / FB / LINE / TikTok in-app browsers
 * (403 disallowed_useragent). /login intercepts the Google button and shows an
 * "open in your browser" sheet; /api/auth/google/start bounces named in-app UAs back
 * to /login before the OAuth state cookie is set. Public profiles (/[username]) never
 * load any of this: fans browse those in-app and must not be bounced.
 *
 * Pure + dependency-free on purpose so `node --test src/lib/inapp.test.mjs` can run it
 * (hence the explicit `.js` extension below; TS resolves it to inapp-escape.d.ts).
 */
import { detectInApp } from './inapp-escape.js'
import type { InAppInfo, SheetLang } from './inapp-escape.js'

export const KNOWN_ESCAPE_METHODS = ['xsafari', 'xsafari-window', 'intent', 'ig'] as const

/** INAPP_DISABLED_METHODS="ig,xsafari" (runtime env, server-only) -> validated method list. */
export function parseDisabledMethods(raw: string | null | undefined): string[] {
  const known: readonly string[] = KNOWN_ESCAPE_METHODS
  return (raw ?? '').split(',').map(s => s.trim()).filter(m => known.includes(m))
}

/** Beam locale -> sheet UI language (the module ships zh / en / ja / th strings). */
export function toSheetLang(locale: string | null | undefined): SheetLang {
  return locale === 'zh-TW' ? 'zh' : locale === 'ja' ? 'ja' : locale === 'th' ? 'th' : 'en'
}

/**
 * Server guard for GET /api/auth/google/start. Returns the /login bounce target, or null to
 * continue into Google. Only NAMED app tokens where Google is known to block are guarded:
 * heuristic webview guesses and soft apps (WhatsApp, NAVER, Telegram, ...) pass through so a
 * false positive can never lock a real browser out of Google.
 * `lang` must already be a validated Beam locale (e.g. 'zh-TW').
 */
export function googleStartGuard(
  ua: string | null | undefined,
  opts: { lang?: string | null; off?: boolean } = {},
): { location: string; info: InAppInfo } | null {
  if (opts.off) return null
  const info = detectInApp(ua ?? '', null)
  if (!info.inApp || info.googleBlocked !== true || info.heuristic) return null
  const q = new URLSearchParams({ ia_google: '1' })
  if (opts.lang) q.set('lang', opts.lang)
  return { location: `/login?${q}`, info }
}

// ── Events ──────────────────────────────────────────────────────────────────
// Vercel team is on Hobby (custom track() events need Pro), so events go to a tiny
// beacon endpoint (/api/track/inapp) that writes one console.info JSON line each.

export const INAPP_EVENTS = [
  'inapp_detected', 'escape_sheet_shown', 'escape_attempted', 'escape_no_handoff', 'escape_copy_link',
  'escape_landed', 'escape_failed', 'google_blocked_fallback', 'escape_continue_anyway', 'carry_truncated',
] as const
const PROP_KEYS = ['app', 'os', 'method', 'confidence', 'trigger', 'from', 'still', 'alt', 'reason', 'dropped', 'googleBlocked'] as const
const MAX_BODY = 2048

export interface InAppEventLine {
  event: string
  path: string | null
  props: Record<string, string | boolean | null>
}

/** Validate a beacon body ({ e, p, path }) -> whitelisted event, or null to drop it. */
export function sanitizeInAppEvent(raw: string): InAppEventLine | null {
  if (!raw || raw.length > MAX_BODY) return null
  let body: unknown
  try { body = JSON.parse(raw) } catch { return null }
  if (!body || typeof body !== 'object') return null
  const { e, p, path } = body as { e?: unknown; p?: unknown; path?: unknown }
  const events: readonly string[] = INAPP_EVENTS
  if (typeof e !== 'string' || !events.includes(e)) return null
  const props: InAppEventLine['props'] = {}
  if (p && typeof p === 'object') {
    for (const k of PROP_KEYS) {
      const v = (p as Record<string, unknown>)[k]
      if (typeof v === 'string') props[k] = v.slice(0, 64)
      else if (typeof v === 'boolean' || v === null) props[k] = v
    }
  }
  const safePath = typeof path === 'string' && /^\/[\w\-/]{0,64}$/.test(path) ? path : null
  return { event: e, path: safePath, props }
}

/**
 * Client sink for the module's onEvent. escape_attempted fires in the same tick as the
 * navigation to Safari/Chrome, so this must survive unload: sendBeacon, keepalive fallback.
 */
export function sendInAppEvent(name: string, props: Record<string, unknown>): void {
  if (typeof navigator === 'undefined') return
  const body = JSON.stringify({ e: name, p: props, path: location.pathname })
  try { if (navigator.sendBeacon?.('/api/track/inapp', body)) return } catch { /* fall through */ }
  try {
    void fetch('/api/track/inapp', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } })
      .catch(() => {})
  } catch { /* never break the sheet over analytics */ }
}
