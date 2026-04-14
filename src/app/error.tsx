'use client'

import { Link2 } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--gradient-hero)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
          <Link2 size={28} color="white" />
        </div>
        <h1 className="font-bold text-2xl mb-2" style={{ color: 'var(--color-text-primary)' }}>
          發生錯誤
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          抱歉，頁面發生了預期外的錯誤。
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            重試
          </button>
          <Link href="/" className="btn-ghost" style={{ padding: '10px 24px', fontSize: 14 }}>
            回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}
