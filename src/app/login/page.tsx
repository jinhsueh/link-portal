'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link2, ArrowRight, Lock, Check, X } from 'lucide-react'
import { useDict } from '@/components/i18n/DictProvider'
import { SITE_HOST } from '@/lib/site'
import { useSocialLogin } from './social-login-context'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'reserved'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { dict } = useDict()
  const { google: googleEnabled } = useSocialLogin()
  const t = dict.auth
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'setPassword' | 'pickUsername'>('login')
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [oauthEmail, setOauthEmail] = useState<string | null>(null)

  // Returning from Google: either a new user needs to pick a username
  // (?oauth=pending, profile lives in a signed cookie) or an error occurred.
  const oauthErrorParam = searchParams.get('oauth_error')
  const oauthErrorMsg = !oauthErrorParam ? ''
    : oauthErrorParam === 'denied' ? t.oauthErrorDenied
    : oauthErrorParam === 'banned' ? t.oauthErrorBanned
    : t.oauthErrorGeneric
  const shownError = error || oauthErrorMsg

  useEffect(() => {
    if (searchParams.get('oauth') !== 'pending') return
    fetch('/api/auth/google/complete')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data?.pending) { setError(t.oauthErrorGeneric); return }
        setOauthEmail(data.email ?? null)
        if (data.suggestedUsername) setUsername(data.suggestedUsername)
        setMode('pickUsername')
      })
      .catch(() => setError(t.oauthErrorGeneric))
  }, [searchParams, t])

  // Live availability check — debounced 350ms after the user stops typing.
  // Only useful for signup (i.e. login mode); shows whether the entered
  // username is free, taken, invalid, or reserved.
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (mode === 'setPassword') {
        setUsernameStatus('idle')
        return
      }

      const u = username.trim().toLowerCase()
      if (!u) {
        setUsernameStatus('idle')
        return
      }
      if (!/^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/.test(u) || u.length < 3 || u.length > 30) {
        setUsernameStatus('invalid')
        return
      }

      setUsernameStatus('checking')
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(u)}`)
        const data = await res.json()
        if (data.available) setUsernameStatus('available')
        else if (data.reason === 'reserved') setUsernameStatus('reserved')
        else setUsernameStatus('taken')
      } catch { setUsernameStatus('idle') }
    }, 350)
    return () => clearTimeout(timer)
  }, [username, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'pickUsername') {
      const res = await fetch('/api/auth/google/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.genericError); setLoading(false); return }
      router.push('/admin')
      return
    }

    if (mode === 'setPassword') {
      if (password !== confirmPassword) {
        setError(t.passwordMismatch)
        setLoading(false)
        return
      }
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, setPassword: true }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t.genericError); setLoading(false); return }
      router.push('/admin')
      return
    }

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email: email || undefined, password }),
    })
    const data = await res.json()

    if (res.status === 409 && data.needsPasswordSetup) {
      setMode('setPassword')
      setPassword('')
      setError('')
      setLoading(false)
      return
    }

    if (!res.ok) { setError(data.error || t.genericError); setLoading(false); return }
    router.push('/admin')
  }

  const usernameField = (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
        {t.usernameLabelExt} <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>({t.usernameAllowedChars})</span>
      </label>
      <div className="flex items-center overflow-hidden" style={{
        border: `1px solid ${
          usernameStatus === 'available' ? '#10B981'
          : usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'reserved' ? '#EF4444'
          : 'var(--color-border)'
        }`,
        borderRadius: 12,
      }}>
        <span className="px-3 py-3 text-xs border-r" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
          {SITE_HOST}/
        </span>
        <input type="text" value={username}
          onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
          required minLength={3} maxLength={30} placeholder="username"
          className="flex-1 px-3 py-3 text-sm focus:outline-none"
          style={{ background: 'white', color: 'var(--color-text-primary)' }} />
        {usernameStatus === 'checking' && (
          <span className="px-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.checking}</span>
        )}
        {usernameStatus === 'available' && (
          <Check size={16} className="mr-3" style={{ color: '#10B981' }} />
        )}
        {(usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'reserved') && (
          <X size={16} className="mr-3" style={{ color: '#EF4444' }} />
        )}
      </div>
      {usernameStatus === 'taken' && (
        <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>
          {t.usernameTakenSwitch}
        </p>
      )}
      {usernameStatus === 'reserved' && (
        <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{t.usernameReserved}</p>
      )}
      {usernameStatus === 'invalid' && username.length >= 3 && (
        <p className="text-xs mt-1.5" style={{ color: '#EF4444' }}>{t.usernameRules}</p>
      )}
      {usernameStatus === 'available' && (
        <p className="text-xs mt-1.5" style={{ color: '#10B981' }}>{t.usernameAvailable}</p>
      )}
    </div>
  )

  const inputStyle = {
    width: '100%', padding: '11px 16px', fontSize: 14,
    border: '1px solid var(--color-border)', borderRadius: 12,
    color: 'var(--color-text-primary)', background: 'white', outline: 'none',
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
            Beam
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{t.brandSubtitle}</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 16, padding: 32, boxShadow: 'var(--shadow-md)' }}>

          {mode === 'setPassword' ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{t.setPasswordTitle}</h2>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                <strong>{username}</strong> {t.setPasswordSubtitle}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{t.newPasswordLabel}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required minLength={6} placeholder={t.passwordMin} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>{t.confirmPasswordLabel}</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    required minLength={6} placeholder={t.passwordRetype} style={inputStyle} />
                </div>
                {error && (
                  <p className="text-sm px-4 py-3 rounded-xl" style={{ color: '#E53E3E', background: '#FFF5F5', border: '1px solid #FED7D7' }}>{error}</p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center"
                  style={{ padding: '13px 28px', opacity: loading ? 0.5 : 1 }}>
                  {loading ? dict.common.processing : t.submitSetPassword}
                </button>
              </form>
            </>
          ) : mode === 'pickUsername' ? (
            <>
              <h2 className="font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>{t.pickUsernameTitle}</h2>
              {oauthEmail && (
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                  {t.pickUsernameSubtitle} <strong>{oauthEmail}</strong>
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {usernameField}
                {error && (
                  <p className="text-sm px-4 py-3 rounded-xl" style={{ color: '#E53E3E', background: '#FFF5F5', border: '1px solid #FED7D7' }}>{error}</p>
                )}
                <button type="submit" disabled={loading || usernameStatus !== 'available'}
                  className="btn-primary w-full justify-center"
                  style={{ padding: '13px 28px', opacity: (loading || usernameStatus !== 'available') ? 0.5 : 1 }}>
                  {loading ? dict.common.processing : t.submitPickUsername}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>{t.loginRegisterTitle}</h2>
              {googleEnabled && (
                <>
                  <button type="button" onClick={() => window.location.assign('/api/auth/google/start')}
                    className="flex items-center justify-center gap-2 w-full text-sm font-semibold cursor-pointer"
                    style={{ padding: '11px 16px', border: '1px solid var(--color-border)', borderRadius: 12, color: 'var(--color-text-primary)', background: 'white' }}>
                    <GoogleIcon /> {t.continueWithGoogle}
                  </button>
                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.orDivider}</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  </div>
                </>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {usernameField}

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    {t.emailLabel} <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>{t.emailNote}</span>
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder} style={inputStyle} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                    {t.passwordLabel}
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required minLength={6} placeholder={t.passwordMin} style={inputStyle} />
                </div>

                {shownError && (
                  <p className="text-sm px-4 py-3 rounded-xl" style={{ color: '#E53E3E', background: '#FFF5F5', border: '1px solid #FED7D7' }}>{shownError}</p>
                )}

                <button type="submit" disabled={loading || username.length < 3}
                  className="btn-primary w-full justify-center"
                  style={{ padding: '13px 28px', opacity: (loading || username.length < 3) ? 0.5 : 1 }}>
                  {loading ? dict.common.processing : t.submitProceed}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              <p className="text-xs text-center mt-4" style={{ color: 'var(--color-text-muted)' }}>
                {t.firstTimeHint}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
