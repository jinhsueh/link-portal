'use client'

import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockData, BlockType } from '@/types'
import {
  GripVertical, Trash2, Eye, EyeOff, Edit2, Copy, ExternalLink, ShoppingBag,
  Mail, Video, AlignLeft, Image, Clock, Timer, HelpCircle, Images, MapPin,
  Code, CalendarPlus, MoreHorizontal, Star, FolderInput, ChevronRight, LayoutGrid,
  Newspaper,
} from 'lucide-react'

const TYPE_ICONS: Record<BlockType, React.ElementType> = {
  link: ExternalLink, banner: Image, video: Video,
  email_form: Mail, product: ShoppingBag, heading: AlignLeft, social: ExternalLink,
  countdown: Timer, faq: HelpCircle, carousel: Images, image_grid: LayoutGrid,
  feature_card: Newspaper,
  map: MapPin, embed: Code,
  calendar_event: CalendarPlus,
}
const TYPE_LABELS: Record<BlockType, string> = {
  link: '連結按鈕', banner: '橫幅看板', video: '影片',
  email_form: 'Email 表單', product: '數位商品', heading: '標題文字', social: '社群連結',
  countdown: '倒數計時', faq: 'FAQ 問答', carousel: '圖片輪播', image_grid: '雙欄圖片',
  feature_card: '圖文卡片',
  map: '地圖嵌入', embed: 'HTML 嵌入',
  calendar_event: '加入日曆',
}

interface Props {
  block: BlockData
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onEdit: (block: BlockData) => void
  onDuplicate?: (block: BlockData) => void
  onSchedule?: (block: BlockData) => void
  onPin?: (id: string, pinned: boolean) => void
  /** Pages the block can be moved into (current page is filtered out by parent). */
  movePages?: Array<{ id: string; name: string }>
  onMoveToPage?: (blockId: string, pageId: string) => void
}

export function SortableBlock({ block, onToggle, onDelete, onEdit, onDuplicate, onSchedule, onPin, movePages, onMoveToPage }: Props) {
  const hasSchedule = !!(block.scheduleStart || block.scheduleEnd)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : block.active ? 1 : 0.5,
  }

  const Icon = TYPE_ICONS[block.type] ?? ExternalLink

  return (
    <div ref={setNodeRef} style={{
      ...style,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', background: 'white',
      border: `1px solid ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
      borderRadius: 12,
      boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s, border-color 0.2s',
    }}>
      {/* Drag handle */}
      <button {...attributes} {...listeners}
        style={{ color: 'var(--color-text-muted)', cursor: 'grab', flexShrink: 0, background: 'none', border: 'none', padding: 2 }}
        className="touch-none active:cursor-grabbing">
        <GripVertical size={16} />
      </button>

      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: 'var(--color-primary-light)' }}>
        <Icon size={15} style={{ color: 'var(--color-primary)' }} />
      </div>

      {/* Info — strip inline markdown (used in heading text) so the row
          shows readable text instead of "**bold**" / "[link](url)" syntax. */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(block)}>
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {stripMarkdownForDisplay(block.title) || TYPE_LABELS[block.type]}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {TYPE_LABELS[block.type]}
          {block.views > 0 && (
            <span className="ml-2 cursor-help"
              title={`看過 ${block.views} 次 / 點過 ${block.clicks} 次\n資料即時更新,訪客動作後約 1 秒同步`}>
              · 看過 {block.views} · 點過 {block.clicks}
            </span>
          )}
        </p>
      </div>

      {/* Pinned badge — shows first to signal "this block is the headline". */}
      {block.pinned && (
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0"
          title="主推:此區塊會顯示在公開頁最上方"
          style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
          <Star size={11} fill="currentColor" />
          <span>主推</span>
        </div>
      )}

      {/* Schedule badge — kept as inline pill since it's a status, not an action */}
      {hasSchedule && (
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}>
          <Clock size={11} />
          <span>排程</span>
        </div>
      )}

      {/* Quick toggle (eye) — most-used action stays primary */}
      <button onClick={() => onToggle(block.id, !block.active)}
        title={block.active ? '隱藏' : '顯示'}
        className="p-2 rounded-lg flex-shrink-0"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
        {block.active ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>

      {/* Kebab menu — collapses edit/pin/duplicate/schedule/move/delete (less-used actions) */}
      <KebabMenu
        items={[
          { label: '編輯',     icon: Edit2, onClick: () => onEdit(block) },
          { label: block.pinned ? '取消主推' : '設為主推', icon: Star, onClick: () => onPin?.(block.id, !block.pinned) },
          { label: '複製',     icon: Copy, onClick: () => onDuplicate?.(block) },
          { label: hasSchedule ? '修改排程' : '排程顯示', icon: Clock, onClick: () => onSchedule?.(block) },
          // Only render the "move to other page" entry when there ARE other
          // pages to move into. Single-page accounts wouldn't see this.
          ...(movePages && movePages.length > 0 && onMoveToPage ? [{
            label: '移至其他分頁',
            icon: FolderInput,
            submenu: movePages.map(p => ({
              label: p.name,
              onClick: () => onMoveToPage(block.id, p.id),
            })),
          }] : []),
          { label: '刪除',     icon: Trash2, onClick: () => onDelete(block.id), danger: true },
        ]}
      />
    </div>
  )
}

interface KebabItem {
  label: string
  icon: React.ElementType
  onClick?: () => void
  danger?: boolean
  /** When set, this item opens a submenu (e.g. 移至其他分頁 → list of pages). */
  submenu?: Array<{ label: string; onClick: () => void }>
}

function KebabMenu({ items }: { items: KebabItem[] }) {
  const [open, setOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setOpenSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button onClick={() => setOpen(o => !o)}
        title="更多操作"
        className="p-2 rounded-lg"
        style={{ background: open ? 'var(--color-surface)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-xl py-1 min-w-[160px]"
          style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
          {items.map(({ label, icon: Icon, onClick, danger, submenu }) => {
            const hasSub = !!submenu && submenu.length > 0
            const isSubOpen = openSubmenu === label
            return (
              <div key={label} className="relative">
                <button
                  onClick={() => {
                    if (hasSub) {
                      setOpenSubmenu(isSubOpen ? null : label)
                    } else {
                      setOpen(false)
                      setOpenSubmenu(null)
                      onClick?.()
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                  style={{
                    background: isSubOpen ? 'var(--color-surface)' : 'none',
                    border: 'none', cursor: 'pointer',
                    color: danger ? '#E53E3E' : 'var(--color-text-secondary)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = danger ? '#FFF5F5' : 'var(--color-surface)' }}
                  onMouseLeave={e => { if (!isSubOpen) (e.currentTarget as HTMLElement).style.background = 'none' }}>
                  <Icon size={13} />
                  <span className="flex-1">{label}</span>
                  {hasSub && <ChevronRight size={12} style={{ opacity: 0.6 }} />}
                </button>
                {hasSub && isSubOpen && (
                  // Submenu opens to the LEFT (not right) so it doesn't push
                  // off-screen on the right-aligned kebab. Stacks just below
                  // its trigger so the visual relationship reads as "expand
                  // this row" rather than "fly out".
                  <div className="absolute right-full top-0 mr-1 rounded-xl py-1 min-w-[140px]"
                    style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
                    {submenu.map(({ label: subLabel, onClick: subClick }) => (
                      <button key={subLabel}
                        onClick={() => { setOpen(false); setOpenSubmenu(null); subClick() }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--color-text-secondary)', textAlign: 'left',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
                        <span className="truncate">{subLabel}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Strip the inline-markdown subset (**bold**, [text](url)) used by heading
 * blocks so the admin block-list row shows readable text. Newlines collapse
 * to spaces because the row is single-line.
 */
function stripMarkdownForDisplay(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1')
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}
