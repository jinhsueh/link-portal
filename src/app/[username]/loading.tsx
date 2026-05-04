/**
 * Next.js streaming loading boundary for `/{username}`.
 * Shows the skeleton while the server fetches profile + blocks from DB.
 */
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton'

export default function Loading() {
  return <ProfileSkeleton />
}
