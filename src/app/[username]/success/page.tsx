'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { CheckCircle, ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useDict } from '@/components/i18n/DictProvider'

interface OrderInfo {
  productTitle: string | null
  amount: number
  currency: string
  customerEmail: string | null
}

const CURRENCY_LABELS: Record<string, string> = {
  twd: 'NT$', usd: '$', eur: '€', jpy: '¥', hkd: 'HK$',
}

function formatAmount(amount: number, currency: string) {
  const label = CURRENCY_LABELS[currency.toLowerCase()] ?? currency.toUpperCase() + ' '
  return `${label}${(amount / 100).toLocaleString()}`
}

export default function SuccessPage() {
  const { dict } = useDict()
  const s = dict.profile.success
  const params = useParams()
  const searchParams = useSearchParams()
  const username = params?.username as string
  const sessionId = searchParams?.get('session_id')

  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }

    // Poll the orders API to find the matching order (webhook may take a moment)
    let attempts = 0
    const poll = async () => {
      attempts++
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) { setLoading(false); return }
        const data = await res.json()
        const found = data.orders?.find((o: { stripeSessionId: string; status: string; productTitle: string | null; amount: number; currency: string; customerEmail: string | null }) =>
          o.stripeSessionId === sessionId
        )
        if (found?.status === 'paid') {
          setOrder(found)
          setLoading(false)
        } else if (attempts < 10) {
          setTimeout(poll, 1500)
        } else {
          // Show success anyway — webhook might still be processing
          setOrder(found ?? null)
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }
    poll()
  }, [sessionId])

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--gradient-hero)', fontFamily: 'var(--font-primary), var(--font-cjk)' }}>

      <div className="w-full max-w-md text-center">

        {loading ? (
          <div className="flex flex-col items-center gap-4" style={{ color: 'var(--color-text-muted)' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm font-medium">{s.confirming}</p>
          </div>
        ) : (
          <div className="rounded-3xl p-8 sm:p-10" style={{
            background: 'white',
            boxShadow: '0 24px 64px rgba(80,144,255,0.15), 0 4px 16px rgba(0,0,0,0.06)',
          }}>
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: '#C6F6D5' }}>
              <CheckCircle size={40} color="#22543D" strokeWidth={2} />
            </div>

            <h1 className="font-bold text-2xl mb-2" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
              {s.title}
            </h1>

            {order ? (
              <>
                <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {s.thanksPrefix}
                  <strong style={{ color: 'var(--color-text-primary)' }}>{order.productTitle ?? s.productFallback}</strong>{s.thanksSuffix}
                  {order.customerEmail && (
                    <> {s.emailConfirm}<strong>{order.customerEmail}</strong>.</>
                  )}
                </p>

                {/* Order summary */}
                <div className="rounded-xl p-4 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text-muted)' }}>{s.labelProduct}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {order.productTitle ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span style={{ color: 'var(--color-text-muted)' }}>{s.labelAmount}</span>
                    <span className="font-bold" style={{ color: 'var(--color-primary)', fontSize: 16 }}>
                      {formatAmount(order.amount, order.currency)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {s.fallbackBody}
              </p>
            )}

            {/* Back to profile */}
            <Link href={`/${username}`}
              className="btn-primary w-full justify-center"
              style={{ display: 'flex', textDecoration: 'none', padding: '13px 20px', fontSize: 15 }}>
              <ArrowLeft size={16} />
              {s.backToProfile}
            </Link>

            {/* Powered by Stripe */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <ShoppingBag size={13} style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {s.secureNote}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
