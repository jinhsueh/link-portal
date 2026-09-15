import { prisma } from './prisma'

const TRIAL_DAYS = 14

/**
 * Create a new user with the defaults every signup path must share:
 * 14-day pro trial + a default "Home" page. Used by password signup and
 * social login so the two can't drift.
 */
export async function createUserWithDefaults(input: {
  username: string
  email?: string | null
  name?: string | null
  passwordHash?: string | null
  avatarUrl?: string | null
}) {
  return prisma.user.create({
    data: {
      username: input.username,
      email: input.email || `${input.username}@placeholder.local`,
      name: input.name || input.username,
      passwordHash: input.passwordHash ?? null,
      avatarUrl: input.avatarUrl ?? null,
      plan: 'pro_trial',
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      pages: {
        create: { name: 'Home', slug: 'home', isDefault: true, order: 0 },
      },
    },
    select: { id: true, username: true, name: true },
  })
}
