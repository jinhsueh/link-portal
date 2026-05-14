import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

async function resolveLocale(): Promise<Locale> {
  const c = await cookies()
  const cookieLocale = c.get('lp_locale')?.value
  if (isLocale(cookieLocale)) return cookieLocale
  const h = await headers()
  const acceptLanguage = h.get('accept-language') ?? ''
  if (!acceptLanguage) return DEFAULT_LOCALE
  try {
    const langs = new Negotiator({ headers: { 'accept-language': acceptLanguage } }).languages()
    const matched = matchLocale(langs, LOCALES as unknown as string[], DEFAULT_LOCALE)
    return isLocale(matched) ? matched : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  const a = dict.about
  return {
    title: a.metaTitle,
    description: a.metaDescription,
    alternates: { canonical: '/about' },
    openGraph: {
      title: a.ogTitle,
      description: a.ogDescription,
      url: '/about',
      type: 'website',
    },
  }
}

export default async function AboutPage() {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  const a = dict.about
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: a.breadcrumbHome, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: a.breadcrumbCurrent, item: `${SITE_URL}/about` },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            {a.breadcrumbHome}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{a.breadcrumbCurrent}</span>
        </nav>

        <h1 className="mb-6 text-4xl font-bold tracking-tight">{a.h1Prefix}{SITE_NAME}</h1>

        <p className="mb-6 text-lg leading-relaxed text-gray-700">
          {a.intro.replace('{name}', SITE_NAME)}
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-semibold">{a.missionTitle}</h2>
        <p className="mb-6 leading-relaxed text-gray-700">
          {a.missionBody}
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-semibold">{a.whyTitle.replace('{name}', SITE_NAME)}</h2>
        <ul className="mb-6 space-y-3 text-gray-700">
          {a.whyItems.map((item, i) => (
            <li key={i}>
              <strong>{item.bold}</strong>{item.rest}
            </li>
          ))}
        </ul>

        <h2 className="mt-12 mb-4 text-2xl font-semibold">{a.nextTitle}</h2>
        <p className="mb-8 leading-relaxed text-gray-700">
          {a.nextBody}
          <Link href="/" className="ml-1 text-purple-600 underline hover:text-purple-700">
            {a.nextLink1}
          </Link>
          {a.nextLinkBetween}
          <Link
            href="/pricing"
            className="ml-1 text-purple-600 underline hover:text-purple-700"
          >
            {a.nextLink2}
          </Link>
          {a.nextEnd}
        </p>
      </main>
    </>
  )
}
