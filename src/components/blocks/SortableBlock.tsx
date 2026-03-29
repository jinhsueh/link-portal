'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockData, BlockType } from '@/types'
import { GripVertical, Trash2, Eye, EyeOff, Edit2, ExternalLink, ShoppingBag, Mail, Video, AlignLeft, Image } from 'lucide-react'

const TYPE_ICONS: Record<BlockType, React.ElementType> = {
  link: ExternalLink, banner: Image, video: Video,
  email_form: Mail, product: ShoppingBag, heading: AlignLeft, social: ExternalLink,
}
const TYPE_LABELS: Record<BlockType, string> = {
  link: '連結按鈕', banner: '橫幅看板', video: '影片',
  email_form: 'Email 表單', product: '數位商品', heading: '標題文字', social: '社群連結',
}

interface Props {
  block: BlockData
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onEdit: (block: BlockData) => void
}

export function SortableBlock({ block, onToggle, onDelete, onEdit }: Props) {
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

      {/* Stats */}
      <div className="hidden sm:flex flex-col items-end text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
        <span>{block.clicks} 點擊</span>
        <span>{block.views} 曝光</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {[
          { icon: Edit2, onClick: () => onEdit(block), color: 'var(--color-primary)' },
          { icon: block.active ? Eye : EyeOff, onClick: () => onToggle(block.id, !block.active), color: 'var(--color-text-secondary)' },
          { icon: Trash2, onClick: () => onDelete(block.id), color: '#E53E3E' },
        ].map(({ icon: BtnIcon, onClick, color }, i) => (
          <button key={i} onClick={onClick}
            className="p-2 rounded-lg transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = color; (e.currentTarget as HTMLElement).style.background = i === 2 ? '#FFF5F5' : 'var(--color-surface)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
            <BtnIcon size={15} />
          </button>
        ))}
      </div>
    </div>
  )
}
