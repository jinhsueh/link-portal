'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import {
  Plus, X, Check, Pencil, ExternalLink, Upload, GripVertical,
  Camera, PlayCircle, Music, AtSign, MessageCircle, Globe,
  Headphones, MessageSquare, Briefcase, MapPin, Send, Phone,
} from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { ImageCropperModal } from '@/components/ui/ImageCropperModal'
import { detectPlatform, getPlatformConfig } from '@/lib/social-platforms'
import { toast } from '@/components/ui/Toast'

interface SocialLinkItem {
  id: string
  platform: string
  url: string
  label?: string
  order: number
  iconUrl?: string | null
}

interface Props {
  links: SocialLinkItem[]
  onSave: () => void
  onLinksChange?: (links: SocialLinkItem[]) => void
  /**
   * Embedded mode = the parent (ProfileEditor) owns the unified "全部儲存"
   * button. We hide our own save/cancel and always render in editing mode,
   * exposing save() / isDirty / reset() via ref so the parent can drive us.
   * Customer feedback consolidated the save UX into a single button at the
   * bottom of ProfileEditor.
   */
  embedded?: boolean
}

export interface SocialLinksEditorHandle {
  save: () => Promise<void>
  isDirty: () => boolean
  reset: () => void
}

export const SocialLinksEditor = forwardRef<SocialLinksEditorHandle, Props>(function SocialLinksEditor(
  { links, onSave, onLinksChange, embedded = false }: Props,
  ref,
) {
  const [editing, setEditing] = useState(embedded)
  const [localLinks, setLocalLinks] = useState<SocialLinkItem[]>(links)
  const [newUrl, setNewUrl] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  // When a user picks an icon file, hold it here pending crop confirmation.
  const [pendingIcon, setPendingIcon] = useState<{ linkId: string; file: File } | null>(null)

  const sensors = useSensors(
    // 8px distance prevents accidental drags on touch — same threshold as
    // the admin block list for consistency.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

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
    if (localLinks.some(l => l.url === url)) {
      // Customer feedback: silent rejection on dup URL felt like the button
      // was broken. Surface it with a toast — and keep the input populated
      // so the user can edit instead of retyping.
      toast.error('這個網址已經加過了,不能重複新增')
      return
    }
    const platform = detectPlatform(url)
    setLocalLinks(prev => {
      const next = [...prev, {
        id: `temp-${Date.now()}`,
        platform,
        url,
        label: platform === 'custom' ? newLabel.trim() || undefined : undefined,
        order: prev.length,
      }]
      onLinksChange?.(next)
      return next
    })
    setNewUrl('')
    setNewLabel('')
  }

  const handleRemove = (url: string) => {
    setLocalLinks(prev => {
      const next = prev.filter(l => l.url !== url)
      onLinksChange?.(next)
      return next
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setLocalLinks(prev => {
      const oldIndex = prev.findIndex(l => l.id === active.id)
      const newIndex = prev.findIndex(l => l.id === over.id)
      if (oldIndex < 0 || newIndex < 0) return prev
      const next = arrayMove(prev, oldIndex, newIndex)
      onLinksChange?.(next)
      return next
    })
  }

  // Step 1: file picked → stash and open crop modal.
  const handleIconPick = (linkId: string, file: File) => {
    setPendingIcon({ linkId, file })
  }

  // Step 2: crop confirmed → upload the cropped square.
  const handleIconCropped = async (cropped: File) => {
    if (!pendingIcon) return
    const linkId = pendingIcon.linkId
    setPendingIcon(null)
    setUploadingId(linkId)
    const formData = new FormData()
    formData.append('file', cropped)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        // Surface upload failures (e.g. 4 MB limit, type rejection) instead of
        // silently swallowing them — users were assuming the feature was broken.
        toast.error(data.error ?? '上傳失敗,請再試一次')
      } else if (data.url) {
        setLocalLinks(prev => {
          const next = prev.map(l => l.id === linkId ? { ...l, iconUrl: data.url } : l)
          onLinksChange?.(next)
          return next
        })
        toast.success('圖示已上傳,記得按「全部儲存」才會生效')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '網路錯誤,上傳失敗')
    }
    setUploadingId(null)
  }

  const handleIconRemove = (linkId: string) => {
    setLocalLinks(prev => {
      const next = prev.map(l => l.id === linkId ? { ...l, iconUrl: null } : l)
      onLinksChange?.(next)
      return next
    })
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      await fetch('/api/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: localLinks.map((l, i) => ({
            url: l.url,
            label: l.label,
            iconUrl: l.iconUrl ?? undefined,
            order: i,
          })),
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSave()
      // Stay in editing mode when embedded — the parent's unified save bar
      // is what closes the experience, not us.
      if (!embedded) setEditing(false)
    } catch { /* silent */ }
    setSaving(false)
  }

  // Imperative API for the parent's "全部儲存" button.
  useImperativeHandle(ref, () => ({
    save: handleSaveAll,
    // Quick dirty check: count + each url/label/iconUrl/order pair against
    // the prop. Cheap because the list is small.
    isDirty: () => {
      if (localLinks.length !== links.length) return true
      for (let i = 0; i < localLinks.length; i++) {
        const a = localLinks[i]
        const b = links[i]
        if (!b || a.url !== b.url || (a.label ?? '') !== (b.label ?? '')
          || (a.iconUrl ?? '') !== (b.iconUrl ?? '') || a.order !== b.order) return true
      }
      return false
    },
    reset: () => {
      setLocalLinks([...links])
      setNewUrl('')
      setNewLabel('')
      onLinksChange?.(links)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [localLinks, links])

  // ── Collapsed (read-only badge row + edit button) ──
  // Skipped in embedded mode — parent owns the section heading and the
  // save bar, this editor just shows the editable list.
  if (!editing && !embedded) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {links.length > 0 ? (
          <>
            <div className="flex items-center gap-1.5">
              {links.map(l => (
                <SocialIcon key={l.id} platform={l.platform} url={l.url} iconUrl={l.iconUrl} label={l.label} />
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

  // ── Expanded (editing) ──
  return (
    <div className="space-y-3">
      {/* Sortable list of existing links */}
      {localLinks.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1.5">
              {localLinks.map(l => (
                <SortableSocialRow key={l.id} link={l}
                  onRemove={() => handleRemove(l.url)}
                  onIconUpload={file => handleIconPick(l.id, file)}
                  onIconRemove={() => handleIconRemove(l.id)}
                  uploading={uploadingId === l.id} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add new link */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {detectedConfig && detectedPlatform !== 'custom' && (
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

      {/* Helper hint */}
      <div className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
        {localLinks.length > 1 && (
          <p>拖曳左側 <GripVertical size={11} className="inline" /> 排序、點 <Upload size={11} className="inline" /> 上傳自訂圖示</p>
        )}
        <p>
          自訂圖示建議:**1:1 正方形,512×512 px 以上**(會自動裁成圓形顯示)。透明背景 PNG 或 SVG 視覺最佳。
        </p>
      </div>

      {/* Actions — hidden in embedded mode (parent owns the unified save bar) */}
      {!embedded && (
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
      )}

      {/* Crop modal — opens when an icon file is picked, closes on confirm/cancel. */}
      {pendingIcon && (
        <ImageCropperModal
          file={pendingIcon.file}
          aspect={1}
          cropShape="round"
          title="裁切社群圖示"
          onComplete={handleIconCropped}
          onCancel={() => setPendingIcon(null)}
        />
      )}
    </div>
  )
})

/* ── Single sortable row ── */
function SortableSocialRow({
  link, onRemove, onIconUpload, onIconRemove, uploading,
}: {
  link: SocialLinkItem
  onRemove: () => void
  onIconUpload: (file: File) => void
  onIconRemove: () => void
  uploading: boolean
}) {
  const config = getPlatformConfig(link.platform)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-2 px-2 py-2 rounded-xl"
      data-dragging={isDragging || undefined}
      data-css="social-row"
      // Background uses inline so dnd's transform doesn't conflict with hover utility classes.
      // Surface from theme tokens.
    >
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        {/* Drag handle */}
        <button {...attributes} {...listeners}
          className="flex-shrink-0 p-1 rounded cursor-grab active:cursor-grabbing"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', touchAction: 'none' }}
          aria-label="拖曳排序">
          <GripVertical size={14} />
        </button>

        {/* Icon preview (custom or platform) */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: 'white', border: '1px solid var(--color-border)' }}>
          {link.iconUrl ? (
            <img src={link.iconUrl} alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <SocialIconMini platform={link.platform} />
          )}
        </div>

        {/* Label + URL */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: config?.color ?? 'var(--color-text-muted)' }}>
            {link.label || config?.label || link.platform}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{link.url}</p>
        </div>

        {/* Upload icon */}
        <button onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-lg flex-shrink-0"
          title="上傳自訂圖示"
          style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
          <Upload size={12} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) onIconUpload(f)
            e.target.value = ''
          }}
        />

        {/* Remove icon (only when there is one) */}
        {link.iconUrl && (
          <button onClick={onIconRemove}
            className="text-[10px] font-semibold flex-shrink-0"
            title="清除自訂圖示"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
            清除
          </button>
        )}

        {/* Remove link */}
        <button onClick={onRemove}
          className="p-1 rounded-lg flex-shrink-0"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#E53E3E')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
          <X size={14} />
        </button>

        {uploading && (
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>上傳中…</div>
        )}
      </div>
    </div>
  )
}

/* ── Mini icon for in-row preview ── */
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
