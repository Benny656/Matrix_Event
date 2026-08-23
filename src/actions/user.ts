"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-session"

const PAGE_SIZE = 20

export async function getAllUsersAction(lastDocId?: string) {
  const current = await getCurrentUser()
  if (!current || current.role !== "ADMIN") throw new Error("Unauthorized")

  let q = adminDb.collection("users")
    .orderBy("name", "asc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const snap = await adminDb.collection("users").doc(lastDocId).get()
    q = adminDb.collection("users")
      .orderBy("name", "asc")
      .startAfter(snap)
      .limit(PAGE_SIZE)
  }

  const snap = await q.get()
  const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return {
    users,
    lastId: snap.docs[snap.docs.length - 1]?.id ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

export async function updateUserRoleAction(userId: string, role: "ADMIN" | "VOLUNTEER" | "FACULTY" | "STUDENT") {
  const current = await getCurrentUser()
  if (!current || current.role !== "ADMIN") throw new Error("Unauthorized")
  await adminDb.collection("users").doc(userId).update({ role })
}

export async function searchUsersAction(query: string) {
  const current = await getCurrentUser()
  if (!current || current.role !== "ADMIN") throw new Error("Unauthorized")

  const clean = query.trim()
  if (!clean) return []

  const upper = clean.toUpperCase()
  const lower = clean.toLowerCase()

  const [byRoll, byEmail, byName] = await Promise.all([
    adminDb
      .collection("users")
      .where("rollNumber", ">=", upper)
      .where("rollNumber", "<=", upper + "\uf8ff")
      .limit(20)
      .get(),
    adminDb
      .collection("users")
      .where("email", ">=", lower)
      .where("email", "<=", lower + "\uf8ff")
      .limit(20)
      .get(),
    adminDb
      .collection("users")
      .where("name", ">=", clean)
      .where("name", "<=", clean + "\uf8ff")
      .limit(20)
      .get(),
  ])

  const userMap = new Map<string, any>()
  for (const snap of [byRoll, byEmail, byName]) {
    for (const doc of snap.docs) {
      if (!userMap.has(doc.id)) {
        userMap.set(doc.id, { id: doc.id, ...doc.data() })
      }
    }
  }

  return Array.from(userMap.values())
}