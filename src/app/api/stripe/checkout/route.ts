import { NextRequest, NextResponse } from 'next/server'
import { getStripe, toStripeAmount, toCurrencyCode } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getPlanLimits } from '@/lib/plan'

export async function POST(req: NextRequest) {
  try {
    const { blockId } = await req.json()
    if (!blockId) return NextResponse.json({ error: 'blockId is required' }, { status: 400 })

    // Fetch the product block + its owner
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: { user: true },
    })
    if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    if (block.type !== 'product') return NextResponse.json({ error: 'Block is not a product' }, { status: 400 })

    const content = JSON.parse(block.content ?? '{}') as {
      price?: number; currency?: string; description?: string; imageUrl?: string
    }
    const price = content.price ?? 0
    const currency = toCurrencyCode(content.currency ?? 'NT$')
    const title = block.title ?? '商品'

    if (price <= 0) return NextResponse.json({ error: '商品金額必須大於 0' }, { status: 400 })

    const stripe = getStripe()
    const origin = req.headers.get('origin') ?? `https://${req.headers.get('host')}`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: title,
            ...(content.description ? { description: content.description } : {}),
            ...(content.imageUrl ? { images: [content.imageUrl] } : {}),
          },
          unit_amount: toStripeAmount(price),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/${block.user.username}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${block.user.username}`,
      metadata: { blockId, userId: block.userId },
    })

    // Snapshot the seller's commission rate at order time so historical
    // accounting isn't disturbed by later plan changes.
    const sellerLimits = getPlanLimits(block.user)
    const stripeAmount = toStripeAmount(price)
    const commissionAmount = Math.round(stripeAmount * sellerLimits.commissionRate)

    // Create a pending order record
    await prisma.order.create({
      data: {
        userId: block.userId,
        blockId,
        stripeSessionId: session.id,
        productTitle: title,
        amount: stripeAmount,
        currency,
        status: 'pending',
        commissionRate: sellerLimits.commissionRate,
        commissionAmount,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[stripe/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
