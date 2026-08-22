import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "matrix-session"

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/volunteer": ["VOLUNTEER", "ADMIN"],
  "/student": ["STUDENT", "ADMIN"],
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const cookie = req.cookies.get(SESSION_COOKIE)

  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const payload = JSON.parse(cookie.value)
    const { role, onboardingCompleted, mustChangePassword } = payload

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
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/admin/:path*", "/volunteer/:path*", "/student/:path*", "/onboarding", "/change-password"],
}