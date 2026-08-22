import { cookies } from "next/headers"
import { adminAuth, adminDb } from "./firebase-admin"
import type { User } from "@/types"

const SESSION_COOKIE = "matrix-session"
const EXPIRY_MS = 60 * 60 * 24 * 7 * 1000

const HARDCODED_ADMIN_EMAILS = [
  "bennymanuel2020@gmail.com",
  "matrixkarunya@gmail.com",
]

const ADMIN_EMAILS = [
  ...HARDCODED_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()),
].filter(Boolean)

export async function createSession(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRY_MS })
  const decoded = await adminAuth.verifySessionCookie(sessionCookie)
  const userSnap = await adminDb.collection("users").doc(decoded.uid).get()
  const user = userSnap.data()

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())

  const payload = {
    session: sessionCookie,
    uid: decoded.uid,
    role: isAdmin ? "ADMIN" : user?.role,
    onboardingCompleted: isAdmin ? true : user?.onboardingCompleted,
    mustChangePassword: user?.mustChangePassword ?? false,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: EXPIRY_MS / 1000,
    path: "/",
  })
}

export async function getSessionPayload() {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(SESSION_COOKIE)
    if (!cookie) return null
    return JSON.parse(cookie.value)
  } catch {
    return null
  }
}

export async function getSession() {
  try {
    const payload = await getSessionPayload()
    if (!payload) return null
    return await adminAuth.verifySessionCookie(payload.session, true)
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null
  const doc = await adminDb.collection("users").doc(session.uid).get()
  if (!doc.exists) return null
  const user = { id: doc.id, ...doc.data() } as User
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
    user.role = "ADMIN"
    user.onboardingCompleted = true
  }
  return user
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
export async function refreshSession() {
  const payload = await getSessionPayload()
  if (!payload) return
  const userSnap = await adminDb.collection("users").doc(payload.uid).get()
  const user = userSnap.data()
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())

  const newPayload = {
    ...payload,
    role: isAdmin ? "ADMIN" : user?.role,
    onboardingCompleted: isAdmin ? true : user?.onboardingCompleted,
    mustChangePassword: user?.mustChangePassword ?? false,
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(newPayload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: EXPIRY_MS / 1000,
    path: "/",
  })
}