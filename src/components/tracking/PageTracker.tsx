'use client'

import { useEffect } from 'react'

/**
 * Fires a single "view" event on mount for a given pageId.
 * Placed in the public profile page to track page views.
 */
export function PageTracker({ pageId }: { pageId: string }) {
  useEffect(() => {
    // Fire-and-forget. No error handling needed — tracking is best-effort.
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', pageId }),
    }).catch(() => {})
  }, [pageId])

  return null
}
