import type { Metadata } from 'next'
import { ProfileView, type ProfileViewProps } from '@/components/profile/ProfileView'
import { BlockData } from '@/types'

// Static demo profile — does NOT depend on the database.
// Used by the landing page hero iframe and as a permanent showcase URL.
// To preview a real, dynamic profile, log in and visit /<your-username>.

export const metadata: Metadata = {
  title: 'Mia 米亞 | Beam Demo',
  description: '一頁展示 Beam 能做的所有事 — 連結、商品、影片、表單、Podcast、合作邀約。',
  robots: { index: false, follow: true },
}

const THEME_JSON = JSON.stringify({
  primaryColor: '#E84393',
  bgType: 'gradient',
  bgColor: '#FFF5F7',
  bgGradient: 'linear-gradient(135deg, #FFF5F7 0%, #FFECD2 50%, #FCB69F 100%)',
  buttonStyle: 'rounded',
  fontStyle: 'modern',
})

const mainBlocks: BlockData[] = [
  {
    id: 'demo-block-0',
    type: 'heading',
    title: '嗨，我是米亞 💕',
    content: { text: '穿搭 × 美妝 × 生活美學，陪你變成更好的自己' } as never,
    order: 0,
    active: true,
    clicks: 0,
    views: 0,
  },
  {
    id: 'demo-block-1',
    type: 'link',
    title: '🎬 YouTube — 米亞的穿搭日記',
    content: { url: 'https://youtube.com/@mia-style' } as never,
    order: 1,
    active: true,
    clicks: 2847,
    views: 8920,
  },
  {
    id: 'demo-block-2',
    type: 'link',
    title: '🎧 Podcast — 女生聊心事',
    content: { url: 'https://open.spotify.com' } as never,
    order: 2,
    active: true,
    clicks: 1356,
    views: 4210,
  },
  {
    id: 'demo-block-3',
    type: 'banner',
    title: '🌸 春夏穿搭企劃 — 10 套一週 Look',
    content: {
      url: 'https://example.com/spring-lookbook',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop',
      description: '平價混搭高質感，每套不超過 NT$3,000',
    } as never,
    order: 3,
    active: true,
    clicks: 1534,
    views: 5890,
  },
  {
    id: 'demo-block-4',
    type: 'product',
    title: '米亞的穿搭公式電子書',
    content: {
      price: 299,
      currency: 'NT$',
      description: '30 頁穿搭邏輯 + 配色指南 + 膠囊衣櫥清單。已賣出 1,200+ 份！',
      checkoutUrl: 'https://example.com/buy/style-ebook',
    } as never,
    order: 4,
    active: true,
    clicks: 876,
    views: 3456,
  },
  {
    id: 'demo-block-5',
    type: 'product',
    title: 'Lightroom 濾鏡預設包 — 奶茶色系',
    content: {
      price: 199,
      currency: 'NT$',
      description: '12 款 IG 風格濾鏡，一鍵套用，讓你的照片質感 UP ✨',
      checkoutUrl: 'https://example.com/buy/presets',
    } as never,
    order: 5,
    active: true,
    clicks: 643,
    views: 2178,
  },
  {
    id: 'demo-block-6',
    type: 'video',
    title: '最新影片：韓國首爾 3 天穿搭 Vlog',
    content: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    } as never,
    order: 6,
    active: true,
    clicks: 1267,
    views: 4890,
  },
  {
    id: 'demo-block-7',
    type: 'link',
    title: '👗 蝦皮精選好物清單',
    content: { url: 'https://shopee.tw' } as never,
    order: 7,
    active: true,
    clicks: 2145,
    views: 6320,
  },
  {
    id: 'demo-block-8',
    type: 'link',
    title: '💄 小紅書 — 美妝真實評測',
    content: { url: 'https://xiaohongshu.com' } as never,
    order: 8,
    active: true,
    clicks: 945,
    views: 2920,
  },
  {
    id: 'demo-block-9',
    type: 'email_form',
    title: '💌 訂閱米亞週報',
    content: {
      placeholder: '輸入你的 Email',
      buttonText: '免費訂閱',
      description: '每週分享私藏好物、穿搭靈感、限時折扣碼。已有 5,600+ 訂閱者！',
    } as never,
    order: 9,
    active: true,
    clicks: 0,
    views: 0,
  },
  {
    id: 'demo-block-10',
    type: 'link',
    title: '☕ Buy Me a Coffee',
    content: { url: 'https://buymeacoffee.com' } as never,
    order: 10,
    active: true,
    clicks: 312,
    views: 1890,
  },
]

const collabBlocks: BlockData[] = [
  {
    id: 'demo-collab-0',
    type: 'heading',
    title: '品牌合作',
    content: { text: '💼 歡迎美妝、服飾、生活品牌合作洽詢' } as never,
    order: 0,
    active: true,
    clicks: 0,
    views: 0,
  },
  {
    id: 'demo-collab-1',
    type: 'link',
    title: '📊 合作數據 — IG 12 萬 / YT 8 萬 / Podcast 2 萬',
    content: { url: 'https://example.com/media-kit' } as never,
    order: 1,
    active: true,
    clicks: 534,
    views: 1270,
  },
  {
    id: 'demo-collab-2',
    type: 'link',
    title: '📄 下載媒體資料包 (Media Kit)',
    content: { url: 'https://example.com/media-kit.pdf' } as never,
    order: 2,
    active: true,
    clicks: 267,
    views: 810,
  },
  {
    id: 'demo-collab-3',
    type: 'link',
    title: '📸 過往合作案例集',
    content: { url: 'https://example.com/portfolio' } as never,
    order: 3,
    active: true,
    clicks: 189,
    views: 560,
  },
  {
    id: 'demo-collab-4',
    type: 'link',
    title: '📧 合作信箱 — mia@example.com',
    content: { url: 'mailto:mia@example.com' } as never,
    order: 4,
    active: true,
    clicks: 145,
    views: 445,
  },
]

const DEMO_PROFILE: ProfileViewProps = {
  username: 'demo',
  name: 'Mia 米亞',
  bio: '生活美學 × 穿搭靈感 🌸 IG 12 萬追蹤 ✦ YouTube 週更 ✦ 合作邀約歡迎私訊 💌',
  avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=face',
  // Theme moved to account-level — same JSON used to live per-page on each
  // demo page entry, now lives once on the profile.
  theme: THEME_JSON,
  pages: [
    {
      id: 'demo-page-main',
      name: '主頁',
      slug: 'home',
      isDefault: true,
      order: 0,
      theme: THEME_JSON,
      blocks: mainBlocks,
    },
    {
      id: 'demo-page-collab',
      name: '合作邀約',
      slug: 'collab',
      isDefault: false,
      order: 1,
      theme: THEME_JSON,
      blocks: collabBlocks,
    },
  ],
  socialLinks: [
    { id: 'demo-s-1', platform: 'instagram', url: 'https://instagram.com/mia.style.tw' },
    { id: 'demo-s-2', platform: 'youtube', url: 'https://youtube.com/@mia-style' },
    { id: 'demo-s-3', platform: 'tiktok', url: 'https://tiktok.com/@mia.style' },
    { id: 'demo-s-4', platform: 'threads', url: 'https://threads.net/@mia.style.tw' },
    { id: 'demo-s-5', platform: 'spotify', url: 'https://open.spotify.com' },
  ],
  showWatermark: false,
  isDemo: true,
}

interface DemoPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
  const { page: pageSlug } = await searchParams
  return <ProfileView {...DEMO_PROFILE} activePageSlug={pageSlug} />
}
