'use client'

import { useEffect } from 'react'

/**
 * Fires a single "view" event on mount for a given pageId.
 * Also captures referrer and UTM params for analytics.
 */
export function PageTracker({ pageId }: { pageId: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const referrer = document.referrer || undefined
    const utmSource = params.get('utm_source') || undefined
    const utmMedium = params.get('utm_medium') || undefined

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', pageId, referrer, utmSource, utmMedium }),
    }).catch(() => {})
  }, [pageId])

  return null
}
