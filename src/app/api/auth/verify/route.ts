import { NextResponse } from "next/server"
import { getSessionPayload } from "@/lib/auth-session"

export async function GET() {
  const payload = await getSessionPayload()
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({
    role: payload.role,
    onboardingCompleted: payload.onboardingCompleted,
    mustChangePassword: payload.mustChangePassword,
  })
}