/**
 * Loading skeleton for public profile pages.
 *
 * Used as `loading.tsx` for `/{username}` so users see content shape on slow
 * networks instead of a blank screen. The skeleton mirrors the real
 * ProfileView layout (avatar circle + name + 4-block stack) so the swap-in is
 * smooth, not jarring.
 */
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen" style={{
      background: 'var(--gradient-hero, linear-gradient(135deg, #F0F4FF 0%, #FFFFFF 60%))',
      fontFamily: 'var(--font-primary), var(--font-cjk)',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 64px' }}>
        {/* Avatar */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-28 h-28 rounded-full mb-5 animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
          <div className="h-6 w-40 rounded mb-3 animate-pulse" style={{ background: 'rgba(0,0,0,0.08)' }} />
          <div className="h-3 w-56 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.05)' }} />
        </div>

        {/* Social icons row */}
        <div className="flex justify-center gap-2.5 mb-7">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
          ))}
        </div>

        {/* Block list */}
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(0,0,0,0.06)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
