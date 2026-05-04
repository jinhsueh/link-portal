/**
 * Single source of truth for the public site URL and brand name.
 *
 * Override `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_HOST` via Vercel env vars
 * if the primary domain is not yet wired up (e.g. fall back to beam.bio while
 * we wait for beam.io to come through). Everywhere that builds canonical URLs,
 * OG tags, schema, robots, or sitemap should import these constants from here —
 * never hard-code the domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://beam.io'
).replace(/\/$/, '')

export const SITE_NAME = 'Beam'

/** Bare host shown to users for their public profile URL (e.g. beam.io/yourname). */
export const SITE_HOST = process.env.NEXT_PUBLIC_SITE_HOST ?? 'beam.io'

/** Social profile URLs for Organization.sameAs. Fill in as accounts go live. */
export const SOCIAL_LINKS: string[] = [
  // 'https://www.instagram.com/beam',
  // 'https://www.threads.net/@beam',
  // 'https://www.linkedin.com/company/beam',
  // 'https://twitter.com/beam',
]

export const CONTACT_EMAIL = 'hello@beam.io'
