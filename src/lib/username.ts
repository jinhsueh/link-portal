/**
 * Single source of truth for username validation — used by password
 * signup, the availability probe, and social-login username pick.
 */
export const USERNAME_RE = /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/

export const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'login', 'logout', 'signup', 'register',
  'about', 'contact', 'pricing', 'privacy', 'terms', 'demo',
  'super-admin', 'en', 'ja', 'th', 'zh-tw', 'settings', 'dashboard',
])

export function normalizeUsername(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : ''
}

export type UsernameProblem = 'invalid' | 'reserved' | null

export function validateUsername(username: string): UsernameProblem {
  if (!username || !USERNAME_RE.test(username) || username.length < 3 || username.length > 30) return 'invalid'
  if (RESERVED_USERNAMES.has(username)) return 'reserved'
  return null
}

/** Derive a candidate username from an email local part (for prefill only). */
export function suggestUsernameFromEmail(email: string | null | undefined): string {
  const local = (email ?? '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '').replace(/^\.+|\.+$/g, '').replace(/\.{2,}/g, '.')
  return local.slice(0, 30)
}
