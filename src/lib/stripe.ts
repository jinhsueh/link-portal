import Stripe from 'stripe'

// Lazy singleton — only throws at runtime if key is missing, not at build time
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set in environment variables.')
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' as any })
  }
  return _stripe
}

// Currency utilities
// TWD is NOT a zero-decimal currency in Stripe — multiply × 100 just like USD/EUR
export function toStripeAmount(price: number): number {
  return Math.round(price * 100)
}

export function fromStripeAmount(amount: number): number {
  return amount / 100
}

// Map display currency labels → ISO codes used by Stripe
export function toCurrencyCode(label: string): string {
  const map: Record<string, string> = {
    'NT$': 'twd',
    'TWD': 'twd',
    'USD': 'usd',
    '$': 'usd',
    'EUR': 'eur',
    '€': 'eur',
    'JPY': 'jpy',
    '¥': 'jpy',
    'HKD': 'hkd',
    'HK$': 'hkd',
  }
  return map[label.trim()] ?? label.trim().toLowerCase()
}

export function formatAmount(amount: number, currency: string): string {
  const displayCurrency = currency.toUpperCase()
  const value = fromStripeAmount(amount)
  const labels: Record<string, string> = { TWD: 'NT$', USD: '$', EUR: '€', JPY: '¥', HKD: 'HK$' }
  const prefix = labels[displayCurrency] ?? displayCurrency + ' '
  return `${prefix}${value.toLocaleString()}`
}
