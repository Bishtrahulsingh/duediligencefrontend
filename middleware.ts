import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (accessToken && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}