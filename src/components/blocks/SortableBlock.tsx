'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockData, BlockType } from '@/types'
import { GripVertical, Trash2, Eye, EyeOff, Edit2, Copy, ExternalLink, ShoppingBag, Mail, Video, AlignLeft, Image, Clock, Timer, HelpCircle, Images, MapPin, Code, CalendarPlus } from 'lucide-react'

const TYPE_ICONS: Record<BlockType, React.ElementType> = {
  link: ExternalLink, banner: Image, video: Video,
  email_form: Mail, product: ShoppingBag, heading: AlignLeft, social: ExternalLink,
  countdown: Timer, faq: HelpCircle, carousel: Images, map: MapPin, embed: Code,
  calendar_event: CalendarPlus,
}
const TYPE_LABELS: Record<BlockType, string> = {
  link: '連結按鈕', banner: '橫幅看板', video: '影片',
  email_form: 'Email 表單', product: '數位商品', heading: '標題文字', social: '社群連結',
  countdown: '倒數計時', faq: 'FAQ 問答', carousel: '圖片輪播', map: '地圖嵌入', embed: 'HTML 嵌入',
  calendar_event: '加入日曆',
}

interface Props {
  block: BlockData
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onEdit: (block: BlockData) => void
  onDuplicate?: (block: BlockData) => void
  onSchedule?: (block: BlockData) => void
}

export function SortableBlock({ block, onToggle, onDelete, onEdit, onDuplicate, onSchedule }: Props) {
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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
          {block.title || TYPE_LABELS[block.type]}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{TYPE_LABELS[block.type]}</p>
      </div>

      {/* Stats — tooltip explains the counters because users keep asking
          "are these realtime?" / "what does 曝光 mean?". Both counts are
          captured by /api/track on every public page view & link click,
          updated in near-realtime (~1 second after the visitor action).
          Compact pill on mobile so it stays useful on phone-width admin. */}
      <div
        className="flex sm:flex-col flex-row items-end gap-1 sm:gap-0 text-xs flex-shrink-0 cursor-help leading-tight"
        style={{ color: 'var(--color-text-muted)' }}
        title={`點擊:粉絲實際點按此區塊的次數\n曝光:此區塊在公開頁被看到的次數\n\n資料來自即時追蹤,訪客動作後約 1 秒同步。`}>
        <span className="whitespace-nowrap">{block.clicks} 點擊</span>
        <span className="whitespace-nowrap">{block.views} 曝光</span>
      </div>

      {/* Schedule badge */}
      {hasSchedule && (
        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0"
          style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}>
          <Clock size={11} />
          <span>排程</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {[
          { icon: Edit2, onClick: () => onEdit(block), color: 'var(--color-primary)', hoverBg: 'var(--color-surface)' },
          { icon: Copy, onClick: () => onDuplicate?.(block), color: 'var(--color-primary)', hoverBg: 'var(--color-surface)' },
          { icon: Clock, onClick: () => onSchedule?.(block), color: hasSchedule ? '#C2410C' : 'var(--color-text-secondary)', hoverBg: hasSchedule ? '#FFF7ED' : 'var(--color-surface)' },
          { icon: block.active ? Eye : EyeOff, onClick: () => onToggle(block.id, !block.active), color: 'var(--color-text-secondary)', hoverBg: 'var(--color-surface)' },
          { icon: Trash2, onClick: () => onDelete(block.id), color: '#E53E3E', hoverBg: '#FFF5F5' },
        ].map(({ icon: BtnIcon, onClick, color, hoverBg }, i) => (
          <button key={i} onClick={onClick}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.background = hoverBg }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
            <BtnIcon size={15} />
          </button>
        ))}
      </div>
    </div>
  )
}
