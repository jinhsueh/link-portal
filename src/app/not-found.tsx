import Link from 'next/link'
import { Link2, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--gradient-hero)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--gradient-blue)', boxShadow: '0 8px 24px rgba(80,144,255,0.3)' }}>
          <Link2 size={28} color="white" />
        </div>
        <h1 className="font-bold text-5xl mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
          404
        </h1>
        <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>
          找不到頁面
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          這個網址還沒有人使用，趕快來搶佔吧！
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/login" className="btn-primary whitespace-nowrap w-full sm:w-auto justify-center" style={{ padding: '10px 24px', fontSize: 14 }}>
            免費註冊
            <ArrowRight size={16} />
          </Link>
          <Link href="/" className="btn-ghost whitespace-nowrap w-full sm:w-auto justify-center" style={{ padding: '10px 24px', fontSize: 14 }}>
            回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}
