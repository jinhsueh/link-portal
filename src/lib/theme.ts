/** Page theme configuration */
export interface PageTheme {
  primaryColor: string    // hex, e.g. "#5090FF"
  bgType: 'solid' | 'gradient' | 'image'
  bgColor: string         // hex
  bgGradient?: string     // CSS gradient string
  bgImage?: string        // URL
  buttonStyle: 'filled' | 'outline' | 'soft'
  buttonRadius: 'rounded' | 'pill' | 'square'
  fontStyle: 'default' | 'serif' | 'mono'
}

export const DEFAULT_THEME: PageTheme = {
  primaryColor: '#5090FF',
  bgType: 'gradient',
  bgColor: '#F0F4FF',
  bgGradient: 'linear-gradient(135deg, #F0F4FF 0%, #FFFFFF 60%)',
  buttonStyle: 'outline',
  buttonRadius: 'rounded',
  fontStyle: 'default',
}

export const PRESET_THEMES: { name: string; theme: Partial<PageTheme> }[] = [
  {
    name: '預設藍',
    theme: { primaryColor: '#5090FF', bgType: 'gradient', bgColor: '#F0F4FF', bgGradient: 'linear-gradient(135deg, #F0F4FF 0%, #FFFFFF 60%)' },
  },
  {
    name: '紫羅蘭',
    theme: { primaryColor: '#7C3AED', bgType: 'gradient', bgColor: '#F3E8FF', bgGradient: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 60%)' },
  },
  {
    name: '珊瑚橘',
    theme: { primaryColor: '#F97316', bgType: 'gradient', bgColor: '#FFF7ED', bgGradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 60%)' },
  },
  {
    name: '森林綠',
    theme: { primaryColor: '#10B981', bgType: 'gradient', bgColor: '#ECFDF5', bgGradient: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 60%)' },
  },
  {
    name: '玫瑰粉',
    theme: { primaryColor: '#EC4899', bgType: 'gradient', bgColor: '#FDF2F8', bgGradient: 'linear-gradient(135deg, #FDF2F8 0%, #FFFFFF 60%)' },
  },
  {
    name: '暗黑模式',
    theme: { primaryColor: '#60A5FA', bgType: 'solid', bgColor: '#0F172A' },
  },
  {
    name: '米白溫暖',
    theme: { primaryColor: '#D97706', bgType: 'solid', bgColor: '#FFFBEB' },
  },
  {
    name: '經典黑白',
    theme: { primaryColor: '#1A1A2E', bgType: 'solid', bgColor: '#FFFFFF' },
  },
]

/** Parse JSON theme from DB, merge with defaults */
export function parseTheme(json: string | null | undefined): PageTheme {
  if (!json) return DEFAULT_THEME
  try {
    const parsed = JSON.parse(json)
    return { ...DEFAULT_THEME, ...parsed }
  } catch {
    return DEFAULT_THEME
  }
}

/** Generate CSS custom properties from theme */
export function themeToCSS(theme: PageTheme): React.CSSProperties {
  const isDark = isColorDark(theme.bgColor)
  const textPrimary = isDark ? '#FFFFFF' : '#1A1A2E'
  const textSecondary = isDark ? '#CBD5E1' : '#4A5568'
  const textMuted = isDark ? '#94A3B8' : '#A0AEC0'
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'white'

  let bg: string
  if (theme.bgType === 'gradient' && theme.bgGradient) {
    bg = theme.bgGradient
  } else if (theme.bgType === 'image' && theme.bgImage) {
    bg = `url(${theme.bgImage}) center/cover no-repeat`
  } else {
    bg = theme.bgColor
  }

  const radius = theme.buttonRadius === 'pill' ? '9999px'
    : theme.buttonRadius === 'square' ? '6px' : '12px'

  return {
    '--theme-primary': theme.primaryColor,
    '--theme-bg': bg,
    '--theme-text': textPrimary,
    '--theme-text-secondary': textSecondary,
    '--theme-text-muted': textMuted,
    '--theme-border': borderColor,
    '--theme-card-bg': cardBg,
    '--theme-radius': radius,
    '--theme-btn-style': theme.buttonStyle,
  } as React.CSSProperties
}

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return false
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  // Perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
