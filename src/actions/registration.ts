"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-session"
import type { Registration } from "@/types"

const PAGE_SIZE = 10

export async function getStudentRegistrationsAction(lastDocId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  let q = adminDb.collection("registrations")
    .where("studentId", "==", user.id)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const lastSnap = await adminDb.collection("registrations").doc(lastDocId).get()
    q = adminDb.collection("registrations")
      .where("studentId", "==", user.id)
      .orderBy("createdAt", "desc")
      .startAfter(lastSnap)
      .limit(PAGE_SIZE)
  }

  const snap = await q.get()
  const registrations = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration))
  const lastId = snap.docs[snap.docs.length - 1]?.id ?? null
  const hasMore = snap.docs.length === PAGE_SIZE

  return { registrations, lastId, hasMore }
}

export async function getStudentDashboardAction() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const [registrationsSnap, upcomingSnap] = await Promise.all([
    adminDb.collection("registrations")
      .where("studentId", "==", user.id)
      .where("status", "==", "REGISTERED")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get(),
    adminDb.collection("events")
      .where("status", "in", ["UPCOMING", "ONGOING"])
      .orderBy("date", "asc")
      .limit(3)
      .get(),
  ])

  const registrations = registrationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration))
  const upcomingEvents = upcomingSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return { user, registrations, upcomingEvents }
}