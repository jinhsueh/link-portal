export type BlockType =
  | 'link'
  | 'banner'
  | 'video'
  | 'email_form'
  | 'product'
  | 'heading'
  | 'social'
  | 'countdown'
  | 'faq'
  | 'carousel'
  | 'map'
  | 'embed'
  | 'calendar_event'

export interface LinkContent {
  url: string
  description?: string
  thumbnail?: string
}

export interface BannerContent {
  imageUrl: string
  linkUrl?: string
  alt?: string
}

export interface VideoContent {
  platform: 'youtube' | 'tiktok' | 'spotify'
  embedId: string
  url?: string // original URL for display
}

export interface EmailFormContent {
  placeholder?: string
  buttonText?: string
  webhookUrl?: string
}

export interface ProductContent {
  price: number
  currency: string
  description?: string
  imageUrl?: string
}

export interface HeadingContent {
  text: string
  size?: 'sm' | 'md' | 'lg'
}

export interface CountdownContent {
  targetDate: string // ISO string
  label?: string
  expiredText?: string
}

export interface FaqContent {
  items: Array<{ question: string; answer: string }>
}

export interface CarouselContent {
  images: Array<{ url: string; linkUrl?: string; alt?: string }>
}

export interface MapContent {
  query: string // Google Maps search query or place
  zoom?: number
}

export interface EmbedContent {
  html: string // iframe or embed HTML
  height?: number
}

export interface CalendarEventContent {
  eventTitle?: string          // falls back to block.title
  startDate: string            // ISO 8601 UTC (e.g. 2026-05-01T02:00:00.000Z)
  endDate?: string             // ISO 8601 UTC, defaults to start + 1h
  timezone: string             // IANA tz name, e.g. "Asia/Taipei"
  allDay?: boolean
  location?: string
  description?: string
  url?: string                 // event details page
}

export type BlockContent =
  | LinkContent
  | BannerContent
  | VideoContent
  | EmailFormContent
  | ProductContent
  | HeadingContent
  | CountdownContent
  | FaqContent
  | CarouselContent
  | MapContent
  | EmbedContent
  | CalendarEventContent

export interface BlockData {
  id: string
  type: BlockType
  title?: string | null
  content: BlockContent
  order: number
  active: boolean
  clicks: number
  views: number
  scheduleStart?: string | null
  scheduleEnd?: string | null
}

export interface ProfileData {
  username: string
  name?: string | null
  bio?: string | null
  avatarUrl?: string | null
  pages: PageData[]
  socialLinks: SocialLinkData[]
}

export interface PageData {
  id: string
  name: string
  slug: string
  order: number
  isDefault: boolean
  blocks: BlockData[]
}

export interface SocialLinkData {
  id: string
  platform: string
  url: string
  order: number
}
