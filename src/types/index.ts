export type BlockType =
  | 'link'
  | 'banner'
  | 'video'
  | 'email_form'
  | 'product'
  | 'heading'
  | 'social'

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

export interface SocialContent {
  platforms: string[] // references user social links
}

export type BlockContent =
  | LinkContent
  | BannerContent
  | VideoContent
  | EmailFormContent
  | ProductContent
  | HeadingContent
  | SocialContent

export interface BlockData {
  id: string
  type: BlockType
  title?: string | null
  content: BlockContent
  order: number
  active: boolean
  clicks: number
  views: number
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
