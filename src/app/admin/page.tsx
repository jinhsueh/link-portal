'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { SortableBlock } from '@/components/blocks/SortableBlock'
import { AddBlockModal } from '@/components/blocks/AddBlockModal'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { BlockData, BlockType } from '@/types'
import { Plus, ExternalLink, Settings, BarChart2 } from 'lucide-react'

// Demo user — in production this comes from auth session
const DEMO_USERNAME = 'demo'

interface UserData {
  id: string
  username: string
  name?: string
  bio?: string
  avatarUrl?: string
  pages: Array<{
    id: string
    name: string
    slug: string
    isDefault: boolean
    blocks: Array<{
      id: string
      type: string
      title?: string | null
      content: string
      order: number
      active: boolean
      clicks: number
      views: number
    }>
  }>
  socialLinks: Array<{ id: string; platform: string; url: string; order: number }>
}

export default function AdminPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadUser = useCallback(async () => {
    // Try to load demo user, create if doesn't exist
    let res = await fetch(`/api/profile?username=${DEMO_USERNAME}`)
    if (res.status === 404) {
      res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: DEMO_USERNAME,
          name: 'Demo 創作者',
          bio: '歡迎來到我的傳送門 ✨',
        }),
      })
    }
    const data: UserData = await res.json()
    setUser(data)

    const defaultPage = data.pages.find(p => p.isDefault) ?? data.pages[0]
    if (defaultPage) {
      setActivePageId(defaultPage.id)
      setBlocks(
        defaultPage.blocks.map(b => ({
          id: b.id,
          type: b.type as BlockType,
          title: b.title,
          content: JSON.parse(b.content),
          order: b.order,
          active: b.active,
          clicks: b.clicks,
          views: b.views,
        }))
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)
    const newBlocks = arrayMove(blocks, oldIndex, newIndex)
    setBlocks(newBlocks)

    await fetch('/api/blocks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: newBlocks.map(b => b.id) }),
    })
  }

  const handleToggle = async (id: string, active: boolean) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, active } : b))
    await fetch(`/api/blocks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, pageId: activePageId, type, title, content }),
    })
    const newBlock = await res.json()
    setBlocks(prev => [
      ...prev,
      {
        id: newBlock.id,
        type: newBlock.type as BlockType,
        title: newBlock.title,
        content: JSON.parse(newBlock.content),
        order: newBlock.order,
        active: newBlock.active,
        clicks: newBlock.clicks,
        views: newBlock.views,
      },
    ])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-violet-700 text-lg">Link Portal</span>
          <div className="flex items-center gap-2">
            <a
              href={`/${user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-50"
            >
              <ExternalLink size={14} />
              預覽頁面
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Left: Editor */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-900">區塊管理</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              <Plus size={16} />
              新增區塊
            </button>
          </div>

          {blocks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-gray-400 mb-4">還沒有任何區塊</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700"
              >
                新增第一個區塊
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">
                  {blocks.map(block => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={() => {}}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Right: Phone preview */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              即時預覽
            </p>
            <div className="bg-white border-8 border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl h-[600px] overflow-y-auto">
              <div className="bg-gradient-to-b from-violet-50 to-white min-h-full px-4 py-8">
                {/* Profile */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-violet-200 flex items-center justify-center text-xl font-bold text-violet-700 mb-3">
                    {(user?.name ?? 'D').charAt(0)}
                  </div>
                  <p className="font-bold text-sm text-gray-900">{user?.name}</p>
                  {user?.bio && <p className="text-xs text-gray-500 mt-1">{user.bio}</p>}
                </div>
                {/* Social */}
                {user?.socialLinks && user.socialLinks.length > 0 && (
                  <div className="flex justify-center gap-2 mb-5">
                    {user.socialLinks.map(l => (
                      <SocialIcon key={l.id} platform={l.platform} url={l.url} />
                    ))}
                  </div>
                )}
                {/* Blocks */}
                <div className="flex flex-col gap-2">
                  {blocks.map(block => (
                    <BlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddBlockModal onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
