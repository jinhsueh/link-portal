'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Link2, Settings, BarChart2, ExternalLink, LogOut,
  ShoppingBag, Palette, Menu, X, Mail,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: '主頁', icon: null },
  { href: '/admin/analytics', label: '數據分析', icon: BarChart2 },
  { href: '/admin/orders', label: '訂單管理', icon: ShoppingBag },
  { href: '/admin/subscribers', label: '訂閱名單', icon: Mail },
  { href: '/admin/theme', label: '主題外觀', icon: Palette },
  { href: '/admin/settings', label: '設定', icon: Settings },
]

interface Props {
  username?: string
  children: React.ReactNode
}

export function AdminShell({ username, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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
      <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
                <Link2 size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Link Portal</span>
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
            {username && (
              <a href={`/${username}`} target="_blank" rel="noopener noreferrer"
                style={{ ...navLinkStyle(), display: 'flex' }}>
                <ExternalLink size={14} /><span className="hidden sm:inline">預覽</span>
              </a>
            )}
            <button onClick={handleLogout} style={navLinkStyle()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <LogOut size={14} />
            </button>
            {/* Mobile hamburger */}
            <button className="sm:hidden" onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-secondary)' }}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(26,26,46,0.5)' }}
            onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64"
            style={{ background: 'white', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>選單</span>
              <button onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                  style={{
                    color: isActive(href) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    background: isActive(href) ? 'var(--color-primary-light)' : 'transparent',
                    textDecoration: 'none',
                  }}>
                  {Icon && <Icon size={16} />}{label}
                </a>
              ))}
              {username && (
                <a href={`/${username}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                  <ExternalLink size={16} />預覽頁面
                </a>
              )}
            </nav>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
