'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PRESET_THEMES, DEFAULT_THEME, type PageTheme } from '@/lib/theme'

interface Props {
  initialTheme: PageTheme
  username?: string
  onThemeChange?: (theme: PageTheme) => void
}

/**
 * ThemeEditor — account-level visual identity editor. Theme used to be saved
 * per-Page, but that broke the "switch tabs feels like a different site" UX
 * and didn't match users' "one brand, multiple pages" mental model. Now saves
 * to `/api/me` PATCH `theme` so all pages share the same visual.
 */
export function ThemeEditor({ initialTheme, onThemeChange }: Props) {
  const [theme, setTheme] = useState<PageTheme>(initialTheme)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateTheme = (partial: Partial<PageTheme>) => {
    const next = { ...theme, ...partial }
    setTheme(next)
    onThemeChange?.(next)
  }

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme }),
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

      {/* Layout — 底版 + 4-variant block layout */}
      <Section title="版面樣式">
        {/* Layout variants — 4 presets. Combination of (narrow / wide) ×
            (single column / 2-col grid). */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {([
            { value: 'stacked',     label: '直式',         desc: '單欄、窄版(預設)',          wide: false },
            { value: 'horizontal',  label: '橫式',         desc: '雙欄、窄版',                  wide: false },
            { value: 'fullwidth',   label: '滿版',         desc: '單欄、寬版',                  wide: false },
            { value: 'cards',       label: '小卡',         desc: '雙欄、寬版',                  wide: false },
            // hero-banner spans both columns of the 2-col picker since its
            // visual is fundamentally larger / different from the others.
            { value: 'hero-banner', label: 'Hero Banner ✨', desc: '大圖頂版 + 雙欄(Portaly 風)', wide: true  },
          ] as const).map(({ value, label, desc, wide }) => {
            const active = (theme.layout ?? 'stacked') === value
            return (
              <button key={value} onClick={() => updateTheme({ layout: value })}
                className={`py-2.5 px-3 rounded-xl text-sm transition-all text-left ${wide ? 'col-span-2' : ''}`}
                style={{
                  background: active ? theme.primaryColor : 'white',
                  color: active ? 'white' : 'var(--color-text-secondary)',
                  border: `2px solid ${active ? theme.primaryColor : 'var(--color-border)'}`,
                  cursor: 'pointer',
                }}>
                <div className="font-semibold">{label}</div>
                <div className="text-xs mt-0.5" style={{ opacity: active ? 0.85 : 0.65 }}>{desc}</div>
              </button>
            )
          })}
        </div>

        {/* Bg panel — 5 modes: 4 presets + custom. Boolean legacy values are
            normalised to strings via parseTheme, but updateTheme always writes
            string values from here on. */}
        <BgPanelControls theme={theme} updateTheme={updateTheme} />
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
            <button key={value} onClick={() => updateTheme({ buttonRadius: value, cornerStyle: value })}
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

      {/* Phase 2 visual upgrade: Cut corners (#切角). The 6 cut variants
          extend the basic rounded/pill/square trio above — picking a cut
          here overrides buttonRadius's geometry. Visual previews use the
          same clip-path polygons as the public renderer so what they
          see is what they'll get. */}
      <Section title="角落樣式 ✂️">
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          選一個切角樣式給所有卡片區塊(連結、橫幅、商品、輪播…)。
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {([
            { value: 'cut-tr',       label: '右上切', clip: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' },
            { value: 'cut-tl',       label: '左上切', clip: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)' },
            { value: 'cut-br',       label: '右下切', clip: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' },
            { value: 'cut-bl',       label: '左下切', clip: 'polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px))' },
            { value: 'cut-diagonal', label: '對角切', clip: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' },
            { value: 'notched',      label: '門票形', clip: 'polygon(0 0, 100% 0, 100% calc(50% - 6px), calc(100% - 6px) 50%, 100% calc(50% + 6px), 100% 100%, 0 100%, 0 calc(50% + 6px), 6px 50%, 0 calc(50% - 6px))' },
          ] as const).map(({ value, label, clip }) => {
            const active = theme.cornerStyle === value
            return (
              <button key={value} onClick={() => updateTheme({ cornerStyle: value })}
                className="relative py-7 px-3 text-xs font-semibold transition-all overflow-hidden"
                style={{
                  background: active ? theme.primaryColor : 'white',
                  color: active ? 'white' : 'var(--color-text-secondary)',
                  border: `2px solid ${active ? theme.primaryColor : 'var(--color-border)'}`,
                  borderRadius: 0,
                  clipPath: clip,
                  cursor: 'pointer',
                }}>
                {label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Phase 2 visual upgrade: Entrance animation (#動畫). Driven by
          IntersectionObserver in AnimatedBlock so blocks animate as the
          user scrolls down — closes the "Portaly feels alive" gap. */}
      <Section title="進場動畫 🎬">
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          每個區塊滑進畫面時的動效。系統會自動尊重使用者的「減少動態」偏好。
        </p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'none',        label: '無' },
            { value: 'fade',        label: '淡入' },
            { value: 'slide-up',    label: '上滑' },
            { value: 'slide-left',  label: '左滑' },
            { value: 'slide-right', label: '右滑' },
            { value: 'scale',       label: '縮放' },
          ] as const).map(({ value, label }) => {
            const active = (theme.entranceAnimation ?? 'slide-up') === value
            return (
              <button key={value} onClick={() => updateTheme({ entranceAnimation: value })}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: active ? theme.primaryColor : 'white',
                  color: active ? 'white' : 'var(--color-text-secondary)',
                  border: `2px solid ${active ? theme.primaryColor : 'var(--color-border)'}`,
                  cursor: 'pointer',
                }}>
                {label}
              </button>
            )
          })}
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

/**
 * Bg panel mode picker. 4 preset cards + 5th "custom" card that expands to
 * reveal color picker / opacity slider / border / shadow toggles. Each preset
 * shows a tiny visual swatch so users see what they're picking before
 * committing — the right column phone-mockup also reflects choices live.
 */
function BgPanelControls({ theme, updateTheme }: { theme: PageTheme; updateTheme: (p: Partial<PageTheme>) => void }) {
  const mode: PageTheme['bgPanel'] = typeof theme.bgPanel === 'boolean'
    ? (theme.bgPanel ? 'frosted-light' : 'none')
    : theme.bgPanel ?? 'none'

  const presets = [
    { value: 'none' as const,           label: '無底版',  desc: '內容直接在背景上' },
    { value: 'frosted-light' as const,  label: '霧白',    desc: '白色霧面玻璃' },
    { value: 'frosted-dark' as const,   label: '霧深',    desc: '深色霧面玻璃' },
    { value: 'brand' as const,          label: '品牌色',  desc: '主色 8% 暈染' },
    { value: 'custom' as const,         label: '自訂',    desc: '完全自訂顏色' },
  ]

  // Mini preview swatch — visualises each preset using the actual theme primary.
  const swatchFor = (val: PageTheme['bgPanel']): React.CSSProperties => {
    if (val === 'none') return { background: 'transparent', border: '1px dashed currentColor' }
    if (val === 'frosted-light') return { background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.08)' }
    if (val === 'frosted-dark') return { background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.18)' }
    if (val === 'brand') return { background: theme.primaryColor + '14', border: `1px solid ${theme.primaryColor}33` }
    if (val === 'custom') {
      const c = theme.bgPanelCustom?.color ?? '#FFFFFF'
      return { background: c, border: '1px solid rgba(0,0,0,0.08)' }
    }
    return {}
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {presets.map(({ value, label, desc }) => {
          const active = mode === value
          return (
            <button key={value}
              onClick={() => updateTheme({ bgPanel: value })}
              className="rounded-xl p-2.5 text-center transition-all"
              style={{
                background: active ? theme.primaryColor : 'white',
                color: active ? 'white' : 'var(--color-text-secondary)',
                border: `2px solid ${active ? theme.primaryColor : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
              title={desc}>
              {/* Swatch */}
              <div className="rounded-md mx-auto mb-1.5"
                style={{ width: 36, height: 24, ...swatchFor(value) }} />
              <div className="text-xs font-semibold whitespace-nowrap">{label}</div>
            </button>
          )
        })}
      </div>

      {/* Custom controls — only render when 'custom' is the active mode. */}
      {mode === 'custom' && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <CustomBgPanelEditor theme={theme} updateTheme={updateTheme} />
        </div>
      )}
    </div>
  )
}

function CustomBgPanelEditor({ theme, updateTheme }: { theme: PageTheme; updateTheme: (p: Partial<PageTheme>) => void }) {
  const c = theme.bgPanelCustom ?? { color: '#FFFFFF', opacity: 70, showBorder: true, showShadow: true }
  const set = (patch: Partial<typeof c>) => updateTheme({ bgPanelCustom: { ...c, ...patch } })

  return (
    <>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>顏色</label>
        <div className="flex items-center gap-2">
          <input type="color" value={c.color}
            onChange={e => set({ color: e.target.value })}
            style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }} />
          <input value={c.color}
            onChange={e => set({ color: e.target.value })}
            placeholder="#FFFFFF"
            style={{ padding: '8px 10px', fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 8, fontFamily: 'monospace', flex: 1, background: 'white', outline: 'none' }} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          不透明度 <span style={{ color: 'var(--color-text-secondary)' }}>{c.opacity}%</span>
        </label>
        <input type="range" min={5} max={95} step={1} value={c.opacity}
          onChange={e => set({ opacity: Number(e.target.value) })}
          className="w-full" style={{ accentColor: 'var(--color-primary)' }} />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={c.showBorder}
            onChange={e => set({ showBorder: e.target.checked })}
            style={{ width: 14, height: 14, accentColor: 'var(--color-primary)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>細邊</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={c.showShadow}
            onChange={e => set({ showShadow: e.target.checked })}
            style={{ width: 14, height: 14, accentColor: 'var(--color-primary)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>浮起陰影</span>
        </label>
      </div>
    </>
  )
}
