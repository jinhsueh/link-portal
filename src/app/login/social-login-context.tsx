'use client'

import { createContext, useContext } from 'react'

export interface SocialLoginFlags { google: boolean }

const Ctx = createContext<SocialLoginFlags>({ google: false })

export function SocialLoginProvider({ value, children }: { value: SocialLoginFlags; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSocialLogin() {
  return useContext(Ctx)
}
