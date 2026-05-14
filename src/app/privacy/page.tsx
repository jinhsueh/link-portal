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
  const p = dict.privacy
  return {
    title: p.metaTitle,
    description: p.metaDescriptionTpl.replace('{name}', SITE_NAME),
    alternates: { canonical: '/privacy' },
    robots: { index: true, follow: true },
  }
}

export default async function PrivacyPage() {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)
  const p = dict.privacy
  const subst = (s: string) => s.replace(/\{name\}/g, SITE_NAME)
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: p.breadcrumbHome, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: p.breadcrumbCurrent, item: `${SITE_URL}/privacy` },
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
            {p.breadcrumbHome}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{p.breadcrumbCurrent}</span>
        </nav>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">{p.h1}</h1>
        <p className="mb-10 text-sm text-gray-500">{p.lastUpdated}</p>

        <section className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p>{subst(p.intro)}</p>

          {p.sections.map((sec, i) => {
            const isContact = 'emailTrailer' in sec && sec.emailTrailer !== undefined
            return (
              <div key={i} className="space-y-3">
                <h2 className="text-2xl font-semibold">{sec.title}</h2>
                {sec.body && !isContact && <p>{subst(sec.body)}</p>}
                {isContact && (
                  <p>
                    {subst(sec.body ?? '')}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-purple-600 underline hover:text-purple-700"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    {sec.emailTrailer}
                  </p>
                )}
                {sec.items && (
                  <ul className="list-disc space-y-2 pl-6">
                    {sec.items.map((it, j) => (
                      <li key={j}>
                        {typeof it === 'string' ? subst(it) : (
                          <>
                            <strong>{subst(it.bold)}</strong>{subst(it.rest)}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </section>
      </main>
    </>
  )
}
