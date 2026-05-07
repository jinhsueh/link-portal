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
  /**
   * "底版" — frame the profile content in a card. Five modes ("Preset + Custom"):
   *   none           — no card, content sits on page bg (default)
   *   frosted-light  — translucent white + blur (Apple style, classic light)
   *   frosted-dark   — translucent dark + blur (for dark page backgrounds)
   *   brand          — primaryColor at 8% opacity + blur (auto brand-tinted)
   *   custom         — user-controlled color + opacity + border + shadow
   *
   * Legacy boolean values are migrated in `parseTheme`:
   *   true  → 'frosted-light'
   *   false → 'none'
   */
  bgPanel?: 'none' | 'frosted-light' | 'frosted-dark' | 'brand' | 'custom' | boolean

  /** Only meaningful when bgPanel === 'custom'. */
  bgPanelCustom?: {
    color: string        // hex, e.g. "#FFFFFF"
    opacity: number      // 5-95, clamped at render
    showBorder: boolean
    showShadow: boolean
  }

  /**
   * Public-page block layout preset. Two orthogonal axes baked into 4 variants:
   *   - 直式 stacked   = single column, narrow container (default)
   *   - 橫式 horizontal= 2-column grid, narrow container
   *   - 滿版 fullwidth = single column, wide container
   *   - 小卡 cards     = 2-column grid, wide container
   *
   * "Rich" blocks (banner, video, carousel, calendar, embed, map, faq) always
   * span both columns in grid layouts — only compact types (link, heading,
   * email_form, product, countdown) actually go side-by-side.
   */
  layout?: 'stacked' | 'horizontal' | 'fullwidth' | 'cards'

  /**
   * Entrance animation when each block enters the viewport. Driven by
   * IntersectionObserver in AnimatedBlock so it fires on scroll, not just
   * on initial mount. Default 'slide-up' — the previous behaviour was a
   * lighter fade so this is intentionally a tiny visual upgrade for everyone.
   * `'none'` opts out (e.g. for users who find motion distracting).
   */
  entranceAnimation?: 'none' | 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale'

  /**
   * Card corner geometry. Extends `buttonRadius` (kept for backward compat)
   * with five "cut corner" variants that use `clip-path: polygon(...)` to
   * produce 45° angled corners — visually distinctive (Portaly / ticket-stub
   * style). When set to anything other than 'rounded' / 'pill' / 'square',
   * `--theme-clip-path` is emitted and `border-radius` is forced to 0 since
   * clip-path doesn't combine with rounded edges cleanly.
   *
   *   rounded      — current default (border-radius)
   *   pill         — fully rounded (border-radius: 9999px)
   *   square       — sharp 90° corners (border-radius: 0)
   *   cut-tr       — top-right corner clipped at 45°
   *   cut-tl       — top-left
   *   cut-br       — bottom-right
   *   cut-bl       — bottom-left
   *   cut-diagonal — top-right + bottom-left clipped (parallelogram-ish)
   *   notched      — top + bottom centre notch (門票 / ticket stub)
   */
  cornerStyle?: 'rounded' | 'pill' | 'square' | 'cut-tr' | 'cut-tl' | 'cut-br' | 'cut-bl' | 'cut-diagonal' | 'notched'
}

export const DEFAULT_THEME: PageTheme = {
  primaryColor: '#5090FF',
  bgType: 'gradient',
  bgColor: '#F0F4FF',
  bgGradient: 'linear-gradient(135deg, #F0F4FF 0%, #FFFFFF 60%)',
  buttonStyle: 'outline',
  buttonRadius: 'rounded',
  fontStyle: 'default',
  bgPanel: 'none',
  layout: 'stacked',
  entranceAnimation: 'slide-up',
  cornerStyle: 'rounded',
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
    // Legacy: bgPanel was a boolean before D-plan rewrite. Migrate at read time
    // so existing themes don't change visually after the upgrade:
    //   true  → 'frosted-light' (matches the old visual)
    //   false → 'none'
    if (typeof parsed.bgPanel === 'boolean') {
      parsed.bgPanel = parsed.bgPanel ? 'frosted-light' : 'none'
    }
    return { ...DEFAULT_THEME, ...parsed }
  } catch {
    return DEFAULT_THEME
  }
}

/**
 * Convert hex color + opacity (0-100) to an rgba() string.
 * Handles 3- and 6-digit hex.
 */
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const expanded = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean.padEnd(6, '0').slice(0, 6)
  const r = parseInt(expanded.substring(0, 2), 16)
  const g = parseInt(expanded.substring(2, 4), 16)
  const b = parseInt(expanded.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity / 100))})`
}

/**
 * Compute the CSS style for the profile bg panel based on theme.bgPanel mode.
 * Returns an empty object when no panel is shown (mode === 'none' or undefined).
 *
 * Centralised here so ProfileView and any preview UI render identically.
 */
export function computeBgPanelStyle(theme: PageTheme): React.CSSProperties {
  const mode = typeof theme.bgPanel === 'boolean'
    ? (theme.bgPanel ? 'frosted-light' : 'none')
    : theme.bgPanel ?? 'none'

  if (mode === 'none') return {}

  switch (mode) {
    case 'frosted-light':
      return {
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 12px 40px rgba(80,144,255,0.10)',
      }

    case 'frosted-dark':
      return {
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
      }

    case 'brand': {
      // primaryColor at ~8% with brand-tinted shadow. Auto-derives so users
      // don't have to manually pick a colour that matches their brand —
      // changing primaryColor cascades to the bg panel.
      const tint = hexToRgba(theme.primaryColor, 8)
      const border = hexToRgba(theme.primaryColor, 18)
      const shadow = hexToRgba(theme.primaryColor, 18)
      return {
        background: tint,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${border}`,
        boxShadow: `0 12px 40px ${shadow}`,
      }
    }

    case 'custom': {
      const c = theme.bgPanelCustom
      if (!c?.color) return {}
      // Clamp opacity to 5-95 so users can't pick fully transparent (invisible
      // panel = bug surface) or fully opaque (loses the blur character).
      const opacity = Math.max(5, Math.min(95, c.opacity))
      return {
        background: hexToRgba(c.color, opacity),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        ...(c.showBorder ? {
          border: `1px solid ${isColorDark(c.color) ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
        } : {}),
        ...(c.showShadow ? {
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        } : {}),
      }
    }
  }
  return {}
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

  // cornerStyle wins over buttonRadius when both are set — but if cornerStyle
  // is unset (legacy themes), we map buttonRadius into cornerStyle so the
  // visual is unchanged. Either way, the shape we emit is "the resolved
  // cornerStyle", and downstream blocks read --theme-radius / --theme-clip-path
  // accordingly.
  const corner = theme.cornerStyle
    ?? (theme.buttonRadius === 'pill' ? 'pill'
       : theme.buttonRadius === 'square' ? 'square'
       : 'rounded')

  let radius = '12px'                  // default rounded
  let clipPath = 'none'                // default no clipping
  switch (corner) {
    case 'pill':         radius = '9999px'; break
    case 'square':       radius = '0';      break
    case 'rounded':      radius = '12px';   break
    case 'cut-tr':       radius = '0'; clipPath = 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)'; break
    case 'cut-tl':       radius = '0'; clipPath = 'polygon(18px 0, 100% 0, 100% 100%, 0 100%, 0 18px)'; break
    case 'cut-br':       radius = '0'; clipPath = 'polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)'; break
    case 'cut-bl':       radius = '0'; clipPath = 'polygon(0 0, 100% 0, 100% 100%, 18px 100%, 0 calc(100% - 18px))'; break
    case 'cut-diagonal': radius = '0'; clipPath = 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))'; break
    case 'notched':
      // Door-ticket: small semi-circular notches on left + right midpoints.
      // Approximated with polygon (no native CSS for circular notches in
      // clip-path without SVG masks; an octagon-ish cut reads as "notched").
      radius = '0'
      clipPath = 'polygon(0 0, 100% 0, 100% calc(50% - 8px), calc(100% - 8px) 50%, 100% calc(50% + 8px), 100% 100%, 0 100%, 0 calc(50% + 8px), 8px 50%, 0 calc(50% - 8px))'
      break
  }

  return {
    '--theme-primary': theme.primaryColor,
    '--theme-bg': bg,
    '--theme-text': textPrimary,
    '--theme-text-secondary': textSecondary,
    '--theme-text-muted': textMuted,
    '--theme-border': borderColor,
    '--theme-card-bg': cardBg,
    '--theme-radius': radius,
    '--theme-clip-path': clipPath,
    '--theme-btn-style': theme.buttonStyle,
  } as React.CSSProperties
}

/**
 * Block types that always span the full available width in grid layouts
 * (`horizontal` / `cards`). These are "rich" content blocks where halving the
 * width destroys the experience — e.g. a YouTube embed at 50% is unwatchable,
 * a carousel at 50% loses the navigation arrows. Everything else is allowed
 * to sit side-by-side.
 */
export const RICH_BLOCK_TYPES: ReadonlySet<string> = new Set([
  'banner',
  'video',
  'carousel',
  'image_grid',
  'calendar_event',
  'embed',
  'map',
  'faq',
])

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '')
  if (clean.length < 6) return false
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  // Perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
