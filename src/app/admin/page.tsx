'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { SortableBlock } from '@/components/blocks/SortableBlock'
import { AddBlockModal } from '@/components/blocks/AddBlockModal'
import { EditBlockModal } from '@/components/blocks/EditBlockModal'
import { ScheduleModal } from '@/components/blocks/ScheduleModal'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { ProfileEditor } from '@/components/admin/ProfileEditor'
import { ThemeEditor } from '@/components/admin/ThemeEditor'
import { BlockData, BlockType } from '@/types'
import { Plus, MoreHorizontal, Pencil, Trash2 as TrashIcon, Lock, Unlock, CheckSquare, EyeOff, Download, Upload, Copy, Check, Link2, LayoutDashboard, Palette } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { OnboardingChecklist } from '@/components/admin/OnboardingChecklist'
import { DEFAULT_THEME, type PageTheme } from '@/lib/theme'

interface UserData {
  id: string; username: string; name?: string; bio?: string; avatarUrl?: string
  role: string; effectivePlan: 'free' | 'pro' | 'premium'; trialDaysLeft: number
  pages: Array<{ id: string; name: string; slug: string; isDefault: boolean; password?: string | null; theme?: string | null
    blocks: Array<{ id: string; type: string; title?: string | null; content: string; order: number; active: boolean; clicks: number; views: number; scheduleStart?: string | null; scheduleEnd?: string | null }>
  }>
  socialLinks: Array<{ id: string; platform: string; url: string; label?: string; order: number }>
}

type EditorMode = 'content' | 'appearance'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null)
  const [schedulingBlock, setSchedulingBlock] = useState<(BlockData & { scheduleStart?: string | null; scheduleEnd?: string | null }) | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('content')
  const [previewTheme, setPreviewTheme] = useState<PageTheme>(DEFAULT_THEME)
  const [previewProfile, setPreviewProfile] = useState<{ name: string; bio: string; avatarUrl: string } | null>(null)
  const [previewSocialLinks, setPreviewSocialLinks] = useState<UserData['socialLinks'] | null>(null)

  const handleCopyLink = async () => {
    if (!user) return
    await navigator.clipboard.writeText(`${window.location.origin}/${user.username}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const switchToPage = (pageData: UserData['pages'][0]) => {
    setActivePageId(pageData.id)
    setBlocks(pageData.blocks.map(b => ({
      id: b.id, type: b.type as BlockType, title: b.title,
      content: JSON.parse(b.content), order: b.order,
      active: b.active, clicks: b.clicks, views: b.views,
      scheduleStart: b.scheduleStart ?? null, scheduleEnd: b.scheduleEnd ?? null,
    })))
    // Load page theme
    const existing = JSON.parse(pageData.theme || '{}')
    setPreviewTheme({ ...DEFAULT_THEME, ...existing })
  }

  const loadUser = useCallback(async (keepPageId?: string) => {
    const res = await fetch('/api/me')
    if (res.status === 401) { router.push('/login'); return }
    const data: UserData = await res.json()
    setUser(data)
    const targetPage = keepPageId
      ? data.pages.find(p => p.id === keepPageId)
      : data.pages.find(p => p.isDefault) ?? data.pages[0]
    if (targetPage) switchToPage(targetPage)
    setPreviewProfile(null)
    setPreviewSocialLinks(null)
    setLoading(false)
  }, [router])

  useEffect(() => { loadUser() }, [loadUser]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)
    const newBlocks = arrayMove(blocks, oldIndex, newIndex)
    setBlocks(newBlocks)
    await fetch('/api/blocks/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: newBlocks.map(b => b.id) }),
    })
  }

  const handleToggle = async (id: string, active: boolean) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, active } : b))
    await fetch(`/api/blocks/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定刪除此區塊？')) return
    setBlocks(prev => prev.filter(b => b.id !== id))
    await fetch(`/api/blocks/${id}`, { method: 'DELETE' })
  }

  const handleAdd = async (type: BlockType, title: string, content: Record<string, unknown>) => {
    if (!user || !activePageId) return
    const res = await fetch('/api/blocks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, pageId: activePageId, type, title, content }),
    })
    const newBlock = await res.json()
    setBlocks(prev => [...prev, {
      id: newBlock.id, type: newBlock.type as BlockType, title: newBlock.title,
      content: JSON.parse(newBlock.content), order: newBlock.order,
      active: newBlock.active, clicks: newBlock.clicks, views: newBlock.views,
    }])
  }

  const handleDuplicate = async (block: BlockData) => {
    if (!user || !activePageId) return
    const res = await fetch('/api/blocks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id, pageId: activePageId,
        type: block.type, title: (block.title ?? '') + '（副本）',
        content: block.content,
      }),
    })
    const newBlock = await res.json()
    setBlocks(prev => [...prev, {
      id: newBlock.id, type: newBlock.type as BlockType, title: newBlock.title,
      content: JSON.parse(newBlock.content), order: newBlock.order,
      active: newBlock.active, clicks: 0, views: 0,
    }])
  }

  const handleSaveEdit = async (id: string, title: string, content: Record<string, unknown>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, title, content } : b))
    await fetch(`/api/blocks/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
  }

  const handleSchedule = async (id: string, scheduleStart: string | null, scheduleEnd: string | null) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, scheduleStart, scheduleEnd } : b))
    await fetch(`/api/blocks/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleStart, scheduleEnd }),
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleBatchHide = async () => {
    const ids = Array.from(selectedIds)
    setBlocks(prev => prev.map(b => ids.includes(b.id) ? { ...b, active: false } : b))
    await Promise.all(ids.map(id =>
      fetch(`/api/blocks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: false }) })
    ))
    setSelectedIds(new Set())
    setBatchMode(false)
  }

  const handleBatchDelete = async () => {
    if (!confirm(`確定刪除 ${selectedIds.size} 個區塊？`)) return
    const ids = Array.from(selectedIds)
    setBlocks(prev => prev.filter(b => !ids.includes(b.id)))
    await Promise.all(ids.map(id => fetch(`/api/blocks/${id}`, { method: 'DELETE' })))
    setSelectedIds(new Set())
    setBatchMode(false)
  }

  const handleExport = () => {
    const data = blocks.map(({ id, ...rest }) => rest)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blocks-${activePageId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !activePageId) return
    const text = await file.text()
    try {
      const imported = JSON.parse(text) as Array<{ type: string; title?: string; content: unknown; active?: boolean }>
      for (const item of imported) {
        await fetch('/api/blocks', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, pageId: activePageId, type: item.type, title: item.title ?? '', content: item.content }),
        })
      }
      await loadUser(activePageId)
    } catch { alert('匯入失敗：檔案格式不正確') }
    e.target.value = ''
  }

  const handleAddPage = async () => {
    const name = prompt('新分頁名稱：')
    if (!name?.trim()) return
    const res = await fetch('/api/pages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      const page = await res.json()
      await loadUser(page.id)
    }
  }

  const handleRenamePage = async (pageId: string, currentName: string) => {
    const name = prompt('重新命名分頁：', currentName)
    if (!name?.trim() || name.trim() === currentName) return
    await fetch(`/api/pages/${pageId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    await loadUser(pageId)
  }

  const handleTogglePassword = async (pageId: string) => {
    const page = user?.pages.find(p => p.id === pageId)
    if (!page) return
    const currentPw = (page as unknown as { password?: string }).password
    if (currentPw) {
      if (!confirm('確定移除密碼保護？')) return
      await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '' }),
      })
    } else {
      const pw = prompt('設定頁面密碼：')
      if (!pw?.trim()) return
      await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw.trim() }),
      })
    }
    await loadUser(pageId)
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('確定刪除此分頁？所有區塊也會一併刪除。')) return
    const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
    if (res.ok) await loadUser()
    else {
      const data = await res.json()
      alert(data.error ?? '刪除失敗')
    }
  }

  // Theme preview helpers
  const isDark = isColorDark(previewTheme.bgColor)
  const previewTextColor = isDark ? '#fff' : '#1A1A2E'
  const previewBg = previewTheme.bgType === 'gradient' && previewTheme.bgGradient ? previewTheme.bgGradient : previewTheme.bgColor
  const radius = previewTheme.buttonRadius === 'pill' ? 9999 : previewTheme.buttonRadius === 'square' ? 6 : 12

  if (loading) return (
    <AdminShell username={user?.username} role={user?.role} effectivePlan={user?.effectivePlan} trialDaysLeft={user?.trialDaysLeft}>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 animate-spin"
          style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
      </div>
    </AdminShell>
  )

  return (
    <AdminShell username={user?.username} role={user?.role} effectivePlan={user?.effectivePlan} trialDaysLeft={user?.trialDaysLeft}>
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        {/* Left: Editor */}
        <div className="flex-1 min-w-0">

          {/* Page tabs */}
          {user && user.pages.length > 0 && (
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              {user.pages.map(p => (
                <div key={p.id} className="flex items-center gap-1 group" style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => switchToPage(p)}
                    className="px-4 py-2 text-sm font-semibold transition-all"
                    style={{
                      background: p.id === activePageId ? 'var(--color-primary)' : 'white',
                      color: p.id === activePageId ? 'white' : 'var(--color-text-secondary)',
                      border: `1px solid ${p.id === activePageId ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}>
                    {p.name}
                    {p.isDefault && <span className="ml-1 opacity-60 text-xs">★</span>}
                  </button>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleRenamePage(p.id, p.name)}
                      className="p-1 rounded" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleTogglePassword(p.id)} title={p.password ? '移除密碼' : '設定密碼'}
                      className="p-1 rounded" style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.password ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                      {p.password ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                    {user.pages.length > 1 && (
                      <button onClick={() => handleDeletePage(p.id)}
                        className="p-1 rounded" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }}>
                        <TrashIcon size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={handleAddPage}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors"
                style={{ background: 'none', border: '1px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}>
                <Plus size={13} />新增分頁
              </button>
            </div>
          )}

          {/* Copy link bar */}
          {user && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl"
              style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
              <Link2 size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {window.location.origin}/{user.username}
              </span>
              <button onClick={handleCopyLink}
                className="flex items-center gap-1 ml-auto text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{
                  background: linkCopied ? '#22C55E' : 'var(--color-primary)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                {linkCopied ? <><Check size={12} />已複製</> : <><Copy size={12} />複製連結</>}
              </button>
            </div>
          )}

          {/* Mode toggle: 內容 | 外觀 */}
          <div className="flex items-center gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'inline-flex' }}>
            {([
              { mode: 'content' as EditorMode, label: '內容', icon: LayoutDashboard },
              { mode: 'appearance' as EditorMode, label: '外觀', icon: Palette },
            ]).map(({ mode, label, icon: Icon }) => (
              <button key={mode} onClick={() => setEditorMode(mode)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: editorMode === mode ? 'white' : 'transparent',
                  color: editorMode === mode ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: editorMode === mode ? 'var(--shadow-sm)' : 'none',
                }}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* ═══ Content Mode ═══ */}
          {editorMode === 'content' && (
            <>
              {/* Profile Editor */}
              {user && (
                <ProfileEditor
                  profile={{
                    username: user.username,
                    name: user.name,
                    bio: user.bio,
                    avatarUrl: user.avatarUrl,
                    socialLinks: user.socialLinks,
                  }}
                  onUpdate={() => loadUser(activePageId ?? undefined)}
                  onLiveChange={setPreviewProfile}
                  onSocialLinksChange={setPreviewSocialLinks}
                  defaultExpanded={!user.bio && !user.avatarUrl && user.socialLinks.length === 0}
                />
              )}

              {/* Onboarding checklist */}
              {user && (
                <OnboardingChecklist
                  hasBlocks={blocks.length > 0}
                  hasProfile={!!(user.avatarUrl || user.bio)}
                  username={user.username}
                  onAddBlock={() => setShowAddModal(true)}
                  onGoToSettings={() => router.push('/admin/settings')}
                />
              )}

              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>區塊管理</h1>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>拖曳調整順序，點擊眼睛隱藏區塊</p>
                </div>
                <div className="flex items-center gap-2">
                  {blocks.length > 0 && (
                    <>
                      <button onClick={() => { setBatchMode(!batchMode); setSelectedIds(new Set()) }}
                        className="p-2 rounded-lg transition-colors" title="批次操作"
                        style={{ background: batchMode ? 'var(--color-primary-light)' : 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: batchMode ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        <CheckSquare size={15} />
                      </button>
                      <button onClick={handleExport}
                        className="p-2 rounded-lg transition-colors" title="匯出區塊"
                        style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <Download size={15} />
                      </button>
                      <label className="p-2 rounded-lg transition-colors" title="匯入區塊"
                        style={{ background: 'none', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <Upload size={15} />
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                      </label>
                    </>
                  )}
                  <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 18px' }}>
                    <Plus size={15} />新增區塊
                  </button>
                </div>
              </div>

              {/* Batch action bar */}
              {batchMode && selectedIds.size > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
                  style={{ background: 'var(--color-primary-light)', border: '1px solid #C3D9FF' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                    已選取 {selectedIds.size} 個區塊
                  </span>
                  <div className="flex-1" />
                  <button onClick={handleBatchHide}
                    className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: 'white', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                    <EyeOff size={13} />隱藏
                  </button>
                  <button onClick={handleBatchDelete}
                    className="flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: '#FFF5F5', border: '1px solid #FCA5A5', cursor: 'pointer', color: '#E53E3E' }}>
                    <TrashIcon size={13} />刪除
                  </button>
                </div>
              )}

              {blocks.length === 0 ? (
                <div className="text-center py-16"
                  style={{ border: '2px dashed var(--color-border)', borderRadius: 16, background: 'white' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--color-primary-light)' }}>
                    <Plus size={22} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>還沒有任何區塊</p>
                  <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>新增第一個區塊，開始建立你的頁面</p>
                  <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
                    <Plus size={15} />新增區塊
                  </button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                      {blocks.map(block => (
                        <div key={block.id} className="flex items-center gap-2">
                          {batchMode && (
                            <input type="checkbox" checked={selectedIds.has(block.id)}
                              onChange={() => toggleSelect(block.id)}
                              className="w-4 h-4 flex-shrink-0 rounded cursor-pointer" style={{ accentColor: 'var(--color-primary)' }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <SortableBlock block={block}
                              onToggle={handleToggle} onDelete={handleDelete}
                              onEdit={setEditingBlock} onDuplicate={handleDuplicate}
                              onSchedule={setSchedulingBlock} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </>
          )}

          {/* ═══ Appearance Mode ═══ */}
          {editorMode === 'appearance' && (
            <ThemeEditor
              pageId={activePageId}
              initialTheme={previewTheme}
              username={user?.username}
              onThemeChange={setPreviewTheme}
            />
          )}
        </div>

        {/* Right: Phone preview */}
        <div className="hidden lg:block flex-shrink-0" style={{ width: 280 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <p className="text-center text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
              即時預覽
            </p>
            <div style={{
              background: '#1A1A2E', borderRadius: 40, padding: 10,
              boxShadow: '0 24px 64px rgba(26,26,46,0.25)', width: 260,
            }}>
              <div style={{
                background: editorMode === 'appearance' ? previewBg : 'white',
                borderRadius: 32, overflow: 'hidden', height: 560, overflowY: 'auto',
              }}>
                <div style={{
                  background: editorMode === 'appearance' ? 'transparent' : 'var(--gradient-hero)',
                  minHeight: '100%', padding: '32px 16px 24px',
                }}>
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center mb-5">
                    {(previewProfile?.avatarUrl ?? user?.avatarUrl) ? (
                      <img src={(previewProfile?.avatarUrl ?? user?.avatarUrl)!} alt={(previewProfile?.name ?? user?.name ?? user?.username) || ''}
                        className="w-16 h-16 rounded-full object-cover mb-3"
                        style={{ border: '3px solid white', boxShadow: 'var(--shadow-md)' }} />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mb-3"
                        style={{
                          background: editorMode === 'appearance' ? previewTheme.primaryColor : 'var(--gradient-blue)',
                          color: 'white', border: '3px solid white', boxShadow: 'var(--shadow-md)',
                          fontFamily: 'var(--font-display)',
                        }}>
                        {(previewProfile?.name || user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p className="font-bold text-sm" style={{ color: editorMode === 'appearance' ? previewTextColor : 'var(--color-text-primary)' }}>
                      {previewProfile?.name || user?.name || user?.username}
                    </p>
                    {(previewProfile?.bio ?? user?.bio) && (
                      <p className="text-xs mt-1" style={{ color: editorMode === 'appearance' ? (isDark ? '#94A3B8' : '#4A5568') : 'var(--color-text-secondary)' }}>
                        {previewProfile?.bio ?? user?.bio}
                      </p>
                    )}
                  </div>
                  {/* Social */}
                  {(() => {
                    const socialLinks = previewSocialLinks ?? user?.socialLinks
                    return socialLinks && socialLinks.length > 0 ? (
                      <div className="flex justify-center gap-2 mb-4">
                        {socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} />)}
                      </div>
                    ) : null
                  })()}
                  {/* Blocks preview */}
                  {editorMode === 'appearance' ? (
                    /* Theme preview: use real blocks with themed styles */
                    <div className="flex flex-col gap-2">
                      {blocks.length > 0 ? blocks.slice(0, 4).map(block => (
                        <div key={block.id} className="flex items-center justify-between text-sm font-semibold"
                          style={{
                            padding: '12px 16px',
                            borderRadius: radius,
                            color: previewTheme.buttonStyle === 'filled' ? 'white' : previewTextColor,
                            background: previewTheme.buttonStyle === 'filled' ? previewTheme.primaryColor
                              : previewTheme.buttonStyle === 'soft' ? (isDark ? 'rgba(255,255,255,0.1)' : previewTheme.primaryColor + '15')
                              : (isDark ? 'rgba(255,255,255,0.08)' : 'white'),
                            border: previewTheme.buttonStyle === 'outline'
                              ? `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}`
                              : 'none',
                          }}>
                          <span className="truncate">{block.title || block.type}</span>
                          <span style={{ opacity: 0.5 }}>›</span>
                        </div>
                      )) : (
                        ['我的 YouTube 頻道', '最新文章', '合作洽詢'].map(text => (
                          <div key={text} className="flex items-center justify-between text-sm font-semibold"
                            style={{
                              padding: '12px 16px',
                              borderRadius: radius,
                              color: previewTheme.buttonStyle === 'filled' ? 'white' : previewTextColor,
                              background: previewTheme.buttonStyle === 'filled' ? previewTheme.primaryColor
                                : previewTheme.buttonStyle === 'soft' ? (isDark ? 'rgba(255,255,255,0.1)' : previewTheme.primaryColor + '15')
                                : (isDark ? 'rgba(255,255,255,0.08)' : 'white'),
                              border: previewTheme.buttonStyle === 'outline'
                                ? `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#E2E8F0'}`
                                : 'none',
                            }}>
                            <span>{text}</span>
                            <span style={{ opacity: 0.5 }}>›</span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddBlockModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}
      {editingBlock && <EditBlockModal block={editingBlock} onSave={handleSaveEdit} onClose={() => setEditingBlock(null)} />}
      {schedulingBlock && <ScheduleModal block={schedulingBlock} onSave={handleSchedule} onClose={() => setSchedulingBlock(null)} />}
    </AdminShell>
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
