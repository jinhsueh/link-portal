'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

/**
 * Lightweight toast system — replaces "did my save work?" silence with a
 * visible affirmation. Used across save/import/delete actions.
 *
 * Usage:
 *   const toast = useToast()
 *   toast.success('已儲存')
 *   toast.error('儲存失敗')
 *
 * Mount <ToastHost /> once at the root layout (or in a top-level client
 * component) so toasts can render anywhere in the tree.
 */

type ToastKind = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1
const listeners = new Set<(items: ToastItem[]) => void>()
let items: ToastItem[] = []

function publish() {
  for (const fn of listeners) fn([...items])
}

/** Imperative API — works without context for one-off uses (e.g. from inside
 *  helper functions that aren't React components). */
export const toast = {
  push(kind: ToastKind, message: string) {
    const id = nextId++
    items.push({ id, kind, message })
    publish()
    setTimeout(() => {
      items = items.filter(i => i.id !== id)
      publish()
    }, kind === 'error' ? 4000 : 2200)
  },
  success(message: string) { this.push('success', message) },
  error(message: string) { this.push('error', message) },
  info(message: string) { this.push('info', message) },
  warning(message: string) { this.push('warning', message) },
}

/** React hook flavor — same API, same store. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  return ctx ?? toast
}

/** Mount once — listens to the imperative store and renders the visible toasts. */
export function ToastHost() {
  const [list, setList] = useState<ToastItem[]>(items)
  useEffect(() => {
    listeners.add(setList)
    return () => { listeners.delete(setList) }
  }, [])

  const dismiss = useCallback((id: number) => {
    items = items.filter(i => i.id !== id)
    publish()
  }, [])

  if (list.length === 0) return null

  return (
    <div
      className="fixed z-[100] flex flex-col gap-2 pointer-events-none"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 32px)',
      }}
      role="status"
      aria-live="polite">
      {list.map(t => (
        <ToastBubble key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

const COLORS: Record<ToastKind, { bg: string; ring: string; icon: React.ElementType; iconColor: string }> = {
  success: { bg: '#dcfce7', ring: '#86efac', icon: Check, iconColor: '#15803d' },
  error:   { bg: '#fee2e2', ring: '#fca5a5', icon: X,     iconColor: '#dc2626' },
  warning: { bg: '#fef3c7', ring: '#fcd34d', icon: AlertTriangle, iconColor: '#b45309' },
  info:    { bg: '#dbeafe', ring: '#93c5fd', icon: Info,  iconColor: '#1d4ed8' },
}

function ToastBubble({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { bg, ring, icon: Icon, iconColor } = COLORS[item.kind]
  const [entering, setEntering] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className="pointer-events-auto rounded-full pl-3 pr-2 py-2 flex items-center gap-2 shadow-lg"
      style={{
        background: bg,
        border: `1px solid ${ring}`,
        color: iconColor,
        opacity: entering ? 0 : 1,
        transform: entering ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.2s, transform 0.2s',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={onDismiss}>
      <Icon size={14} style={{ flexShrink: 0 }} />
      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {item.message}
      </span>
    </div>
  )
}
