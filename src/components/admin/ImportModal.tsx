'use client'

/**
 * ImportModal — 3-step flow for importing a Linktree / Portaly profile.
 *
 * 1. Paste source URL → POST /api/import (preview, no DB write)
 * 2. Show editable preview: toggle which blocks / socials / profile fields to import
 * 3. Confirm → POST /api/import/apply (transactional write)
 *
 * Parent (`/admin/page.tsx`) passes `pageId` and a refresh callback; on success we
 * call the callback so the admin view refetches and the new blocks appear without
 * a manual page reload.
 */

import { useState } from 'react'
import { X, Link2, Loader2, Download as DownloadIcon, Check, AlertTriangle, ExternalLink } from 'lucide-react'
import type { ImportedProfile, ImportedBlock, ImportedSocialLink } from '@/lib/importers/types'

interface Props {
  pageId: string | null
  onClose: () => void
  onImported: () => void
}

type Step = 'input' | 'loading' | 'preview' | 'applying' | 'done'

interface ApplyResult {
  ok: boolean
  blocksCreated: number
  socialsCreated: number
  skippedByType: number
  truncated: number
  maxBlocksPerPage: number
}

export function ImportModal({ pageId, onClose, onImported }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [sourceUrl, setSourceUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<ImportedProfile | null>(null)
  const [result, setResult] = useState<ApplyResult | null>(null)

  // Selection state (all selected by default)
  const [blockSelected, setBlockSelected] = useState<boolean[]>([])
  const [socialSelected, setSocialSelected] = useState<boolean[]>([])
  const [importName, setImportName] = useState(true)
  const [importBio, setImportBio] = useState(true)
  const [importAvatar, setImportAvatar] = useState(true)

  const handleFetchPreview = async () => {
    if (!sourceUrl.trim()) return
    setStep('loading')
    setError(null)
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: sourceUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '匯入失敗')
        setStep('input')
        return
      }
      const p = data as ImportedProfile
      setProfile(p)
      setBlockSelected(p.blocks.map(() => true))
      setSocialSelected(p.socialLinks.map(() => true))
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : '網路錯誤')
      setStep('input')
    }
  }

  const handleApply = async () => {
    if (!profile || !pageId) return
    const blocks = profile.blocks.filter((_, i) => blockSelected[i])
    const socialLinks = profile.socialLinks.filter((_, i) => socialSelected[i])
    setStep('applying')
    setError(null)
    try {
      const res = await fetch('/api/import/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          name: importName ? profile.name : undefined,
          bio: importBio ? profile.bio : undefined,
          avatarUrl: importAvatar ? profile.avatarUrl : undefined,
          blocks,
          socialLinks,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '匯入失敗')
        setStep('preview')
        return
      }
      setResult(data as ApplyResult)
      setStep('done')
      onImported()
    } catch (err) {
      setError(err instanceof Error ? err.message : '網路錯誤')
      setStep('preview')
    }
  }

  const toggleBlock = (i: number) =>
    setBlockSelected(prev => prev.map((v, idx) => (idx === i ? !v : v)))
  const toggleSocial = (i: number) =>
    setSocialSelected(prev => prev.map((v, idx) => (idx === i ? !v : v)))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)' }}>
              <DownloadIcon size={16} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                從 Linktree / Portaly 匯入
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                一鍵搬家,保留原有區塊與社群連結
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* ── Step 1: input ── */}
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  貼上原本的 Linktree / Portaly 網址
                </label>
                <div className="relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={e => setSourceUrl(e.target.value)}
                    placeholder="https://linktr.ee/yourname"
                    className="w-full text-sm py-2.5 pr-3 rounded-lg"
                    style={{ paddingLeft: 34, border: '1px solid var(--color-border)', outline: 'none' }}
                    onKeyDown={e => { if (e.key === 'Enter') handleFetchPreview() }}
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  目前支援 <code>linktr.ee</code> 與 <code>portaly.cc</code>
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: '#FFF5F5', border: '1px solid #FCA5A5' }}>
                  <AlertTriangle size={14} style={{ color: '#E53E3E', flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs" style={{ color: '#991B1B' }}>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: loading ── */}
          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center">
              <Loader2 size={28} className="animate-spin mb-3" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>正在抓取公開資料…</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>這通常需要 3–5 秒</p>
            </div>
          )}

          {/* ── Step 3: preview ── */}
          {step === 'preview' && profile && (
            <div className="space-y-5">
              {/* Profile fields */}
              {(profile.name || profile.bio || profile.avatarUrl) && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    個人資料
                  </h3>
                  <div className="space-y-2 p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    {profile.name && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={importName} onChange={() => setImportName(v => !v)} className="w-4 h-4" style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>名稱:<b className="ml-1">{profile.name}</b></span>
                      </label>
                    )}
                    {profile.bio && (
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={importBio} onChange={() => setImportBio(v => !v)} className="w-4 h-4 mt-0.5" style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Bio:<span className="ml-1">{profile.bio}</span></span>
                      </label>
                    )}
                    {profile.avatarUrl && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={importAvatar} onChange={() => setImportAvatar(v => !v)} className="w-4 h-4" style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>頭像</span>
                        <img src={profile.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                      </label>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      只會寫入目前為空的欄位,不會覆蓋你已經填過的內容
                    </p>
                  </div>
                </section>
              )}

              {/* Blocks */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    區塊 ({profile.blocks.length})
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setBlockSelected(profile.blocks.map(() => true))}
                      className="text-xs font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>全選</button>
                    <button onClick={() => setBlockSelected(profile.blocks.map(() => false))}
                      className="text-xs font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>全不選</button>
                  </div>
                </div>
                {profile.blocks.length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>沒有偵測到區塊</p>
                ) : (
                  <div className="space-y-1.5">
                    {profile.blocks.map((b: ImportedBlock, i: number) => {
                      const url = (b.content.url as string | undefined) ?? ''
                      return (
                        <label key={i} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors"
                          style={{ background: blockSelected[i] ? 'var(--color-primary-light)' : 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                          <input type="checkbox" checked={blockSelected[i] ?? false} onChange={() => toggleBlock(i)} className="w-4 h-4 flex-shrink-0" style={{ accentColor: 'var(--color-primary)' }} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{b.title}</span>
                              {b.downgraded && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#FEF3C7', color: '#92400E' }}>降級為連結</span>
                              )}
                            </div>
                            {url && (
                              <div className="flex items-center gap-1 text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                                <ExternalLink size={10} /> <span className="truncate">{url}</span>
                              </div>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Social links */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    社群連結 ({profile.socialLinks.length})
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setSocialSelected(profile.socialLinks.map(() => true))}
                      className="text-xs font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>全選</button>
                    <button onClick={() => setSocialSelected(profile.socialLinks.map(() => false))}
                      className="text-xs font-semibold" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>全不選</button>
                  </div>
                </div>
                {profile.socialLinks.length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>沒有偵測到社群連結</p>
                ) : (
                  <div className="space-y-1.5">
                    {profile.socialLinks.map((s: ImportedSocialLink, i: number) => (
                      <label key={i} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                        style={{ background: socialSelected[i] ? 'var(--color-primary-light)' : 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <input type="checkbox" checked={socialSelected[i] ?? false} onChange={() => toggleSocial(i)} className="w-4 h-4 flex-shrink-0" style={{ accentColor: 'var(--color-primary)' }} />
                        <span className="text-xs font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'var(--color-primary)', color: 'white' }}>{s.platform}</span>
                        <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{s.url}</span>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: '#FFF5F5', border: '1px solid #FCA5A5' }}>
                  <AlertTriangle size={14} style={{ color: '#E53E3E', flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs" style={{ color: '#991B1B' }}>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: applying ── */}
          {step === 'applying' && (
            <div className="py-12 flex flex-col items-center">
              <Loader2 size={28} className="animate-spin mb-3" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>正在匯入…</p>
            </div>
          )}

          {/* ── Step 5: done ── */}
          {step === 'done' && result && (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#DCFCE7' }}>
                <Check size={24} style={{ color: '#16A34A' }} />
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-text-primary)' }}>匯入完成!</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                已新增 <b>{result.blocksCreated}</b> 個區塊、<b>{result.socialsCreated}</b> 個社群連結
              </p>
              {(result.skippedByType > 0 || result.truncated > 0) && (
                <div className="mt-3 p-3 rounded-lg text-xs text-left" style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E' }}>
                  {result.skippedByType > 0 && <div>· {result.skippedByType} 個區塊因方案限制被略過</div>}
                  {result.truncated > 0 && (
                    <div>· {result.truncated} 個區塊超過頁面上限 ({result.maxBlocksPerPage})。升級 Pro 可匯入更多。</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border)' }}>
          {step === 'input' && (
            <>
              <button onClick={onClose} className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                取消
              </button>
              <button onClick={handleFetchPreview} disabled={!sourceUrl.trim()} className="btn-primary"
                style={{ fontSize: 14, padding: '8px 18px', opacity: sourceUrl.trim() ? 1 : 0.5 }}>
                預覽內容
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => setStep('input')} className="text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                返回
              </button>
              <button onClick={handleApply} disabled={!pageId} className="btn-primary"
                style={{ fontSize: 14, padding: '8px 18px', opacity: pageId ? 1 : 0.5 }}>
                確認匯入
              </button>
            </>
          )}
          {step === 'done' && (
            <button onClick={onClose} className="btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>
              完成
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
