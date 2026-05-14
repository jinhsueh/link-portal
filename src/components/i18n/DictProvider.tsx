'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Dictionary, Locale } from '@/lib/i18n'
import enDict from '@/../messages/en.json'

/**
 * DictProvider — passes a server-loaded dictionary + active locale down to
 * client components via React Context.
 *
 * Why context, not props: the public profile (`<ProfileView>`) renders many
 * descendant block components (LinkBlock, EmailFormBlock, ProductBlock,
 * PasswordGate, …) that need translated strings. Threading dict through
 * every render layer would be noisy; a context read with useDict() is
 * cleaner.
 *
 * Pattern:
 *   Server route loads dict → wraps client subtree in <DictProvider> →
 *   client components call `const { dict } = useDict()` and read keys.
 *
 * Falls back to the English dict + 'en' locale when used OUTSIDE a provider
 * (e.g. on the demo page or admin live-preview render where there's no
 * visitor locale to resolve). Choosing fallback-over-throw keeps those
 * surfaces from crashing while still printing readable English text.
 */

interface DictContextValue {
  dict: Dictionary
  locale: Locale
}

const DictContext = createContext<DictContextValue | null>(null)

/** Default value used when useDict() is called outside any provider. */
const FALLBACK: DictContextValue = {
  dict: enDict as unknown as Dictionary,
  locale: 'en',
}

export function DictProvider({ value, children }: { value: DictContextValue; children: ReactNode }) {
  return <DictContext.Provider value={value}>{children}</DictContext.Provider>
}

export function useDict(): DictContextValue {
  return useContext(DictContext) ?? FALLBACK
}
