// Simple cookie-based session for demo purposes
// In production, replace with NextAuth or similar

import { cookies } from 'next/headers'
import { prisma } from './prisma'

export const SESSION_COOKIE = 'lp_session'

export async function getSession() {
  const cookieStore = await cookies()
  const username = cookieStore.get(SESSION_COOKIE)?.value
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
