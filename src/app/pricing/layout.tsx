import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { PLAN_PRICING } from '@/lib/plan'
import { DictProvider } from '@/components/i18n/DictProvider'
import { LOCALES, DEFAULT_LOCALE, getDictionary, isLocale, type Locale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Pricing｜Free / Pro / Premium',
  description:
    'Beam offers a forever-free plan, Pro at NT$159/mo, and Premium at NT$249/mo. Compare features across three plans and pick the right Link in Bio for you.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Beam Pricing — Free forever',
    description: 'Free / Pro NT$159 / Premium NT$249 — compare features across the three plans.',
    url: '/pricing',
    type: 'website',
  },
}

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

export default async function PricingLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveLocale()
  const dict = await getDictionary(locale)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Pricing',
            item: `${SITE_URL}/pricing`,
          },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/pricing#product`,
        name: `${SITE_NAME} subscription plans`,
        description:
          'Beam offers Free, Pro, and Premium plans — fitting beginners through brand teams.',
        brand: { '@type': 'Brand', name: SITE_NAME },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'TWD',
          lowPrice: '0',
          highPrice: String(PLAN_PRICING.premium.monthly),
          offerCount: 3,
          offers: [
            {
              '@type': 'Offer',
              name: 'Free',
              price: '0',
              priceCurrency: 'TWD',
              url: `${SITE_URL}/pricing`,
              availability: 'https://schema.org/InStock',
            },
            {
              '@type': 'Offer',
              name: 'Pro',
              price: String(PLAN_PRICING.pro.monthly),
              priceCurrency: 'TWD',
              url: `${SITE_URL}/pricing`,
              availability: 'https://schema.org/InStock',
            },
            {
              '@type': 'Offer',
              name: 'Premium',
              price: String(PLAN_PRICING.premium.monthly),
              priceCurrency: 'TWD',
              url: `${SITE_URL}/pricing`,
              availability: 'https://schema.org/InStock',
            },
          ],
        },
      },
    ],
  }

  return (
    <DictProvider value={{ dict, locale }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </DictProvider>
  )
}
