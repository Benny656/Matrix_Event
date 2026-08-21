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

export async function updateUserRoleAction(userId: string, role: "ADMIN" | "VOLUNTEER" | "STUDENT") {
  const current = await getCurrentUser()
  if (!current || current.role !== "ADMIN") throw new Error("Unauthorized")
  await adminDb.collection("users").doc(userId).update({ role })
}

export async function searchUsersAction(query: string) {
  const current = await getCurrentUser()
  if (!current || current.role !== "ADMIN") throw new Error("Unauthorized")

  // Search by rollNumber prefix
  const snap = await adminDb.collection("users")
    .where("rollNumber", ">=", query.toUpperCase())
    .where("rollNumber", "<=", query.toUpperCase() + "\uf8ff")
    .limit(10)
    .get()

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}