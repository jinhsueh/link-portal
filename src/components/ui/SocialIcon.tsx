'use client'

import {
  Camera, PlayCircle, Music, AtSign, MessageCircle, Globe,
  Headphones, MessageSquare, Briefcase, MapPin, Send, Phone,
  ExternalLink,
} from 'lucide-react'
import { getPlatformConfig } from '@/lib/social-platforms'

const ICONS: Record<string, React.ElementType> = {
  instagram:  Camera,
  youtube:    PlayCircle,
  tiktok:     Music,
  twitter:    AtSign,
  threads:    MessageCircle,
  facebook:   Globe,
  spotify:    Headphones,
  line:       MessageSquare,
  linkedin:   Briefcase,
  pinterest:  MapPin,
  telegram:   Send,
  whatsapp:   Phone,
}

export function SocialIcon({ platform, url }: { platform: string; url: string }) {
  const config = getPlatformConfig(platform)
  const label = config?.label ?? platform
  const color = config?.color ?? 'var(--color-text-muted)'
  const Icon = ICONS[platform] ?? ExternalLink

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
      style={{ background: 'white', border: '1px solid var(--color-border)', color, boxShadow: 'var(--shadow-sm)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
      <Icon size={18} />
    </a>
  )
}
