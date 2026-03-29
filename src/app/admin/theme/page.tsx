'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { PRESET_THEMES, DEFAULT_THEME, type PageTheme } from '@/lib/theme'

export default function ThemePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)
  const [pageId, setPageId] = useState<string | null>(null)
  const [theme, setTheme] = useState<PageTheme>(DEFAULT_THEME)

  useEffect(() => {
    fetch('/api/me').then(async res => {
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setUser({ username: data.username })
      const defaultPage = data.pages?.find((p: { isDefault: boolean }) => p.isDefault) ?? data.pages?.[0]
      if (defaultPage) {
        setPageId(defaultPage.id)
        const existing = JSON.parse(defaultPage.theme || '{}')
        setTheme({ ...DEFAULT_THEME, ...existing })
      }
      setLoading(false)
    })
  }, [router])

  const handleSave = async () => {
    if (!pageId) return
    setSaving(true)
    await fetch(`/api/pages/${pageId}/theme`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const applyPreset = (preset: Partial<PageTheme>) => {
    setTheme(prev => ({ ...prev, ...preset }))
  }

  if (loading) return (
    <AdminShell username={user?.username}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  // Preview helpers
  const isDark = isColorDark(theme.bgColor)
  const previewTextColor = isDark ? '#fff' : '#1A1A2E'
  const previewBg = theme.bgType === 'gradient' && theme.bgGradient ? theme.bgGradient : theme.bgColor
  const radius = theme.buttonRadius === 'pill' ? 9999 : theme.buttonRadius === 'square' ? 6 : 12

  return (
    <AdminShell username={user?.username}>
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left: Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-bold text-2xl" style={{ color: 'var(--color-text-primary)' }}>主題外觀</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>自訂你的個人頁面風格</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary"
              style={{ fontSize: 14, padding: '10px 22px', opacity: saving ? 0.7 : 1 }}>
              {saved ? <><Check size={15} />已儲存</> : saving ? '儲存中…' : '儲存主題'}
            </button>
          </div>

          {/* Presets */}
          <Section title="快速套用">
            <div className="grid grid-cols-4 gap-3">
              {PRESET_THEMES.map(({ name, theme: preset }) => (
                <button key={name} onClick={() => applyPreset(preset)}
                  className="text-center p-3 rounded-xl transition-all"
                  style={{ border: '1px solid var(--color-border)', background: 'white', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                  <div className="w-10 h-10 rounded-lg mx-auto mb-2" style={{
                    background: preset.bgType === 'gradient' && preset.bgGradient ? preset.bgGradient : preset.bgColor,
                    border: '2px solid ' + (preset.primaryColor ?? '#5090FF'),
                  }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{name}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Primary Color */}
          <Section title="主題色">
            <div className="flex items-center gap-3">
              <input type="color" value={theme.primaryColor}
                onChange={e => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer" style={{ border: '2px solid var(--color-border)', padding: 0 }} />
              <input value={theme.primaryColor}
                onChange={e => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="text-sm font-mono px-3 py-2"
                style={{ border: '1px solid var(--color-border)', borderRadius: 8, width: 100 }} />
              <div className="flex gap-2">
                {['#5090FF', '#7C3AED', '#EC4899', '#F97316', '#10B981', '#1A1A2E'].map(c => (
                  <button key={c} onClick={() => setTheme(prev => ({ ...prev, primaryColor: c }))}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, border: theme.primaryColor === c ? '3px solid var(--color-text-primary)' : '2px solid var(--color-border)', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          </Section>

          {/* Background */}
          <Section title="背景">
            <div className="flex gap-2 mb-3">
              {(['solid', 'gradient'] as const).map(t => (
                <button key={t} onClick={() => setTheme(prev => ({ ...prev, bgType: t }))}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    background: theme.bgType === t ? 'var(--color-primary)' : 'white',
                    color: theme.bgType === t ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${theme.bgType === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                  }}>
                  {{ solid: '純色', gradient: '漸層' }[t]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={theme.bgColor}
                onChange={e => {
                  const bgColor = e.target.value
                  setTheme(prev => ({
                    ...prev, bgColor,
                    bgGradient: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 60%)`,
                  }))
                }}
                className="w-10 h-10 rounded-lg cursor-pointer" style={{ border: '2px solid var(--color-border)', padding: 0 }} />
              <input value={theme.bgColor}
                onChange={e => {
                  const bgColor = e.target.value
                  setTheme(prev => ({
                    ...prev, bgColor,
                    bgGradient: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 60%)`,
                  }))
                }}
                className="text-sm font-mono px-3 py-2"
                style={{ border: '1px solid var(--color-border)', borderRadius: 8, width: 100 }} />
            </div>
          </Section>

          {/* Button Style */}
          <Section title="按鈕風格">
            <div className="flex gap-3 mb-4">
              {([
                { value: 'outline', label: '線框' },
                { value: 'filled', label: '填滿' },
                { value: 'soft', label: '柔和' },
              ] as const).map(({ value, label }) => (
                <button key={value} onClick={() => setTheme(prev => ({ ...prev, buttonStyle: value }))}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: theme.buttonStyle === value ? theme.primaryColor : 'white',
                    color: theme.buttonStyle === value ? 'white' : 'var(--color-text-secondary)',
                    border: `2px solid ${theme.buttonStyle === value ? theme.primaryColor : 'var(--color-border)'}`,
                    cursor: 'pointer',
                  }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              {([
                { value: 'rounded', label: '圓角' },
                { value: 'pill', label: '膠囊' },
                { value: 'square', label: '方角' },
              ] as const).map(({ value, label }) => (
                <button key={value} onClick={() => setTheme(prev => ({ ...prev, buttonRadius: value }))}
                  className="flex-1 py-3 text-sm font-semibold transition-all"
                  style={{
                    background: theme.buttonRadius === value ? theme.primaryColor : 'white',
                    color: theme.buttonRadius === value ? 'white' : 'var(--color-text-secondary)',
                    border: `2px solid ${theme.buttonRadius === value ? theme.primaryColor : 'var(--color-border)'}`,
                    borderRadius: value === 'pill' ? 9999 : value === 'square' ? 6 : 12,
                    cursor: 'pointer',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Right: Phone preview */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: 280 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <p className="text-center text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
              即時預覽
            </p>
            <div style={{ background: '#1A1A2E', borderRadius: 40, padding: 10, boxShadow: '0 24px 64px rgba(26,26,46,0.25)', width: 260 }}>
              <div style={{ background: previewBg, borderRadius: 32, overflow: 'hidden', height: 500 }}>
                <div style={{ padding: '32px 16px 24px', minHeight: '100%' }}>
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center mb-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mb-3"
                      style={{ background: theme.primaryColor, color: 'white', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      {(user?.username ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-sm" style={{ color: previewTextColor }}>{user?.username}</p>
                    <p className="text-xs mt-1" style={{ color: isDark ? '#94A3B8' : '#4A5568' }}>創作者簡介文字</p>
                  </div>
                  {/* Sample blocks */}
                  <div className="flex flex-col gap-2">
                    {['我的 YouTube 頻道', '最新文章', '合作洽詢'].map(text => (
                      <div key={text} className="flex items-center justify-between text-sm font-semibold"
                        style={{
                          padding: '12px 16px',
                          borderRadius: radius,
                          color: theme.buttonStyle === 'filled' ? 'white' : previewTextColor,
                          background: theme.buttonStyle === 'filled' ? theme.primaryColor
                            : theme.buttonStyle === 'soft' ? (isDark ? 'rgba(255,255,255,0.1)' : theme.primaryColor + '15')
                            : (isDark ? 'rgba(255,255,255,0.08)' : 'white'),
                          border: theme.buttonStyle === 'outline'
                            ? `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}`
                            : 'none',
                        }}>
                        <span>{text}</span>
                        <span style={{ opacity: 0.5 }}>›</span>
                      </div>
                    ))}
                    {/* Product sample */}
                    <div style={{
                      padding: '16px', borderRadius: radius,
                      background: isDark ? 'rgba(255,255,255,0.08)' : 'white',
                      border: isDark ? 'none' : '1px solid #E2E8F0',
                    }}>
                      <p className="font-bold text-xs" style={{ color: previewTextColor }}>Notion 模板包</p>
                      <p className="text-xs mt-0.5" style={{ color: isDark ? '#94A3B8' : '#4A5568' }}>50+ 模板</p>
                      <div className="mt-2 text-center text-xs font-bold py-2" style={{
                        background: theme.primaryColor, color: 'white',
                        borderRadius: radius,
                      }}>
                        NT$299 立即購買
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      {children}
    </div>
  )
}

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return false
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
