export interface PlatformConfig {
  id: string
  label: string
  color: string
  patterns: RegExp[]
}

export const PLATFORMS: PlatformConfig[] = [
  { id: 'instagram',  label: 'Instagram',  color: '#E1306C', patterns: [/instagram\.com/i, /instagr\.am/i] },
  { id: 'youtube',    label: 'YouTube',     color: '#FF0000', patterns: [/youtube\.com/i, /youtu\.be/i] },
  { id: 'tiktok',     label: 'TikTok',      color: '#000000', patterns: [/tiktok\.com/i] },
  { id: 'twitter',    label: 'X / Twitter', color: '#000000', patterns: [/twitter\.com/i, /x\.com/i] },
  { id: 'threads',    label: 'Threads',     color: '#000000', patterns: [/threads\.net/i] },
  { id: 'facebook',   label: 'Facebook',    color: '#1877F2', patterns: [/facebook\.com/i, /fb\.com/i] },
  { id: 'spotify',    label: 'Spotify',     color: '#1DB954', patterns: [/open\.spotify\.com/i, /spotify\.com/i] },
  { id: 'line',       label: 'LINE',        color: '#06C755', patterns: [/line\.me/i, /lin\.ee/i] },
  { id: 'linkedin',   label: 'LinkedIn',    color: '#0A66C2', patterns: [/linkedin\.com/i] },
  { id: 'pinterest',  label: 'Pinterest',   color: '#E60023', patterns: [/pinterest\.com/i, /pin\.it/i] },
  { id: 'telegram',   label: 'Telegram',    color: '#0088CC', patterns: [/t\.me/i, /telegram\.org/i] },
  { id: 'whatsapp',   label: 'WhatsApp',    color: '#25D366', patterns: [/wa\.me/i, /whatsapp\.com/i, /api\.whatsapp\.com/i] },
  { id: 'xiaohongshu',label: 'Xiaohongshu', color: '#FF2442', patterns: [/xiaohongshu\.com/i, /xhslink\.com/i, /xhs\.link/i] },
  { id: 'bilibili',   label: 'Bilibili',    color: '#00A1D6', patterns: [/bilibili\.com/i, /b23\.tv/i] },
  { id: 'discord',    label: 'Discord',     color: '#5865F2', patterns: [/discord\.gg/i, /discord\.com/i] },
]

export function detectPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    for (const p of PLATFORMS) {
      if (p.patterns.some(re => re.test(hostname))) return p.id
    }
  } catch {
    for (const p of PLATFORMS) {
      if (p.patterns.some(re => re.test(url))) return p.id
    }
  }
  return 'custom'
}

export function getPlatformConfig(id: string): PlatformConfig | null {
  return PLATFORMS.find(p => p.id === id) ?? null
}
