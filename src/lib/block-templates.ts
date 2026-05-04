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

export const PAGE_TEMPLATES: PageTemplate[] = [
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
