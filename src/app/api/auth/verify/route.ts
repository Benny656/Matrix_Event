import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-session"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    mustChangePassword: user.mustChangePassword,
  })
}