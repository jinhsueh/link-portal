'use client'

import { createContext, useContext } from 'react'
import type { InAppInfo } from '@/lib/inapp-escape'

export interface SocialLoginFlags {
  google: boolean
  /** Server-side in-app detection from the request UA (first paint only; the client re-checks). */
  inApp: boolean
  inAppInfo: InAppInfo | null
  /** Escape methods switched off via INAPP_DISABLED_METHODS (runtime env). */
  disabledMethods: string[]
}

const Ctx = createContext<SocialLoginFlags>({ google: false, inApp: false, inAppInfo: null, disabledMethods: [] })

export function SocialLoginProvider({ value, children }: { value: SocialLoginFlags; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSocialLogin() {
  return useContext(Ctx)
}
