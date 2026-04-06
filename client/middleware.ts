import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const DEMO_AUTH_COOKIE = "libris_demo_auth"

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get(DEMO_AUTH_COOKIE)?.value === "1"

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    const redirectPath = `${request.nextUrl.pathname}${request.nextUrl.search}`

    loginUrl.searchParams.set("redirect", redirectPath)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}