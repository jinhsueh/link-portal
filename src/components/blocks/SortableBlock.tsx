'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockData, BlockType } from '@/types'
import { GripVertical, Trash2, Eye, EyeOff, Edit2, ExternalLink, ShoppingBag, Mail, Video, AlignLeft, Image } from 'lucide-react'

const TYPE_ICONS: Record<BlockType, React.ElementType> = {
  link: ExternalLink,
  banner: Image,
  video: Video,
  email_form: Mail,
  product: ShoppingBag,
  heading: AlignLeft,
  social: ExternalLink,
}

const TYPE_LABELS: Record<BlockType, string> = {
  link: '連結按鈕',
  banner: '橫幅看板',
  video: '影片',
  email_form: 'Email 表單',
  product: '數位商品',
  heading: '標題文字',
  social: '社群連結',
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
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = TYPE_ICONS[block.type] ?? ExternalLink

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white border rounded-xl transition-shadow ${
        isDragging ? 'shadow-lg border-violet-300' : 'border-gray-200 hover:border-gray-300'
      } ${!block.active ? 'opacity-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={18} />
      </button>

      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
        <Icon size={16} className="text-violet-600" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {block.title || TYPE_LABELS[block.type]}
        </p>
        <p className="text-xs text-gray-400">{TYPE_LABELS[block.type]}</p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex flex-col items-end text-xs text-gray-400 flex-shrink-0">
        <span>{block.clicks} 點擊</span>
        <span>{block.views} 曝光</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(block)}
          className="p-2 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => onToggle(block.id, !block.active)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {block.active ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
        <button
          onClick={() => onDelete(block.id)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
