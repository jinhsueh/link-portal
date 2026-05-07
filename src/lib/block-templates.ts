/**
 * Starter templates — the empty-state CTA on /admin offers these so first-time
 * users see a working page within a single click instead of a blank canvas.
 *
 * Each template hydrates 4-6 blocks tuned for a creator persona. Users can
 * delete or edit afterwards.
 */

import type { BlockType } from '@/types'

export interface BlockTemplate {
  type: BlockType
  title: string
  content: Record<string, unknown>
}

export interface PageTemplate {
  id: string
  name: string
  description: string
  emoji: string
  blocks: BlockTemplate[]
}

// Stable Unsplash image URLs that work as default placeholders. Users
// replace these on first edit. Picked for tone: warm, product-shot-y,
// high contrast → reads well behind overlay text.
const IMG_HERO       = 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&h=400&fit=crop' // workspace banner
const IMG_FEATURE_1  = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop'    // teamwork
const IMG_FEATURE_2  = 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop'    // strategy
const IMG_FEATURE_3  = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop' // analytics
const IMG_GRID_1     = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=600&fit=crop'
const IMG_GRID_2     = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop'
const IMG_GRID_3     = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop'
const IMG_GRID_4     = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=600&fit=crop'

export const PAGE_TEMPLATES: PageTemplate[] = [
  // ── Visual-forward presets (showcase the Phase 2 + 3 upgrades) ──
  // Listed first so first-time users land on a Portaly-quality look out
  // of the box, not a vertical list of buttons.
  {
    id: 'brand-site',
    name: '品牌官網風',
    description: 'Hero banner + 圖文卡片 storytelling,適合 SaaS / 顧問 / 品牌',
    emoji: '✨',
    blocks: [
      {
        type: 'banner',
        title: '我們相信好品牌,值得被看見',
        content: {
          imageUrl: IMG_HERO,
          caption: '專注於數位轉型的策略合作夥伴',
          overlayText: true,
          overlayPosition: 'bottom-left',
        },
      },
      {
        type: 'feature_card',
        title: '🤖 AI 顧問服務',
        content: {
          imageUrl: IMG_FEATURE_1,
          description: '從策略到落地一條龍,協助你把 AI 變成真實營收。已幫 200+ 品牌成功導入。',
          ctaLabel: '了解更多',
          ctaUrl: 'https://example.com/consulting',
          imagePosition: 'left',
        },
      },
      {
        type: 'feature_card',
        title: '✨ 自動化平台',
        content: {
          imageUrl: IMG_FEATURE_2,
          description: '把重複工作交給 AI,把時間還給創造力。整合 LINE / IG / Email,一鍵啟動。',
          ctaLabel: '查看方案',
          ctaUrl: 'https://example.com/platform',
          imagePosition: 'right',
        },
      },
      {
        type: 'feature_card',
        title: '📊 數據分析',
        content: {
          imageUrl: IMG_FEATURE_3,
          description: '顧客行為分析、活動成效追蹤、即時 dashboard。讓決策有根據。',
          ctaLabel: '預約諮詢',
          ctaUrl: 'https://example.com/contact',
          imagePosition: 'left',
        },
      },
      {
        type: 'email_form',
        title: '訂閱我們的最新動態',
        content: { placeholder: '輸入 Email', buttonText: '訂閱', description: '每月一封,精選案例 + 產品更新。' },
      },
    ],
  },
  {
    id: 'kol',
    name: 'KOL / 創作者風',
    description: '大圖片 hero + 雙欄圖片組合,影片 + 商品,展現作品集',
    emoji: '🌟',
    blocks: [
      {
        type: 'banner',
        title: '生活美學 × 穿搭靈感',
        content: {
          imageUrl: IMG_HERO,
          caption: 'IG 12 萬追蹤 ✦ YouTube 週更 ✦ 合作歡迎私訊',
          overlayText: true,
          overlayPosition: 'center',
        },
      },
      {
        type: 'image_grid',
        title: '近期作品',
        content: {
          cells: [
            { url: IMG_GRID_1, title: '春夏穿搭', linkUrl: 'https://example.com/spring' },
            { url: IMG_GRID_2, title: '咖啡日常', linkUrl: 'https://example.com/coffee' },
            { url: IMG_GRID_3, title: '旅行紀錄', linkUrl: 'https://example.com/travel' },
            { url: IMG_GRID_4, title: '美妝開箱', linkUrl: 'https://example.com/beauty' },
          ],
          overlayText: true,
          overlayPosition: 'bottom-left',
        },
      },
      {
        type: 'link',
        title: '🎬 YouTube 頻道',
        content: { url: 'https://youtube.com/@yourname' },
      },
      {
        type: 'link',
        title: '☕ 請我喝杯咖啡',
        content: { url: 'https://buymeacoffee.com/yourname' },
      },
      {
        type: 'email_form',
        title: '加入我的週報名單',
        content: { placeholder: '輸入 Email', buttonText: '訂閱',
          description: '每週分享私藏好物 + 限時折扣碼' },
      },
    ],
  },
  {
    id: 'portfolio',
    name: '作品集 / 攝影風',
    description: '極簡卡片 + 大量圖片格,適合設計師、攝影師、藝術家',
    emoji: '🎨',
    blocks: [
      {
        type: 'heading',
        title: 'Selected Works',
        content: { text: 'Selected Works', size: 'lg', align: 'left' },
      },
      {
        type: 'image_grid',
        title: '',
        content: {
          cells: [
            { url: IMG_GRID_1, title: 'Project 01' },
            { url: IMG_GRID_2, title: 'Project 02' },
            { url: IMG_GRID_3, title: 'Project 03' },
            { url: IMG_GRID_4, title: 'Project 04' },
          ],
          overlayText: true,
          overlayPosition: 'bottom-left',
        },
      },
      {
        type: 'feature_card',
        title: 'About',
        content: {
          imageUrl: IMG_FEATURE_2,
          description: '十年累積的視覺語言,專注於品牌敘事與產品攝影。\n\n服務客戶包含 Apple、Nike、星巴克。',
          ctaLabel: 'CV / Portfolio',
          ctaUrl: 'https://example.com/cv',
          imagePosition: 'left',
        },
      },
      {
        type: 'link',
        title: '✉️ 合作洽詢',
        content: { url: 'mailto:hello@example.com' },
      },
    ],
  },
  {
    id: 'creator',
    name: 'IG / YouTube 創作者',
    description: '社群連結 + 最新影片 + 合作邀約',
    emoji: '🎥',
    blocks: [
      {
        type: 'heading',
        title: '主要內容',
        content: { text: '主要內容', size: 'md' },
      },
      {
        type: 'link',
        title: '我的 YouTube 頻道',
        content: { url: 'https://youtube.com/@yourname' },
      },
      {
        type: 'link',
        title: '最新合作 / Sponsored',
        content: { url: 'https://example.com' },
      },
      {
        type: 'heading',
        title: '聯絡我',
        content: { text: '聯絡我', size: 'md' },
      },
      {
        type: 'email_form',
        title: '訂閱電子報',
        content: { placeholder: '輸入你的 Email', buttonText: '訂閱' },
      },
      {
        type: 'link',
        title: '商業合作邀約',
        content: { url: 'mailto:hello@example.com' },
      },
    ],
  },
  {
    id: 'seller',
    name: '線上課程 / 數位商品',
    description: '商品列表 + 預購倒數 + 名單蒐集',
    emoji: '🛒',
    blocks: [
      {
        type: 'heading',
        title: '🔥 限時優惠',
        content: { text: '🔥 限時優惠', size: 'lg' },
      },
      {
        type: 'countdown',
        title: '優惠結束倒數',
        content: {
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          label: '優惠結束倒數',
        },
      },
      {
        type: 'product',
        title: '主打商品',
        content: { price: 299, currency: 'NT$', description: '替換成你的商品介紹' },
      },
      {
        type: 'heading',
        title: '更多資源',
        content: { text: '更多資源', size: 'md' },
      },
      {
        type: 'link',
        title: '免費資源下載',
        content: { url: 'https://example.com' },
      },
      {
        type: 'email_form',
        title: '訂閱新品通知',
        content: { placeholder: '輸入 Email', buttonText: '訂閱' },
      },
    ],
  },
  {
    id: 'podcaster',
    name: 'Podcast 主持人',
    description: '收聽平台 + 訂閱 + 贊助',
    emoji: '🎙️',
    blocks: [
      {
        type: 'heading',
        title: '收聽平台',
        content: { text: '收聽平台', size: 'md' },
      },
      {
        type: 'link',
        title: '🎵 Spotify',
        content: { url: 'https://open.spotify.com/show/your-show' },
      },
      {
        type: 'link',
        title: '🎧 Apple Podcasts',
        content: { url: 'https://podcasts.apple.com/your-show' },
      },
      {
        type: 'link',
        title: '▶️ YouTube',
        content: { url: 'https://youtube.com/@yourshow' },
      },
      {
        type: 'heading',
        title: '支持我們',
        content: { text: '支持我們', size: 'md' },
      },
      {
        type: 'link',
        title: '☕ 請我們喝杯咖啡',
        content: { url: 'https://buymeacoffee.com/yourname' },
      },
    ],
  },
]
