/**
 * Single source of truth for the public site URL.
 *
 * Set NEXT_PUBLIC_SITE_URL when you move off the Vercel preview domain.
 * Everywhere that builds canonical URLs, OG tags, schema, robots, or sitemap
 * should import SITE_URL from here — never hard-code the domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://link-portal-eight.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Link Portal'

/** Social profile URLs for Organization.sameAs. Fill in as accounts go live. */
export const SOCIAL_LINKS: string[] = [
  // 'https://www.instagram.com/linkportal',
  // 'https://www.threads.net/@linkportal',
  // 'https://www.linkedin.com/company/linkportal',
  // 'https://twitter.com/linkportal',
]

export const CONTACT_EMAIL = 'hello@linkportal.tw'
