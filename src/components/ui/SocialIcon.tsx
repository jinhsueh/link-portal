'use client'

import { Music, MessageCircle, ExternalLink, PlayCircle, Globe, Share2 } from 'lucide-react'

const PLATFORMS: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  instagram: { icon: Share2,        label: 'Instagram', color: '#E1306C' },
  youtube:   { icon: PlayCircle,    label: 'YouTube',   color: '#FF0000' },
  tiktok:    { icon: Music,         label: 'TikTok',    color: '#000000' },
  threads:   { icon: MessageCircle, label: 'Threads',   color: '#000000' },
  facebook:  { icon: Globe,         label: 'Facebook',  color: '#1877F2' },
  spotify:   { icon: Music,         label: 'Spotify',   color: '#1DB954' },
}

export function SocialIcon({ platform, url }: { platform: string; url: string }) {
  const config = PLATFORMS[platform] ?? { icon: ExternalLink, label: platform, color: 'var(--color-text-muted)' }
  const Icon = config.icon

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={config.label}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
      style={{ background: 'white', border: '1px solid var(--color-border)', color: config.color, boxShadow: 'var(--shadow-sm)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
      <Icon size={18} />
    </a>
  )
}
