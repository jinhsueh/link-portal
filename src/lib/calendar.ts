import { CalendarEventContent } from '@/types'

/**
 * Calendar utilities for the `calendar_event` block.
 *
 * Two pure functions:
 * - buildGoogleCalendarUrl(content) → https://calendar.google.com/… URL
 * - buildIcsContent(content, title) → RFC 5545 ICS text (UTC Z format, no VTIMEZONE)
 *
 * Plus helpers for converting between the admin form's local-tz datetime-local
 * input and the UTC-ISO strings we store.
 */

/** Convert an ISO UTC string to "YYYYMMDDTHHmmssZ" compact format (used by Google + ICS). */
function toCompactUtc(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${iso}`)
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** "YYYYMMDD" (all-day events) in UTC. */
function toCompactDate(iso: string): string {
  const d = new Date(iso)
  return d.toISOString().slice(0, 10).replace(/-/g, '')
}

function defaultEnd(startIso: string): string {
  const d = new Date(startIso)
  return new Date(d.getTime() + 60 * 60 * 1000).toISOString()
}

/**
 * Build a Google Calendar "create event" URL.
 * Docs: https://calendar.google.com/calendar/render?action=TEMPLATE&…
 */
export function buildGoogleCalendarUrl(
  content: CalendarEventContent,
  fallbackTitle?: string,
): string {
  const title = content.eventTitle || fallbackTitle || 'Event'
  const start = content.startDate
  const end = content.endDate || defaultEnd(start)

  const dates = content.allDay
    ? `${toCompactDate(start)}/${toCompactDate(end)}`
    : `${toCompactUtc(start)}/${toCompactUtc(end)}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    ctz: content.timezone,
  })
  if (content.description) params.set('details', content.description)
  if (content.location) params.set('location', content.location)
  if (content.url) {
    // Prepend url to details (Google doesn't have a dedicated url field)
    const existing = params.get('details') || ''
    params.set('details', existing ? `${existing}\n\n${content.url}` : content.url)
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Escape ICS text per RFC 5545 §3.3.11. */
function icsEscape(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold long lines to ≤75 octets per RFC 5545 §3.1. */
function icsFold(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = []
  let rest = line
  chunks.push(rest.slice(0, 75))
  rest = rest.slice(75)
  while (rest.length > 0) {
    chunks.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  return chunks.join('\r\n')
}

/**
 * Build RFC 5545 ICS content. Times serialized as UTC Z format to avoid
 * shipping VTIMEZONE blocks (the `timezone` field is still stored so the
 * renderer can display in the author's intended zone).
 */
export function buildIcsContent(
  content: CalendarEventContent,
  fallbackTitle?: string,
): string {
  const title = content.eventTitle || fallbackTitle || 'Event'
  const start = content.startDate
  const end = content.endDate || defaultEnd(start)
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}@beam.io`
  const dtstamp = toCompactUtc(new Date().toISOString())

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Beam//Calendar Event//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dtstamp}`]

  if (content.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${toCompactDate(start)}`)
    lines.push(`DTEND;VALUE=DATE:${toCompactDate(end)}`)
  } else {
    lines.push(`DTSTART:${toCompactUtc(start)}`)
    lines.push(`DTEND:${toCompactUtc(end)}`)
  }

  lines.push(`SUMMARY:${icsEscape(title)}`)
  if (content.description) lines.push(`DESCRIPTION:${icsEscape(content.description)}`)
  if (content.location) lines.push(`LOCATION:${icsEscape(content.location)}`)
  if (content.url) lines.push(`URL:${icsEscape(content.url)}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.map(icsFold).join('\r\n')
}

/** Trigger a client-side ICS download. */
export function downloadIcs(content: CalendarEventContent, fallbackTitle?: string): void {
  const ics = buildIcsContent(content, fallbackTitle)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeTitle = (content.eventTitle || fallbackTitle || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  a.download = `${safeTitle}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Convert a datetime-local input value (`"2026-05-01T10:00"`) that represents
 * wall-clock time in `timezone` into a UTC ISO string.
 *
 * Strategy: build a `Date` as if the wall-clock were in UTC, then use
 * `Intl.DateTimeFormat` to discover the tz offset for that instant, then
 * subtract the offset from the UTC timestamp.
 */
export function localToUtcIso(localDatetime: string, timezone: string): string {
  if (!localDatetime) return ''
  // "2026-05-01T10:00" → "2026-05-01T10:00:00Z"
  const asUtc = new Date(`${localDatetime}:00Z`)
  if (Number.isNaN(asUtc.getTime())) throw new Error(`Invalid datetime-local: ${localDatetime}`)
  const offsetMs = tzOffsetMs(asUtc, timezone)
  return new Date(asUtc.getTime() - offsetMs).toISOString()
}

/**
 * Convert a UTC ISO string back to a datetime-local value for a given timezone
 * (the inverse of `localToUtcIso`).
 */
export function utcIsoToLocal(utcIso: string, timezone: string): string {
  if (!utcIso) return ''
  const d = new Date(utcIso)
  if (Number.isNaN(d.getTime())) return ''
  const offsetMs = tzOffsetMs(d, timezone)
  const shifted = new Date(d.getTime() + offsetMs)
  // Trim the trailing "Z" + ms, keep only "YYYY-MM-DDTHH:mm"
  return shifted.toISOString().slice(0, 16)
}

/** Offset (ms) between UTC and `timezone` at the given instant. */
function tzOffsetMs(date: Date, timezone: string): number {
  // Format the instant as parts in the target tz, then rebuild a UTC-interpreted Date;
  // the delta is the offset.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const lookup: Record<string, string> = {}
  for (const p of parts) lookup[p.type] = p.value
  const asUtcFromParts = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour === '24' ? '0' : lookup.hour),
    Number(lookup.minute),
    Number(lookup.second),
  )
  return asUtcFromParts - date.getTime()
}

/** Format a UTC ISO for public display in the event's intended timezone. */
export function formatEventDisplay(
  utcIso: string,
  timezone: string,
  allDay = false,
  locale = 'zh-TW',
): string {
  if (!utcIso) return ''
  const d = new Date(utcIso)
  if (Number.isNaN(d.getTime())) return ''
  if (allDay) {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    }).format(d)
  }
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZoneName: 'short',
  }).format(d)
}

/** Common timezones shown at the top of the dropdown for Taiwan-focused users. */
export const POPULAR_TIMEZONES: { id: string; label: string }[] = [
  { id: 'Asia/Taipei',        label: '台北 (UTC+8)' },
  { id: 'Asia/Tokyo',         label: '東京 (UTC+9)' },
  { id: 'Asia/Seoul',         label: '首爾 (UTC+9)' },
  { id: 'Asia/Singapore',     label: '新加坡 (UTC+8)' },
  { id: 'Asia/Hong_Kong',     label: '香港 (UTC+8)' },
  { id: 'Asia/Shanghai',      label: '上海 (UTC+8)' },
  { id: 'America/Los_Angeles', label: '洛杉磯 (UTC-8/-7)' },
  { id: 'America/New_York',   label: '紐約 (UTC-5/-4)' },
  { id: 'Europe/London',      label: '倫敦 (UTC+0/+1)' },
  { id: 'UTC',                label: 'UTC' },
]

/** Return the browser's detected IANA timezone, or fall back to Asia/Taipei. */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei'
  } catch {
    return 'Asia/Taipei'
  }
}

/** Full list of supported IANA timezones (for "show more" UI). */
export function allTimezones(): string[] {
  const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
  if (typeof intl.supportedValuesOf === 'function') {
    try { return intl.supportedValuesOf('timeZone') } catch { /* ignore */ }
  }
  return POPULAR_TIMEZONES.map(t => t.id)
}
