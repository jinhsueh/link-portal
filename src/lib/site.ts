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
  process.env.NEXT_PUBLIC_SITE_URL
  // On Vercel, fall back to the project's production URL so absolute URLs in
  // OG tags / sitemap resolve to a live host until beam.io is wired up.
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
  ?? 'https://beam.io'
).replace(/\/$/, '')

export const SITE_NAME = 'Beam'

/**
 * Brand OG image (rendered by app/opengraph-image.tsx). Pages that define
 * their own `openGraph` object must reference this explicitly — Next.js
 * shallow-merges `openGraph`, so a child override drops the parent's
 * file-convention image.
 */
export const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'Beam — Free link-in-bio for creators' }

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
