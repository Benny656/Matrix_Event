import { cookies } from "next/headers"
import { adminAuth, adminDb } from "./firebase-admin"
import type { User } from "@/types"

const SESSION_COOKIE = "matrix-session"
const EXPIRY_MS = 60 * 60 * 24 * 7 * 1000

export async function createSession(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRY_MS })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: EXPIRY_MS / 1000,
    path: "/",
  })
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(SESSION_COOKIE)
    if (!cookie) return null
    return await adminAuth.verifySessionCookie(cookie.value, true)
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null
  const doc = await adminDb.collection("users").doc(session.uid).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as User
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}