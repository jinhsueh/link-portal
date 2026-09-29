import { NextRequest } from 'next/server'
import { detectInApp } from '@/lib/inapp-escape'
import { sanitizeInAppEvent } from '@/lib/inapp'

// POST /api/track/inapp — beacon sink for the in-app browser escape events on
// /login (public via the /api/track prefix in middleware). The Vercel team is
// on Hobby, where @vercel/analytics custom events (track()) aren't available,
// so each event is one JSON log line. No DB write, no IP, no raw UA.
export async function POST(req: NextRequest) {
  if (Number(req.headers.get('content-length') ?? 0) > 4096) return new Response(null, { status: 413 })
  const ev = sanitizeInAppEvent(await req.text())
  if (!ev) return new Response(null, { status: 400 })
  console.info(JSON.stringify({
    tag: 'inapp_event', event: ev.event, ...ev.props, path: ev.path,
    uaApp: detectInApp(req.headers.get('user-agent'), null).app,
  }))
  return new Response(null, { status: 204 })
}
