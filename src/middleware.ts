import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_API_ROUTES = [
  '/api/auth',
  '/api/track',
  '/api/profile',
  '/api/pages/verify',
  '/api/stripe/webhook',
  '/api/favicon',
  '/api/health',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin + Super Admin pages: require session cookie
  if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
    const session = req.cookies.get('lp_session')
    if (!session?.value) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Protected API routes: require session cookie
  if (pathname.startsWith('/api/')) {
    const isPublic = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))
    // Allow public GET on subscribers (POST is for public email forms)
    if (pathname === '/api/subscribers' && req.method === 'POST') return NextResponse.next()
    if (!isPublic) {
      const session = req.cookies.get('lp_session')
      if (!session?.value) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/super-admin/:path*', '/api/:path*'],
}
