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
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: 42,
        height: 42,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.6)',
        color,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-2px) scale(1.04)'
        el.style.boxShadow = `0 8px 20px ${color}33, 0 2px 6px rgba(0,0,0,0.08)`
        el.style.background = 'white'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0) scale(1)'
        el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'
        el.style.background = 'rgba(255,255,255,0.92)'
      }}>
      <Icon size={19} />
    </a>
  )
}
