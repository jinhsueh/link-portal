import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/subscribe
 * Creates a Stripe Checkout session for Pro subscription.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const priceId = process.env.STRIPE_PRO_PRICE_ID
    if (!priceId) {
      return NextResponse.json({ error: 'Stripe Pro price not configured' }, { status: 500 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, username: true, stripeCustomerId: true, plan: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (user.plan === 'pro') {
      return NextResponse.json({ error: '你已經是 Pro 會員' }, { status: 400 })
    }

    const stripe = getStripe()
    const origin = req.headers.get('origin') ?? `https://${req.headers.get('host')}`

    // Reuse or create Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id, username: user.username },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/admin/settings?tab=billing&upgraded=1`,
      cancel_url: `${origin}/admin/settings?tab=billing`,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[stripe/subscribe]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
