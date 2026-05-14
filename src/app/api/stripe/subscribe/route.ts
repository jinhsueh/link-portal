import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/stripe/subscribe
 * Creates a Stripe Checkout session for Pro or Premium subscription.
 * Body: { tier: 'pro' | 'premium', interval?: 'monthly' | 'annual' }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const tier: 'pro' | 'premium' = body.tier === 'premium' ? 'premium' : 'pro'
    const interval: 'monthly' | 'annual' = body.interval === 'annual' ? 'annual' : 'monthly'

    const priceEnv = {
      pro_monthly: process.env.STRIPE_PRO_PRICE_ID,
      pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      premium_monthly: process.env.STRIPE_PREMIUM_PRICE_ID,
      premium_annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
    }
    const key = `${tier}_${interval}` as keyof typeof priceEnv
    const priceId = priceEnv[key] ?? priceEnv[`${tier}_monthly` as keyof typeof priceEnv]

    if (!priceId) {
      return NextResponse.json({ error: `Stripe ${tier} price not configured` }, { status: 500 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, username: true, stripeCustomerId: true, plan: true },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (tier === 'pro' && user.plan === 'pro') {
      return NextResponse.json({ error: 'You are already a Pro member.' }, { status: 400 })
    }
    if (tier === 'premium' && user.plan === 'premium') {
      return NextResponse.json({ error: 'You are already a Premium member.' }, { status: 400 })
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
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/admin/settings?tab=billing&upgraded=${tier}`,
      cancel_url: `${origin}/admin/settings?tab=billing`,
      metadata: { userId: user.id, tier },
      subscription_data: {
        metadata: { userId: user.id, tier },
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[stripe/subscribe]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
