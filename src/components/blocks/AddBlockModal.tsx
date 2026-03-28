'use client'

import { useState } from 'react'
import { BlockType } from '@/types'
import { X, ExternalLink, Image, Video, Mail, ShoppingBag, AlignLeft } from 'lucide-react'

const BLOCK_TYPES: { type: BlockType; icon: React.ElementType; label: string; description: string }[] = [
  { type: 'link', icon: ExternalLink, label: '連結按鈕', description: '加入任意連結' },
  { type: 'banner', icon: Image, label: '橫幅看板', description: '圖片橫幅' },
  { type: 'heading', icon: AlignLeft, label: '標題文字', description: '分頁標題或說明文字' },
  { type: 'email_form', icon: Mail, label: 'Email 表單', description: '蒐集粉絲名單' },
  { type: 'product', icon: ShoppingBag, label: '數位商品', description: '販售數位產品' },
  { type: 'video', icon: Video, label: '影片', description: '嵌入 YouTube / TikTok' },
]

interface Props {
  onAdd: (type: BlockType, title: string, content: Record<string, unknown>) => void
  onClose: () => void
}

export function AddBlockModal({ onAdd, onClose }: Props) {
  const [step, setStep] = useState<'pick' | 'fill'>('pick')
  const [selected, setSelected] = useState<BlockType | null>(null)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')

  const handlePick = (type: BlockType) => {
    setSelected(type)
    setStep('fill')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    let content: Record<string, unknown> = {}
    if (selected === 'link') content = { url }
    if (selected === 'banner') content = { imageUrl: url }
    if (selected === 'heading') content = { text: title }
    if (selected === 'email_form') content = { placeholder: '輸入你的 Email', buttonText: '訂閱' }
    if (selected === 'product') content = { price: 0, currency: 'NT$', checkoutUrl: url }
    if (selected === 'video') content = { platform: 'youtube', embedId: url }

    onAdd(selected, title, content)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {step === 'pick' ? '新增區塊' : '設定區塊'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {step === 'pick' ? (
          <div className="p-4 grid grid-cols-2 gap-3">
            {BLOCK_TYPES.map(({ type, icon: Icon, label, description }) => (
              <button
                key={type}
                onClick={() => handlePick(type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition-colors text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Icon size={18} className="text-violet-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{label}</span>
                <span className="text-xs text-gray-400">{description}</span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {selected !== 'heading' && selected !== 'email_form' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">標題</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="顯示名稱"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
            )}
            {(selected === 'heading') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">文字內容</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="標題文字"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
            )}
            {(selected === 'link' || selected === 'banner' || selected === 'product' || selected === 'video') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {selected === 'banner' ? '圖片網址' : selected === 'video' ? 'YouTube ID 或網址' : '連結網址'}
                </label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-400"
                />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('pick')}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                返回
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700"
              >
                新增
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
