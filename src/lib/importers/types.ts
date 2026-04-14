/**
 * Shared types for third-party profile importers (Linktree, Portaly, ...).
 *
 * The flow is always: importer fetches a public URL → returns an
 * `ImportedProfile` → frontend shows preview → user confirms → apply endpoint
 * writes to DB using our own Block / SocialLink shapes.
 */

import type { BlockType } from '@/types'

export type ImportSource = 'linktree' | 'portaly'

export interface ImportedProfile {
  source: ImportSource
  sourceUrl: string
  /** Display name on the source profile. */
  name?: string
  /** Bio / tagline. */
  bio?: string
  /** Profile image URL. */
  avatarUrl?: string
  /** Blocks mapped into our internal shape (ready to feed `POST /api/blocks`). */
  blocks: ImportedBlock[]
  /** Social links detected on the source page. */
  socialLinks: ImportedSocialLink[]
}

export interface ImportedBlock {
  /** Block type — always a type our schema supports. */
  type: BlockType
  title: string
  /** JSON-serializable content matching the block type. */
  content: Record<string, unknown>
  /** Whether this block was downgraded from a source-only type. */
  downgraded?: boolean
  /** Original source type (for display in the preview UI). */
  sourceType?: string
}

export interface ImportedSocialLink {
  platform: string
  url: string
}
