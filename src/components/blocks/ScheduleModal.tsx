'use client'

import { useState } from 'react'
import { BlockData } from '@/types'
import { X, Clock, Trash2 } from 'lucide-react'
import { useDict } from '@/components/i18n/DictProvider'

interface Props {
  block: BlockData & { scheduleStart?: string | null; scheduleEnd?: string | null }
  onSave: (id: string, start: string | null, end: string | null) => void
  onClose: () => void
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ScheduleModal({ block, onSave, onClose }: Props) {
  const { dict } = useDict()
  const t = dict.admin.scheduleModal
  const [start, setStart] = useState(toLocalInput(block.scheduleStart))
  const [end, setEnd] = useState(toLocalInput(block.scheduleEnd))

  const handleSave = () => {
    onSave(
      block.id,
      start ? new Date(start).toISOString() : null,
      end ? new Date(end).toISOString() : null,
    )
    onClose()
  }

  const handleClear = () => {
    onSave(block.id, null, null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-6"
        style={{ background: 'var(--color-card, white)', boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFF7ED' }}>
              <Clock size={16} style={{ color: '#C2410C' }} />
            </div>
            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{t.title}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {t.description.replace('{name}', block.title || t.untitled)}
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.startLabel}</span>
            <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface, #F7F8FA)', color: 'var(--color-text-primary)', outline: 'none' }} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{t.endLabel}</span>
            <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface, #F7F8FA)', color: 'var(--color-text-primary)', outline: 'none' }} />
          </label>
        </div>

        <div className="flex items-center justify-between mt-6">
          {(block.scheduleStart || block.scheduleEnd) ? (
            <button onClick={handleClear}
              className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-colors"
              style={{ background: 'none', border: '1px solid #FCA5A5', cursor: 'pointer', color: '#DC2626' }}>
              <Trash2 size={13} />{t.clearBtn}
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: 'var(--color-surface, #F7F8FA)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              {t.cancelBtn}
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>
              {t.saveBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
