'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || '發生錯誤'); setLoading(false); return }
    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--gradient-hero)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
            <Link2 size={28} color="white" />
          </div>
          <h1 className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
            Link Portal
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>建立你的個人傳送門</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-md)' }}>
          <h2 className="font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>登入 / 註冊</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                用戶名稱 <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>（英數字）</span>
              </label>
              <div className="flex items-center overflow-hidden" style={{ border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <span className="px-3 py-3 text-xs border-r" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
                  linkportal.cc/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  required minLength={3} maxLength={30}
                  placeholder="username"
                  className="flex-1 px-3 py-3 text-sm focus:outline-none"
                  style={{ background: 'white', color: 'var(--color-text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                顯示名稱 <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>（選填）</span>
              </label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="你的名字" maxLength={50}
                className="w-full px-4 py-3 text-sm focus:outline-none"
                style={{ border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-primary)' }}
              />
            </div>

            {error && (
              <p className="text-sm px-4 py-3 rounded-xl" style={{ color: '#E53E3E', background: '#FFF5F5', border: '1px solid #FED7D7' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || username.length < 3}
              className="btn-primary w-full justify-center"
              style={{ padding: '13px 28px', opacity: (loading || username.length < 3) ? 0.5 : 1 }}>
              {loading ? '處理中...' : '進入後台'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
            輸入用戶名即可直接登入，無需密碼
          </p>
        </div>
      </div>
    </div>
  )
}
