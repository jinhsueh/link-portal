import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/site'
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
  const c = dict.contact
  return {
    title: c.metaTitle,
    description: c.metaDescription.replace('{name}', SITE_NAME).replace('{email}', CONTACT_EMAIL),
    alternates: { canonical: '/contact' },
    openGraph: {
      title: c.ogTitle.replace('{name}', SITE_NAME),
      description: c.ogDescription,
      url: '/contact',
      type: 'website',
    },
  }
}

export default async function ContactPage() {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  const c = dict.contact
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: c.breadcrumbHome, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: c.breadcrumbCurrent, item: `${SITE_URL}/contact` },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            {c.breadcrumbHome}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{c.breadcrumbCurrent}</span>
        </nav>

        <h1 className="mb-6 text-4xl font-bold tracking-tight">{c.h1}</h1>

        <p className="mb-10 text-lg leading-relaxed text-gray-700">
          {c.intro}
        </p>

        <section className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-xl font-semibold">{c.supportTitle}</h2>
          <p className="mb-3 text-gray-700">
            {c.supportBody}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-purple-600 underline hover:text-purple-700"
          >
            {CONTACT_EMAIL}
          </a>
        </section>

        <section className="mb-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-xl font-semibold">{c.businessTitle}</h2>
          <p className="mb-3 text-gray-700">
            {c.businessBody}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-purple-600 underline hover:text-purple-700"
          >
            {CONTACT_EMAIL}
          </a>
        </section>

        <p className="text-sm text-gray-500">
          {c.footer}
        </p>
      </main>
    </>
  )
}
