import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/forgetPassword','/']

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // If there's no session and the route is not public, redirect to signin
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}