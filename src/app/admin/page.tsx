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
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { BlockData, BlockType } from '@/types'
import { Plus, ExternalLink, Settings, BarChart2, LogOut, Link2, ShoppingBag, Palette, MoreHorizontal, Pencil, Trash2 as TrashIcon } from 'lucide-react'

interface UserData {
  id: string; username: string; name?: string; bio?: string; avatarUrl?: string
  pages: Array<{ id: string; name: string; slug: string; isDefault: boolean
    blocks: Array<{ id: string; type: string; title?: string | null; content: string; order: number; active: boolean; clicks: number; views: number }>
  }>
  socialLinks: Array<{ id: string; platform: string; url: string; order: number }>
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null)
  const [loading, setLoading] = useState(true)

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
    })))
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
    setLoading(false)
  }, [router])

  useEffect(() => { loadUser() }, [loadUser])

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

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

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('確定刪除此分頁？所有區塊也會一併刪除。')) return
    const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
    if (res.ok) await loadUser()
    else {
      const data = await res.json()
      alert(data.error ?? '刪除失敗')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }} />
    </div>
  )

  const navLinkStyle = (active = false) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary-light)' : 'none',
    textDecoration: 'none', border: 'none', cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>

      {/* Top nav */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-blue)' }}>
                <Link2 size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>Link Portal</span>
            </div>
            {/* Nav items */}
            <nav className="hidden sm:flex items-center gap-1">
              <a href="/admin" style={navLinkStyle(true)}>主頁</a>
              <a href="/admin/analytics" style={navLinkStyle()}>
                <BarChart2 size={14} />數據分析
              </a>
              <a href="/admin/orders" style={navLinkStyle()}>
                <ShoppingBag size={14} />訂單管理
              </a>
              <a href="/admin/theme" style={navLinkStyle()}>
                <Palette size={14} />主題外觀
              </a>
              <a href="/admin/settings" style={navLinkStyle()}>
                <Settings size={14} />設定
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <a href={`/${user?.username}`} target="_blank" rel="noopener noreferrer"
              style={{ ...navLinkStyle(), display: 'flex' }}>
              <ExternalLink size={14} />
              <span className="hidden sm:inline">預覽</span>
            </a>
            <button onClick={handleLogout} style={navLinkStyle()}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E53E3E'; (e.currentTarget as HTMLElement).style.background = '#FFF5F5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

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
                  {/* Page actions (rename/delete) */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleRenamePage(p.id, p.name)}
                      className="p-1 rounded" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      <Pencil size={12} />
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

          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>區塊管理</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>拖曳調整順序，點擊眼睛隱藏區塊</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: 14, padding: '10px 18px' }}>
              <Plus size={15} />新增區塊
            </button>
          </div>

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
                    <SortableBlock key={block.id} block={block}
                      onToggle={handleToggle} onDelete={handleDelete}
                      onEdit={setEditingBlock} onDuplicate={handleDuplicate} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
              <div style={{ background: 'white', borderRadius: 32, overflow: 'hidden', height: 560, overflowY: 'auto' }}>
                <div style={{ background: 'var(--gradient-hero)', minHeight: '100%', padding: '32px 16px 24px' }}>
                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center mb-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl mb-3"
                      style={{ background: 'var(--gradient-blue)', color: 'white', border: '3px solid white', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-display)' }}>
                      {(user?.name ?? user?.username ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{user?.name ?? user?.username}</p>
                    {user?.bio && <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{user.bio}</p>}
                  </div>
                  {/* Social */}
                  {user?.socialLinks && user.socialLinks.length > 0 && (
                    <div className="flex justify-center gap-2 mb-4">
                      {user.socialLinks.map(l => <SocialIcon key={l.id} platform={l.platform} url={l.url} />)}
                    </div>
                  )}
                  {/* Blocks preview */}
                  <div className="flex flex-col gap-2">
                    {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddBlockModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />}
      {editingBlock && <EditBlockModal block={editingBlock} onSave={handleSaveEdit} onClose={() => setEditingBlock(null)} />}
    </div>
  )
}
