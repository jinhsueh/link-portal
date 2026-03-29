'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

interface Props {
  username: string
  pageId: string
  children: React.ReactNode
}

export function PasswordGate({ username, pageId, children }: Props) {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setError('')
    try {
      const res = await fetch('/api/pages/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, password }),
      })
      if (res.ok) {
        setUnlocked(true)
      } else {
        setError('密碼錯誤')
      }
    } catch {
      setError('驗證失敗，請稍後再試')
    }
    setChecking(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--color-surface)', padding: 16 }}>
      <div className="w-full max-w-sm text-center"
        style={{ background: 'white', borderRadius: 20, padding: 40, boxShadow: 'var(--shadow-lg)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'var(--color-primary-light)' }}>
          <Lock size={28} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h1 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
          此頁面需要密碼
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          請輸入密碼以瀏覽 @{username} 的頁面
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="輸入密碼"
            required
            className="w-full text-center text-sm px-4 py-3 focus:outline-none"
            style={{
              border: `1px solid ${error ? '#E53E3E' : 'var(--color-border)'}`,
              borderRadius: 12,
              color: 'var(--color-text-primary)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
            onBlur={e => (e.target.style.borderColor = error ? '#E53E3E' : 'var(--color-border)')}
          />
          {error && <p className="text-xs" style={{ color: '#E53E3E' }}>{error}</p>}
          <button type="submit" disabled={checking} className="btn-primary w-full justify-center"
            style={{ fontSize: 14, padding: '12px 20px', opacity: checking ? 0.7 : 1 }}>
            {checking ? '驗證中...' : '解鎖'}
          </button>
        </form>
      </div>
    </div>
  )
}
