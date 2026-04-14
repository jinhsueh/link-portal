export type PlanStatus = 'free' | 'pro_trial' | 'pro' | 'premium'
export type EffectivePlan = 'free' | 'pro' | 'premium'

/** Returns the effective plan: 'premium', 'pro' (paid or active trial), or 'free' */
export function getEffectivePlan(user: { plan: string; trialEndsAt: Date | null }): EffectivePlan {
  if (user.plan === 'premium') return 'premium'
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

/** Basic block types available to all plans */
export const BASIC_BLOCK_TYPES = ['link', 'banner', 'heading', 'video', 'faq', 'countdown'] as const
/** Advanced block types, Pro+ only */
export const ADVANCED_BLOCK_TYPES = ['product', 'email_form', 'carousel', 'map', 'embed'] as const

export interface PlanLimits {
  maxPages: number           // Infinity for unlimited
  maxBlocksPerPage: number   // Infinity for unlimited
  analyticsRetentionDays: number // Infinity for unlimited
  maxTeamMembers: number     // 0 = disabled
  allowedBlockTypes: 'basic' | 'all'
  commissionRate: number     // e.g. 0.10 = 10%
  removeWatermark: boolean
  customFavicon: boolean
  customDomain: boolean
  customCss: boolean
  prioritySupport: boolean
}

export const PLAN_LIMITS: Record<EffectivePlan, PlanLimits> = {
  free: {
    maxPages: 1,
    maxBlocksPerPage: 12,
    analyticsRetentionDays: 30,
    maxTeamMembers: 0,
    allowedBlockTypes: 'basic',
    commissionRate: 0.10,
    removeWatermark: false,
    customFavicon: false,
    customDomain: false,
    customCss: false,
    prioritySupport: false,
  },
  pro: {
    maxPages: 10,
    maxBlocksPerPage: 20,
    analyticsRetentionDays: 90,
    maxTeamMembers: 3,
    allowedBlockTypes: 'all',
    commissionRate: 0.05,
    removeWatermark: true,
    customFavicon: false,
    customDomain: false,
    customCss: false,
    prioritySupport: false,
  },
  premium: {
    maxPages: Infinity,
    maxBlocksPerPage: Infinity,
    analyticsRetentionDays: Infinity,
    maxTeamMembers: Infinity,
    allowedBlockTypes: 'all',
    commissionRate: 0.02,
    removeWatermark: true,
    customFavicon: true,
    customDomain: true,
    customCss: true,
    prioritySupport: true,
  },
}

/** Convenience helper: get limits for a user */
export function getPlanLimits(user: { plan: string; trialEndsAt: Date | null }): PlanLimits {
  return PLAN_LIMITS[getEffectivePlan(user)]
}

/** Whether a block type is allowed for a given plan */
export function isBlockTypeAllowed(plan: EffectivePlan, blockType: string): boolean {
  const limits = PLAN_LIMITS[plan]
  if (limits.allowedBlockTypes === 'all') return true
  return (BASIC_BLOCK_TYPES as readonly string[]).includes(blockType)
}

/** Pricing (NT$) — source of truth for pricing page and Stripe */
export const PLAN_PRICING = {
  pro: { monthly: 159, annual: 139 },       // annual = effective monthly when paid yearly
  premium: { monthly: 249, annual: 219 },
} as const

/** @deprecated use PLAN_LIMITS.free instead */
export const FREE_LIMITS = {
  maxPages: PLAN_LIMITS.free.maxPages,
} as const
