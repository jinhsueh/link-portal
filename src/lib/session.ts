// Signed cookie-based session using HMAC
// The cookie value is `username.signature` where signature = HMAC-SHA256(username, secret)

import { cookies } from 'next/headers'
import { prisma } from './prisma'
import crypto from 'crypto'

export const SESSION_COOKIE = 'lp_session'

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET env var is required')
  return secret
}

export function signSession(username: string): string {
  const sig = crypto.createHmac('sha256', getSecret()).update(username).digest('hex')
  return `${username}.${sig}`
}

export function verifySession(token: string): string | null {
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex === -1) return null
  const username = token.slice(0, dotIndex)
  const sig = token.slice(dotIndex + 1)
  const expected = crypto.createHmac('sha256', getSecret()).update(username).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  return username
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const username = verifySession(token)
  if (!username) return null

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true, bio: true, avatarUrl: true },
  })
  return user
}

export async function requireSession() {
  const session = await getSession()
  return session
}
