import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/site'
import { PLAN_PRICING } from '@/lib/plan'

export const metadata: Metadata = {
  title: '定價方案｜Free / Pro / Premium',
  description:
    'Link Portal 提供永久免費的基礎方案，Pro NT$159/月、Premium NT$249/月。比較三個方案的功能差異，選擇適合你的 Link in Bio 工具。',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Link Portal 定價方案 — 永久免費起',
    description: 'Free / Pro NT$159 / Premium NT$249，比較三個方案功能選擇最適合的。',
    url: '/pricing',
    type: 'website',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '首頁',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '定價',
            item: `${SITE_URL}/pricing`,
          },
        ],
      },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/pricing#product`,
        name: `${SITE_NAME} 訂閱方案`,
        description:
          'Link Portal 提供 Free、Pro、Premium 三種方案，滿足從入門創作者到品牌團隊的需求。',
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
