'use client'

import { useState } from 'react'
import { Check, Link2, User, Share2, X, Sparkles } from 'lucide-react'

interface Props {
  hasBlocks: boolean
  hasProfile: boolean // avatarUrl or bio set
  username: string
  onAddBlock: () => void
  onGoToSettings: () => void
}

export function OnboardingChecklist({ hasBlocks, hasProfile, username, onAddBlock, onGoToSettings }: Props) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('onboarding-dismissed') === 'true'
    return false
  })
  const [linkCopied, setLinkCopied] = useState(false)
  const [hasShared, setHasShared] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('onboarding-shared') === 'true'
    return false
  })

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('onboarding-dismissed', 'true')
  }

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/${username}`
    await navigator.clipboard.writeText(url)
    setLinkCopied(true)
    setHasShared(true)
    localStorage.setItem('onboarding-shared', 'true')
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const allDone = hasBlocks && hasProfile && hasShared
  if (dismissed || allDone) return null

  const steps = [
    { done: true, label: '建立帳號', action: null },
    { done: hasBlocks, label: '加入你的第一個連結', action: onAddBlock, actionLabel: '新增區塊' },
    { done: hasProfile, label: '設定大頭照和自我介紹', action: onGoToSettings, actionLabel: '前往設定' },
    { done: hasShared, label: '分享你的頁面連結', action: handleCopyLink, actionLabel: linkCopied ? '已複製！' : '複製連結' },
  ]

  const doneCount = steps.filter(s => s.done).length

  return (
    <div className="mb-6 rounded-2xl overflow-hidden"
      style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            快速開始
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            {doneCount}/{steps.length}
          </span>
        </div>
        <button onClick={handleDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2 }}>
          <X size={16} />
        </button>
      </div>
      <div className="px-5 py-3 flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: step.done ? 'var(--color-primary)' : 'var(--color-surface)',
                border: step.done ? 'none' : '2px solid var(--color-border)',
              }}>
              {step.done && <Check size={14} color="white" strokeWidth={3} />}
            </div>
            <span className="flex-1 text-sm font-medium"
              style={{
                color: step.done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                textDecoration: step.done ? 'line-through' : 'none',
              }}>
              {step.label}
            </span>
            {!step.done && step.action && (
              <button onClick={step.action}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  border: 'none', cursor: 'pointer',
                }}>
                {step.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
