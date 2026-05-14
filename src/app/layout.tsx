import type { Metadata, Viewport } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { SITE_URL, SITE_NAME, SOCIAL_LINKS, CONTACT_EMAIL } from '@/lib/site'
import { ToastHost } from '@/components/ui/Toast'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Beam — Free link-in-bio for creators | One page for IG, YouTube, products, audience',
    template: '%s | Beam',
  },
  description:
    'Build your link-in-bio page for free. One link to unite Instagram, YouTube, Podcasts, digital products, and your email list. The Linktree alternative built for creators worldwide.',
  keywords: [
    'link in bio',
    'link in bio tool',
    'creator link page',
    'IG link aggregator',
    'social media links',
    'bio link',
    'personal brand',
    'sell digital products',
    'Linktree alternative',
    'Beam',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Beam — Free link-in-bio for creators',
    description: 'One link for every fan touchpoint. Social, products, email list — built free. 30 seconds to live.',
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beam — Free link-in-bio for creators',
    description: 'One link for every fan touchpoint. Built free. 30 seconds to live.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#5090FF',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  '@id': `${SITE_URL}/#software`,
                  name: SITE_NAME,
                  applicationCategory: 'WebApplication',
                  applicationSubCategory: 'Link in Bio Tool',
                  operatingSystem: 'Web',
                  description:
                    'Free link-in-bio tool. One link to unite IG, YouTube, Podcasts, digital products, and your email list.',
                  url: SITE_URL,
                  inLanguage: 'en',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                  offers: [
                    {
                      '@type': 'Offer',
                      name: 'Free',
                      price: '0',
                      priceCurrency: 'TWD',
                      description: 'Forever-free starter plan. 1 page, 12 blocks.',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Pro',
                      price: '159',
                      priceCurrency: 'TWD',
                      description: 'Pro monthly: 10 pages, 20 blocks per page, watermark removed.',
                    },
                    {
                      '@type': 'Offer',
                      name: 'Premium',
                      price: '249',
                      priceCurrency: 'TWD',
                      description: 'Premium monthly: unlimited pages and blocks, custom domain.',
                    },
                  ],
                  featureList: [
                    'Diverse block types (link, banner, video, product, form)',
                    'Theme customization with brand styling',
                    'Real-time analytics tracking',
                    'Built-in checkout to sell digital products',
                    'Email subscribe form to grow your audience',
                    'Multi-page management',
                  ],
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'What is Beam?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Beam is a free link-in-bio tool that lets creators unite every social platform, sell digital products, and collect emails — all from one page.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Is Beam free?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. Beam offers a forever-free starter plan. No credit card required. Build your page in 30 seconds.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Can I sell things on Beam?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. Beam has built-in checkout — sell courses, e-books, templates, and other digital products right from your page.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How does Beam differ from Linktree?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Beam is design-first and built for international creators with 4-language support (English, Japanese, Thai, Traditional Chinese), built-in payments, audience collection, and multi-page management. Core features are forever-free.',
                      },
                    },
                  ],
                },
                {
                  '@type': 'Organization',
                  '@id': `${SITE_URL}/#organization`,
                  name: SITE_NAME,
                  url: SITE_URL,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${SITE_URL}/icon.png`,
                  },
                  description:
                    'A design-first link-in-bio tool for global creators. Unite social links, sell digital products, and grow your audience from one beautiful page.',
                  sameAs: SOCIAL_LINKS,
                  contactPoint: {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: CONTACT_EMAIL,
                    availableLanguage: ['en', 'ja', 'th', 'zh-Hant'],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: SITE_NAME,
                  inLanguage: 'en',
                  publisher: { '@id': `${SITE_URL}/#organization` },
                },
              ],
            }),
          }}
        />
        {children}
        <ToastHost />
      </body>
    </html>
  )
}
