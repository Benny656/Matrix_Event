export {};
import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "matrix-session"

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN", "FACULTY_ADMIN"],
  "/volunteer": ["VOLUNTEER", "ADMIN"],
  "/student": ["STUDENT", "ADMIN", "FACULTY", "FACULTY_ADMIN"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const cookie = req.cookies.get(SESSION_COOKIE)

  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const res = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
    headers: { Cookie: `${SESSION_COOKIE}=${cookie.value}` },
  })

  if (!res.ok) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const { role, onboardingCompleted, mustChangePassword } = await res.json()

  if (!onboardingCompleted && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url))
  }

  if (mustChangePassword && pathname !== "/change-password") {
    return NextResponse.redirect(new URL("/change-password", req.url))
  }

  for (const [route, roles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route) && !roles.includes(role)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/volunteer/:path*", "/student/:path*", "/onboarding", "/change-password"],
}