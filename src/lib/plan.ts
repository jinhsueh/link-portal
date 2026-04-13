export type PlanStatus = 'free' | 'pro_trial' | 'pro'

/** Returns the effective plan: 'pro' if paid or active trial, 'free' otherwise */
export function getEffectivePlan(user: { plan: string; trialEndsAt: Date | null }): 'free' | 'pro' {
  if (user.plan === 'pro') return 'pro'
  if (user.plan === 'pro_trial' && user.trialEndsAt && new Date() < user.trialEndsAt) return 'pro'
  return 'free'
}

/** Returns number of days left in trial (0 if no trial or expired) */
export function getTrialDaysLeft(trialEndsAt: Date | null): number {
  if (!trialEndsAt) return 0
  const diff = trialEndsAt.getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export const FREE_LIMITS = {
  maxPages: 1,
} as const
