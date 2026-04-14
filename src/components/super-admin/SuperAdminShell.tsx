'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Users, DollarSign, FileText, LogOut,
  Menu, X, Moon, Sun, ArrowLeft,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/super-admin', label: '總覽', icon: Shield },
  { href: '/super-admin/users', label: '用戶管理', icon: Users },
  { href: '/super-admin/revenue', label: '收入報表', icon: DollarSign },
  { href: '/super-admin/content', label: '內容審核', icon: FileText },
]

export function SuperAdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
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
    href === '/super-admin' ? pathname === '/super-admin' : pathname.startsWith(href)

  const navStyle = (active = false) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 as const,
    color: active ? '#C05621' : 'var(--color-text-secondary)',
    background: active ? '#FFFAF0' : 'none',
    textDecoration: 'none' as const, border: 'none' as const, cursor: 'pointer' as const,
    transition: 'background 0.15s, color 0.15s',
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <header style={{ background: 'var(--color-card)', borderBottom: '2px solid #ED8936', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ED8936, #DD6B20)' }}>
                <Shield size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: '#C05621', fontFamily: 'var(--font-display)' }}>Super Admin</span>
            </div>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} style={navStyle(isActive(href))}>
                  <Icon size={14} />{label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" style={{ ...navStyle(), fontSize: 13 }}>
              <ArrowLeft size={14} />用戶後台
            </Link>
            <button onClick={toggleDark} style={navStyle()} title={dark ? '淺色模式' : '深色模式'}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={handleLogout} style={navStyle()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <LogOut size={14} />
            </button>
            <button className="sm:hidden" onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-text-secondary)' }}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0" style={{ background: 'rgba(26,26,46,0.5)' }} onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64" style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <span className="font-bold" style={{ color: '#C05621' }}>Super Admin</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <a key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                  style={{
                    color: isActive(href) ? '#C05621' : 'var(--color-text-secondary)',
                    background: isActive(href) ? '#FFFAF0' : 'transparent',
                    textDecoration: 'none',
                  }}>
                  <Icon size={16} />{label}
                </a>
              ))}
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                <ArrowLeft size={16} />返回用戶後台
              </Link>
            </nav>
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
