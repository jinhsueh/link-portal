import { PLAN_PRICING } from '@/lib/plan'
import { SITE_HOST } from '@/lib/site'
import type { LandingCopy } from './types'

export const en: LandingCopy = {
  locale: 'en',
  nav: { features: 'Features', pricing: 'Pricing', video: 'Video', login: 'Log in', start: 'Start free' },
  hero: {
    chip: 'Switching from Linktree? Import in 30s',
    h1a: 'Turn your audience',
    h1b: 'into income.',
    sub: 'The link-in-bio for creators who want to earn — sell, land brand deals, own your list.',
    claim: 'Claim my page', claimShort: 'Claim', claimAria: 'Choose your username',
    trust: ['Free forever', 'No credit card', 'Live in 30 seconds'],
    watch: 'Watch the 45s video',
  },
  floats: { sale: 'New sale', saleItem: 'Notion Bundle', sub: 'New subscriber', subText: 'Joined your list' },
  strip: 'Built for creators on',
  video: { eyebrow: 'Watch', title: 'Beam in 45 seconds.' },
  show: {
    eyebrow: 'Features',
    title: 'Three ways your following pays you back.',
    rows: [
      { title: 'Sell in one tap.', line: 'Stripe checkout on every plan — even Free.' },
      { title: 'Own your list.', line: 'Every subscriber is yours. Export anytime.' },
      { title: 'See what earns.', line: 'Clicks and orders per block — real numbers for brand deals.' },
      { title: 'Make it yours.', line: '8 themes or fully custom.' },
      { title: 'Bring your Linktree.', line: 'Import in about 30 seconds.', chips: ['Linktree', 'Portaly', 'OpenLink'] },
    ],
  },
  alt: [
    'A digital product block and Stripe checkout showing payment complete',
    'Subscribers list filling from the email form on a Beam page',
    'Analytics: clicks, views, subscribers and block ranking',
    'The same Beam page in five themes',
    'Importing a Linktree page into Beam',
  ],
  blocks: {
    label: '12 block types, drag to reorder',
    items: ['Link button', 'Banner', 'Heading', 'Video embed', 'Product', 'Email form', 'Countdown', 'FAQ', 'Carousel', 'Map embed', 'HTML embed', 'Add to calendar'],
  },
  steps: { eyebrow: 'How it works', title: 'Live in three steps.', demo: 'Open the live demo', items: ['Claim your username', 'Add your blocks', 'Share one link'] },
  who: {
    eyebrow: "Who it's for", title: 'Made for creators who earn.', build: 'Build yours',
    items: [
      { title: 'Lifestyle & beauty creators', line: 'Affiliate picks + brand deals.', sample: { name: 'Mia Chen', handle: '@miachen.style', blocks: ['My skincare picks', 'Work with me', 'Latest TikTok'] } },
      { title: 'Educators & coaches', line: 'Courses, templates, coaching.', sample: { name: 'Alex Wong', handle: '@alexcoaches', blocks: ['Notion Templates — $29', 'Coaching call (60 min)', 'Free newsletter'] } },
      { title: 'Artists & illustrators', line: 'Digital downloads + a fan list.', sample: { name: 'Rae Lin', handle: '@rae.draws', blocks: ['Procreate brush pack — $12', 'Live drawing stream · Fri', 'Join my newsletter'] } },
    ],
  },
  compare: {
    eyebrow: 'Compare', title: 'Beam vs. the alternatives', head: ['Feature', 'Beam', 'Others'],
    rows: [
      { feature: 'Free plan', us: 'Forever', them: 'Limited' },
      { feature: 'Sell digital products', us: 'All plans', them: 'Paid only' },
      { feature: 'Email list capture', us: 'All plans', them: 'Paid only' },
      { feature: 'Add-to-Calendar block', us: true, them: false },
      { feature: 'Linktree / Portaly / OpenLink import', us: true, them: false },
      { feature: 'Multi-page (tabs)', us: 'Up to unlimited', them: 'No' },
      { feature: 'Custom domain', us: 'Premium', them: 'Top tier only' },
    ],
  },
  pricing: {
    eyebrow: 'Pricing', title: 'Every plan can sell.', sub: 'Platform fee drops as you grow: 10% → 5% → 2%.',
    popular: 'Most popular', noCard: 'No credit card needed', full: 'Full comparison & fee calculator',
    annual: n => `NT$${n}/mo billed annually`,
    plans: [
      { name: 'Free', tagline: 'Start earning', per: '/ forever', fee: '10% fee on sales', items: ['1 page, 12 blocks', 'Sell & capture emails', '30-day analytics'], cta: 'Start free' },
      { name: 'Pro', tagline: 'Earning every month', per: '/ mo', fee: '5% fee on sales', items: ['10 pages', 'All 12 block types', '90-day analytics', 'Remove branding'], cta: 'Upgrade to Pro' },
      { name: 'Premium', tagline: 'Creators with a team', per: '/ mo', fee: '2% fee on sales', items: ['Unlimited pages', 'Unlimited team members', 'Custom domain', 'Priority support'], cta: 'Upgrade to Premium' },
    ],
  },
  faq: {
    eyebrow: 'FAQ', title: 'Questions, answered.', contact: 'Something else?', contactLink: 'Get in touch',
    items: [
      { q: 'Is there really a free plan?', a: 'Yes — free forever. 1 page, 12 blocks, 8 core block types including product sales and email capture, with a 10% platform fee on sales. No credit card required.' },
      { q: 'Can I import my existing Linktree?', a: 'Yes. Paste your linktr.ee, portaly.cc, or openlink.co URL, we pull over your links, social icons, profile name, bio, and avatar. The whole thing takes about 30 seconds.' },
      { q: 'How do you compare to Linktree on price?', a: `Our Pro plan starts at NT$${PLAN_PRICING.pro.monthly}/mo, which is comparable to Linktree Starter — but you also get product sales (5% platform fee), team members, and the Add-to-Calendar block.` },
      { q: 'Can I sell digital products?', a: 'On every plan. Free pages can sell with a 10% platform fee. Pro drops it to 5%, Premium to 2%. Stripe handles checkout — payouts go straight to your account.' },
      { q: 'Do I need to know any code?', a: 'No. Everything is drag-and-drop with live preview. If you do want custom CSS or iframes, the HTML Embed block on Premium has you covered.' },
      { q: 'Can I use my own domain?', a: `Pro plans get a clean ${SITE_HOST}/yourname URL. Premium adds custom domain support — point your own domain at your portal.` },
    ],
  },
  cta: { title: 'Your page in 30 seconds.', claim: 'Claim it' },
  stats: [
    { value: '12', label: 'Block types' },
    { value: 'From 2%', label: 'Platform fee' },
    { value: '< 1s', label: 'Page load' },
    { value: 'NT$0', label: 'To start' },
  ],
  footer: { links: [['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact'], ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/login', 'Log in']] },
}
