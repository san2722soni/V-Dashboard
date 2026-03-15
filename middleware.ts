import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware to protect routes and handle authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get tokens from request headers or cookies if needed
  // For now, we'll let the client-side handle authentication
  // since tokens are stored in localStorage

  // Allow all requests to pass through
  // Client-side components will handle authentication checks
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - d/ (public download routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|d/|_next/static|_next/image|favicon.ico).*)",
  ],
}
