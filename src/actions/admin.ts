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

import { buildEventEligibilityTokens } from "@/lib/eligibility"

export async function createEventAction(data: {
  title: string
  date: string
  category: string
  description: string
  capacity?: number
  whatsappInviteLink?: string
  sessions?: { id: string; title: string; startTime: string; endTime?: string | null }[]
  eligibility?: {
    targetAudience: "ALL" | "STUDENTS"
    programTypes?: string[]
    years?: string[]
  }
}) {
  await requireAdmin()

  const eligibility = {
    targetAudience: data.eligibility?.targetAudience || "ALL",
    degrees: data.eligibility?.programTypes || ["UG", "PG"],
    years: data.eligibility?.years || ["ALL"],
    departments: null,
  }

  const eligibilityTokens = buildEventEligibilityTokens(eligibility)

  const ref = adminDb.collection("events").doc()
  await ref.set({
    title: data.title,
    date: data.date,
    category: data.category,
    description: data.description,
    capacity: data.capacity || 0,
    maxParticipants: data.capacity || null,
    whatsappInviteLink: data.whatsappInviteLink || null,
    sessions: data.sessions || [],
    status: "UPCOMING",
    registrationOpen: true,
    registrationCount: 0,
    eligibility,
    eligibilityTokens,
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
    capacity: number
    maxParticipants: number | null
    status: string
    registrationOpen: boolean
    whatsappInviteLink: string | null
    sessions: { id: string; title: string; startTime: string; endTime?: string | null }[]
    eligibility?: {
      targetAudience: "ALL" | "STUDENTS"
      programTypes?: string[]
      years?: string[]
    }
  }>
) {
  await requireAdmin()
  const updateData: Record<string, any> = {
    ...data,
    updatedAt: new Date().toISOString(),
  }
  if (data.eligibility) {
    const eligibility = {
      targetAudience: data.eligibility.targetAudience || "ALL",
      degrees: data.eligibility.programTypes || ["UG", "PG"],
      years: data.eligibility.years || ["ALL"],
      departments: null,
    }
    updateData.eligibility = eligibility
    updateData.eligibilityTokens = buildEventEligibilityTokens(eligibility)
  }
  await adminDb.collection("events").doc(eventId).update(updateData)
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

  const eventsSnap = await adminDb.collection("events")
    .where("status", "in", ["UPCOMING", "ONGOING"])
    .orderBy("date", "asc")
    .limit(5)
    .get()

  const activeEvents = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return { activeEvents }
}