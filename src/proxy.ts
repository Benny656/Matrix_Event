import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "matrix-session"

const roleRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/volunteer": ["VOLUNTEER", "ADMIN"],
  "/student": ["STUDENT", "ADMIN", "FACULTY"],
}

const roleDashboard: Record<string, string> = {
  ADMIN: "/admin",
  VOLUNTEER: "/volunteer",
  FACULTY: "/student",
  STUDENT: "/student",
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const cookie = req.cookies.get(SESSION_COOKIE)

  // Redirect already-logged-in users away from landing page and login
  if (pathname === "/" || pathname === "/login") {
    if (cookie) {
      try {
        const payload = JSON.parse(cookie.value)
        const { role, onboardingCompleted } = payload
        if (!onboardingCompleted) {
          return NextResponse.redirect(new URL("/onboarding", req.url))
        }
        const dest = roleDashboard[role] ?? "/student"
        return NextResponse.redirect(new URL(dest, req.url))
      } catch {
        // Invalid cookie — let them through to login
      }
    }
    return NextResponse.next()
  }

  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const payload = JSON.parse(cookie.value)
    const { role, onboardingCompleted } = payload

    if (!onboardingCompleted && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url))
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
  matcher: ["/", "/login", "/admin/:path*", "/volunteer/:path*", "/student/:path*", "/onboarding"],
}

