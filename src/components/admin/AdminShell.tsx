'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Link2, Settings, BarChart2, ExternalLink, LogOut,
  ShoppingBag, Mail, Moon, Sun, Shield, Sparkles, Home,
} from 'lucide-react'
import { useDict } from '@/components/i18n/DictProvider'

// Nav items defined as a function of dict so the labels stay locale-driven.
// Build inside the component because hooks can't run at module scope.
function buildNavItems(t: ReturnType<typeof useDict>['dict']['nav']) {
  return [
    { href: '/admin',             label: t.home,        icon: Home },
    { href: '/admin/analytics',   label: t.analytics,   icon: BarChart2 },
    { href: '/admin/orders',      label: t.orders,      icon: ShoppingBag },
    { href: '/admin/subscribers', label: t.subscribers, icon: Mail },
    { href: '/admin/settings',    label: t.settings,    icon: Settings },
  ]
}

interface Props {
  username?: string
  role?: string
  effectivePlan?: 'free' | 'pro' | 'premium'
  trialDaysLeft?: number
  children: React.ReactNode
}

export function AdminShell({ username, role, effectivePlan, trialDaysLeft, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { dict } = useDict()
  const NAV_ITEMS = buildNavItems(dict.nav)
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('admin-dark-mode') === 'true'
    return false
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('admin-dark-mode', 'true')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('admin-dark-mode', 'false')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const navLinkStyle = (active = false) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 as const,
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary-light)' : 'none',
    textDecoration: 'none' as const, border: 'none' as const, cursor: 'pointer' as const,
    transition: 'background 0.15s, color 0.15s',
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      {/* Header */}
      <header style={{ background: 'var(--color-card)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
                <Link2 size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Beam</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} style={navLinkStyle(isActive(href))}>
                  {Icon && <Icon size={14} />}{label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {/* Plan badge */}
            {effectivePlan && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                style={{
                  background:
                    effectivePlan === 'premium' ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)' :
                    effectivePlan === 'pro' ? 'var(--color-primary-light)' :
                    '#F3F4F6',
                  color:
                    effectivePlan === 'premium' ? '#F6E05E' :
                    effectivePlan === 'pro' ? 'var(--color-primary)' :
                    'var(--color-text-muted)',
                }}>
                <Sparkles size={10} />
                {effectivePlan === 'premium'
                  ? 'Premium'
                  : effectivePlan === 'pro'
                    ? (trialDaysLeft && trialDaysLeft > 0 ? dict.admin.trialBadge.replace('{days}', String(trialDaysLeft)) : 'Pro')
                    : 'Free'
                }
              </span>
            )}
            {/* Super Admin link */}
            {role === 'admin' && (
              <Link href="/super-admin" style={{ ...navLinkStyle(), display: 'flex' }} title="Super Admin">
                <Shield size={14} style={{ color: '#ED8936' }} />
              </Link>
            )}
            {username && (
              <a href={`/${username}`} target="_blank" rel="noopener noreferrer"
                style={{ ...navLinkStyle(), display: 'flex' }}>
                <ExternalLink size={14} /><span className="hidden sm:inline">{dict.common.preview}</span>
              </a>
            )}
            <button onClick={toggleDark} style={navLinkStyle()} title={dark ? dict.admin.lightMode : dict.admin.darkMode}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={handleLogout} style={navLinkStyle()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Page content — extra bottom padding on mobile to clear the bottom-tab nav */}
      <div className="pb-20 sm:pb-0">
        {children}
      </div>

      {/* Mobile bottom-tab nav (replaces the old hamburger drawer).
          Persistent, thumb-reachable, tracks pathname like a native app. */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40"
        style={{
          background: 'var(--color-card)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-stretch justify-around">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <a
                key={href}
                href={href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2"
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  textDecoration: 'none',
                  minHeight: 56,
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10, lineHeight: 1.2 }}>{label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
