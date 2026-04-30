import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (request.nextUrl.pathname === '/register') {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }

  return NextResponse.next()
}
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
