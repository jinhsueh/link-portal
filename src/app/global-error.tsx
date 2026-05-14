'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#F0F4FF' }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#4A5568', marginBottom: 24 }}>
              Sorry — the app hit a critical error.
            </p>
            <button onClick={reset}
              style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: 'white', background: '#5090FF', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
