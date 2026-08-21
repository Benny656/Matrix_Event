"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-session"
import type { Event, Registration } from "@/types"

const PAGE_SIZE = 20

// ─── Guard ────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized")
  return user
}

// ─── Events ───────────────────────────────────────────────
export async function getAdminEventsAction(lastDocId?: string) {
  await requireAdmin()

  let q = adminDb.collection("events")
    .orderBy("date", "desc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const snap = await adminDb.collection("events").doc(lastDocId).get()
    q = adminDb.collection("events")
      .orderBy("date", "desc")
      .startAfter(snap)
      .limit(PAGE_SIZE)
  }

  const snap = await q.get()
  const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event))
  return {
    events,
    lastId: snap.docs[snap.docs.length - 1]?.id ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

export async function createEventAction(data: {
  title: string
  date: string
  category: string
  description: string
  venue: string
  capacity: number
  coordinatorName: string
  sessions: { id: string; title: string; startTime: string }[]
}) {
  await requireAdmin()

  const ref = adminDb.collection("events").doc()
  await ref.set({
    ...data,
    status: "UPCOMING",
    registrationCount: 0,
    createdAt: new Date().toISOString(),
  })
  return { id: ref.id }
}

export async function updateEventAction(
  eventId: string,
  data: Partial<{
    title: string
    date: string
    category: string
    description: string
    venue: string
    capacity: number
    coordinatorName: string
    status: string
    sessions: { id: string; title: string; startTime: string }[]
  }>
) {
  await requireAdmin()
  await adminDb.collection("events").doc(eventId).update({
    ...data,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteEventAction(eventId: string) {
  await requireAdmin()
  // Delete event doc — registrations/attendances are orphaned (cheap, acceptable)
  await adminDb.collection("events").doc(eventId).delete()
}

// ─── Registrations ────────────────────────────────────────
export async function getEventRegistrationsAction(
  eventId: string,
  lastDocId?: string
) {
  await requireAdmin()

  let q = adminDb.collection("registrations")
    .where("eventId", "==", eventId)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const snap = await adminDb.collection("registrations").doc(lastDocId).get()
    q = adminDb.collection("registrations")
      .where("eventId", "==", eventId)
      .orderBy("createdAt", "desc")
      .startAfter(snap)
      .limit(PAGE_SIZE)
  }

  const snap = await q.get()
  const registrations = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Registration))
  return {
    registrations,
    lastId: snap.docs[snap.docs.length - 1]?.id ?? null,
    hasMore: snap.docs.length === PAGE_SIZE,
  }
}

export async function updateRegistrationStatusAction(
  registrationId: string,
  status: "REGISTERED" | "WAITLISTED" | "CANCELLED"
) {
  await requireAdmin()
  await adminDb.collection("registrations").doc(registrationId).update({ status })
}

// ─── Attendance export ────────────────────────────────────
export async function getEventAttendanceAction(eventId: string) {
  await requireAdmin()

  const snap = await adminDb.collection("attendances")
    .where("eventId", "==", eventId)
    .orderBy("timestamp", "asc")
    .get()

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ─── Dashboard stats ──────────────────────────────────────
export async function getAdminDashboardAction() {
  await requireAdmin()

  const [eventsSnap, recentRegSnap] = await Promise.all([
    adminDb.collection("events")
      .where("status", "in", ["UPCOMING", "ONGOING"])
      .orderBy("date", "asc")
      .limit(5)
      .get(),
    adminDb.collection("registrations")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get(),
  ])

  const activeEvents = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const recentRegistrations = recentRegSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return { activeEvents, recentRegistrations }
}