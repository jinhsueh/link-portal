'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PRESET_THEMES, DEFAULT_THEME, type PageTheme } from '@/lib/theme'

interface Props {
  pageId: string | null
  initialTheme: PageTheme
  username?: string
  onThemeChange?: (theme: PageTheme) => void
}

export function ThemeEditor({ pageId, initialTheme, onThemeChange }: Props) {
  const [theme, setTheme] = useState<PageTheme>(initialTheme)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateTheme = (partial: Partial<PageTheme>) => {
    const next = { ...theme, ...partial }
    setTheme(next)
    onThemeChange?.(next)
  }

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
    const next = { ...theme, ...preset }
    setTheme(next)
    onThemeChange?.(next)
  }

  return (
    <div className="space-y-5">
      {/* Save button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>主題外觀</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>自訂你的個人頁面風格</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold"
          style={{
            background: saved ? '#22C55E' : 'var(--color-primary)',
            color: 'white', border: 'none', cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}>
          {saved ? <><Check size={14} />已儲存</> : saving ? '儲存中…' : '儲存主題'}
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
            onChange={e => updateTheme({ primaryColor: e.target.value })}
            className="w-10 h-10 rounded-lg cursor-pointer" style={{ border: '2px solid var(--color-border)', padding: 0 }} />
          <input value={theme.primaryColor}
            onChange={e => updateTheme({ primaryColor: e.target.value })}
            className="text-sm font-mono px-3 py-2"
            style={{ border: '1px solid var(--color-border)', borderRadius: 8, width: 100 }} />
          <div className="flex gap-2">
            {['#5090FF', '#7C3AED', '#EC4899', '#F97316', '#10B981', '#1A1A2E'].map(c => (
              <button key={c} onClick={() => updateTheme({ primaryColor: c })}
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
            <button key={t} onClick={() => updateTheme({ bgType: t })}
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
              updateTheme({
                bgColor,
                bgGradient: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 60%)`,
              })
            }}
            className="w-10 h-10 rounded-lg cursor-pointer" style={{ border: '2px solid var(--color-border)', padding: 0 }} />
          <input value={theme.bgColor}
            onChange={e => {
              const bgColor = e.target.value
              updateTheme({
                bgColor,
                bgGradient: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 60%)`,
              })
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
            <button key={value} onClick={() => updateTheme({ buttonStyle: value })}
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
            <button key={value} onClick={() => updateTheme({ buttonRadius: value })}
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
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      {children}
    </div>
  )
}
