'use client'

import { useState } from 'react'
import {
  Plus, X, Check, Pencil, ExternalLink,
  Camera, PlayCircle, Music, AtSign, MessageCircle, Globe,
  Headphones, MessageSquare, Briefcase, MapPin, Send, Phone,
} from 'lucide-react'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { detectPlatform, getPlatformConfig } from '@/lib/social-platforms'

interface SocialLinkItem {
  id: string
  platform: string
  url: string
  label?: string
  order: number
}

interface Props {
  links: SocialLinkItem[]
  onSave: () => void
}

export function SocialLinksEditor({ links, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [localLinks, setLocalLinks] = useState<SocialLinkItem[]>(links)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const detectedPlatform = newUrl.trim() ? detectPlatform(newUrl.trim()) : null
  const detectedConfig = detectedPlatform ? getPlatformConfig(detectedPlatform) : null

  const handleStartEdit = () => {
    setLocalLinks([...links])
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setNewUrl('')
    setNewLabel('')
  }

  const handleAdd = () => {
    const url = newUrl.trim()
    if (!url) return
    // Check duplicate
    if (localLinks.some(l => l.url === url)) return
    const platform = detectPlatform(url)
    setLocalLinks(prev => [...prev, {
      id: `temp-${Date.now()}`,
      platform,
      url,
      label: platform === 'custom' ? newLabel.trim() || undefined : undefined,
      order: prev.length,
    }])
    setNewUrl('')
    setNewLabel('')
  }

  const handleRemove = (url: string) => {
    setLocalLinks(prev => prev.filter(l => l.url !== url))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await fetch('/api/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: localLinks.map((l, i) => ({ url: l.url, label: l.label, order: i })),
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSave()
      setEditing(false)
    } catch { /* silent */ }
    setSaving(false)
  }

  // Collapsed state
  if (!editing) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {links.length > 0 ? (
          <>
            <div className="flex items-center gap-1.5">
              {links.map(l => (
                <SocialIcon key={l.id} platform={l.platform} url={l.url} />
              ))}
            </div>
            <button onClick={handleStartEdit}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <Pencil size={12} />編輯
            </button>
          </>
        ) : (
          <button onClick={handleStartEdit}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl w-full justify-center"
            style={{ background: 'none', border: '1px dashed var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}>
            <Plus size={14} />新增社群連結
          </button>
        )}
      </div>
    )
  }

  // Expanded (editing) state
  return (
    <div className="space-y-3">
      {/* Existing links */}
      {localLinks.length > 0 && (
        <div className="space-y-1.5">
          {localLinks.map(l => {
            const config = getPlatformConfig(l.platform)
            return (
              <div key={l.url} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'white', border: '1px solid var(--color-border)' }}>
                  <SocialIconMini platform={l.platform} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: config?.color ?? 'var(--color-text-muted)' }}>
                    {l.label || config?.label || l.platform}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{l.url}</p>
                </div>
                <button onClick={() => handleRemove(l.url)}
                  className="p-1 rounded-lg flex-shrink-0"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E53E3E')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add new link input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {detectedConfig && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: detectedConfig.color + '15', color: detectedConfig.color }}>
              <SocialIconMini platform={detectedPlatform!} />
              <span className="text-xs font-semibold">{detectedConfig.label}</span>
            </div>
          )}
          {detectedPlatform === 'custom' && newUrl.trim() && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: '#F3F4F6', color: 'var(--color-text-muted)' }}>
              <ExternalLink size={12} />
              <span className="text-xs font-semibold">Custom</span>
            </div>
          )}
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="貼上社群連結 URL"
            className="flex-1 min-w-0"
            style={{
              padding: '9px 12px', fontSize: 13,
              border: '1px solid var(--color-border)', borderRadius: 10,
              color: 'var(--color-text-primary)', background: 'white', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <button onClick={handleAdd} disabled={!newUrl.trim()}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold flex-shrink-0"
            style={{
              background: newUrl.trim() ? 'var(--color-primary)' : '#E5E7EB',
              color: 'white', border: 'none', cursor: newUrl.trim() ? 'pointer' : 'default',
            }}>
            <Plus size={13} />新增
          </button>
        </div>
        {detectedPlatform === 'custom' && newUrl.trim() && (
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="自訂名稱（選填）"
            style={{
              width: '100%', padding: '8px 12px', fontSize: 13,
              border: '1px solid var(--color-border)', borderRadius: 10,
              color: 'var(--color-text-primary)', background: 'white', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button onClick={handleSaveAll} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold"
          style={{
            background: saved ? '#22C55E' : 'var(--color-primary)',
            color: 'white', border: 'none', cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
          {saved ? <><Check size={14} />已儲存</> : saving ? '儲存中...' : '全部儲存'}
        </button>
        <button onClick={handleCancel}
          className="text-sm font-semibold px-3 py-2"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          取消
        </button>
      </div>
    </div>
  )
}

// Mini icon for the editor list (no link, just visual)
const MINI_ICONS: Record<string, React.ElementType> = {
  instagram: Camera,
  youtube: PlayCircle,
  tiktok: Music,
  twitter: AtSign,
  threads: MessageCircle,
  facebook: Globe,
  spotify: Headphones,
  line: MessageSquare,
  linkedin: Briefcase,
  pinterest: MapPin,
  telegram: Send,
  whatsapp: Phone,
}

function SocialIconMini({ platform }: { platform: string }) {
  const config = getPlatformConfig(platform)
  const Icon = MINI_ICONS[platform] ?? ExternalLink
  return <Icon size={14} style={{ color: config?.color ?? 'var(--color-text-muted)' }} />
}
