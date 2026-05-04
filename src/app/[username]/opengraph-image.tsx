import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const alt = 'Beam'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, bio: true, avatarUrl: true },
  })

  if (!user) {
    return new ImageResponse(
      <div style={{ display: 'flex', width: '100%', height: '100%', background: '#1A1A2E', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#5090FF', fontSize: 48 }}>Beam</span>
      </div>,
      size,
    )
  }

  const displayName = user.name || user.username
  const initial = displayName.charAt(0).toUpperCase()

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Avatar circle */}
      {user.avatarUrl && !user.avatarUrl.startsWith('data:') ? (
        <img
          src={user.avatarUrl}
          width={120}
          height={120}
          style={{ borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)' }}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: '#5090FF',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 52,
            fontWeight: 700,
            color: 'white',
            border: '4px solid rgba(255,255,255,0.2)',
          }}
        >
          {initial}
        </div>
      )}

      {/* Name */}
      <span
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: 'white',
          maxWidth: 800,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayName}
      </span>

      {/* Bio */}
      {user.bio && (
        <span
          style={{
            fontSize: 24,
            color: '#94A3B8',
            maxWidth: 700,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.bio}
        </span>
      )}

      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
        <div
          style={{
            display: 'flex',
            width: 28,
            height: 28,
            borderRadius: 8,
            background: '#5090FF',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: 'white',
          }}
        >
          B
        </div>
        <span style={{ fontSize: 20, color: '#5090FF', fontWeight: 600 }}>Beam</span>
      </div>
    </div>,
    size,
  )
}
