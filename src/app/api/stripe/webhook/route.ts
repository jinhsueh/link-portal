import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    const body = await req.text()
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig ?? '', webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook signature error'
    console.error('[stripe/webhook] signature error:', msg)
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await prisma.order.update({
          where: { stripeSessionId: session.id },
          data: {
            status: 'paid',
            customerEmail: session.customer_details?.email ?? null,
          },
        })
        console.log(`[stripe/webhook] Order paid: ${session.id}`)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await prisma.order.update({
          where: { stripeSessionId: session.id },
          data: { status: 'failed' },
        }).catch(() => {/* order may not exist */})
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        // Find order by payment intent
        if (charge.payment_intent) {
          const stripe = getStripe()
          const pi = await stripe.paymentIntents.retrieve(charge.payment_intent as string)
          if (pi.latest_charge === charge.id) {
            const sessions = await stripe.checkout.sessions.list({ payment_intent: pi.id, limit: 1 })
            if (sessions.data[0]) {
              await prisma.order.update({
                where: { stripeSessionId: sessions.data[0].id },
                data: { status: 'refunded' },
              }).catch(() => {})
            }
          }
        }
        break
      }

      // ─── Subscription events (Pro plan) ───
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        if (sub.status === 'active' || sub.status === 'trialing') {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: 'pro', stripeSubId: sub.id },
          })
          console.log(`[stripe/webhook] User upgraded to Pro: customer=${customerId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'free', stripeSubId: null },
        })
        console.log(`[stripe/webhook] User downgraded to Free: customer=${customerId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        console.warn(`[stripe/webhook] Payment failed for customer=${customerId}`)
        break
      }
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error:', err)
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true })
}
