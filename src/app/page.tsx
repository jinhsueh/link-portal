import { redirect } from 'next/navigation'
import { DEFAULT_LOCALE } from '@/lib/i18n'

/**
 * Root route — fallback only.
 *
 * The middleware (`src/middleware.ts`) intercepts "/" and redirects to the
 * visitor's detected locale (`/en`, `/ja`, `/th`, or `/zh-TW`). This page
 * exists in case middleware fails to fire (build cache miss, edge runtime
 * error, etc.) — in that case we still bail to the default English landing
 * rather than rendering a blank page.
 *
 * The previous /-rendered Chinese landing was moved to `/zh-TW/page.tsx`.
 */
export default function RootFallback() {
  redirect(`/${DEFAULT_LOCALE}`)
}
