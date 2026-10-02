"use server"

import { unstable_noStore as noStore } from "next/cache"
import { adminDb } from "@/lib/firebase-admin"
import { getSessionPayload } from "@/lib/auth-session"
import { FieldValue } from "firebase-admin/firestore"
import type { Event, Registration } from "@/types"


const PAGE_SIZE = 20

// ─── Guard ────────────────────────────────────────────────
async function requireAdmin() {
  const payload = await getSessionPayload()
  if (!payload || payload.role !== "ADMIN") throw new Error("Unauthorized")
  return payload
}

// ─── Events ───────────────────────────────────────────────
export async function getAdminEventsAction(lastDocId?: string) {
  await requireAdmin()

  let q = adminDb.collection("events")
    .orderBy("date", "desc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const lastSnap = await adminDb.collection("events").doc(lastDocId).get()
    if (lastSnap.exists) {
      q = adminDb.collection("events")
        .orderBy("date", "desc")
        .startAfter(lastSnap)
        .limit(PAGE_SIZE)
    }
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

// ─── Auto-enroll helper ───────────────────────────────────
async function autoEnrollStudents(
  eventId: string,
  event: {
    title: string
    category: string
    date: string
    whatsappInviteLink: string | null
  },
  eligibility: {
    programTypes: string[]
    years: string[]
    departments: string[]
  }
) {
  // Build the base query: students only
  let query = adminDb.collection("users").where("role", "==", "STUDENT")

  // Filter by programType if not covering both
  if (eligibility.programTypes.length === 1) {
    query = query.where("programType", "==", eligibility.programTypes[0])
  }

  const usersSnap = await query.get()

  // Client-side filter for years and departments (Firestore doesn't support
  // multi-field 'in' on multiple fields in a single query cheaply)
  const allYears = eligibility.years.includes("ALL") || eligibility.years.includes("All Years")
  const matchingUsers = usersSnap.docs.filter((doc) => {
    const data = doc.data()
    // Program type check (if both, skip; already queried)
    if (eligibility.programTypes.length > 1 && !eligibility.programTypes.includes(data.programType)) return false
    // Year check
    if (!allYears) {
      const userYear = data.yearOfStudy ?? ""
      if (!eligibility.years.includes(userYear)) return false
    }
    // Department check
    if (!eligibility.departments.includes(data.department)) return false
    return true
  })

  if (matchingUsers.length === 0) return 0

  const now = new Date().toISOString()
  const CHUNK = 450

  for (let i = 0; i < matchingUsers.length; i += CHUNK) {
    const chunk = matchingUsers.slice(i, i + CHUNK)
    const batch = adminDb.batch()

    for (const userDoc of chunk) {
      const userData = userDoc.data()
      // Deterministic ID — same pattern as registerForEventAction
      const regRef = adminDb.collection("registrations").doc(`${eventId}_${userDoc.id}`)
      batch.set(regRef, {
        eventId,
        studentId: userDoc.id,
        studentName: userData.name ?? null,
        email: userData.email ?? null,
        rollNumber: userData.rollNumber ?? null,
        department: userData.department ?? null,
        yearOfStudy: userData.yearOfStudy ?? null,
        programType: userData.programType ?? null,
        eventTitle: event.title,
        eventCategory: event.category,
        eventDate: event.date,
        whatsappInviteLink: event.whatsappInviteLink ?? null,
        status: "REGISTERED",
        registrationType: "MANDATORY",
        eventRole: "participant",
        participantRole: "attendee",
        createdAt: now,
        updatedAt: null,
      }, { merge: false })
    }

    await batch.commit()
  }

  // Update registrationCount atomically
  await adminDb.collection("events").doc(eventId).update({
    registrationCount: FieldValue.increment(matchingUsers.length),
  })

  return matchingUsers.length
}

export async function createEventAction(data: {
  title: string
  date: string
  category: string
  description: string
  capacity?: number
  whatsappInviteLink?: string
  registrationType?: "MANDATORY" | "SELF_REGISTERED"
  sessions?: { id: string; title: string; startTime: string; endTime?: string | null }[]
  eligibility?: {
    targetAudience: "ALL" | "STUDENTS" | "FACULTY"
    programTypes?: string[]
    years?: string[]
    departments?: string[]
  }
}) {
  await requireAdmin()

  const registrationType = data.registrationType ?? "SELF_REGISTERED"

  const eligibility = {
    targetAudience: data.eligibility?.targetAudience || "ALL",
    degrees: data.eligibility?.programTypes || ["UG", "PG"],
    years: data.eligibility?.years || ["ALL"],
    departments: data.eligibility?.departments?.length ? data.eligibility.departments : null,
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
    registrationType,
    registrationOpen: registrationType === "SELF_REGISTERED",
    registrationCount: 0,
    eligibility,
    eligibilityTokens,
    createdAt: new Date().toISOString(),
  })

  if (registrationType === "MANDATORY") {
    await autoEnrollStudents(
      ref.id,
      {
        title: data.title,
        category: data.category,
        date: data.date,
        whatsappInviteLink: data.whatsappInviteLink || null,
      },
      {
        programTypes: data.eligibility?.programTypes || ["UG", "PG"],
        years: data.eligibility?.years || ["ALL"],
        departments: data.eligibility?.departments || [],
      }
    )
  }

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
      targetAudience: "ALL" | "STUDENTS" | "FACULTY"
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
    const lastSnap = await adminDb.collection("registrations").doc(lastDocId).get()
    if (lastSnap.exists) {
      q = adminDb.collection("registrations")
        .where("eventId", "==", eventId)
        .orderBy("createdAt", "desc")
        .startAfter(lastSnap)
        .limit(PAGE_SIZE)
    }
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

export async function getAllEventRegistrationsAction(eventId: string) {
  await requireAdmin()
  const snap = await adminDb.collection("registrations")
    .where("eventId", "==", eventId)
    .orderBy("createdAt", "asc")
    .get()
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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

// ─── Event counts ─────────────────────────────────────────
export async function getEventCountsAction(eventId: string) {
  noStore()
  await requireAdmin()

  const [regCountSnap, attCountSnap] = await Promise.all([
    adminDb.collection("registrations")
      .where("eventId", "==", eventId)
      .count()
      .get(),
    adminDb.collection("attendances")
      .where("eventId", "==", eventId)
      .count()
      .get(),
  ])

  return {
    registrationCount: regCountSnap.data().count,
    checkedInCount: attCountSnap.data().count,
  }
}

// ─── Dashboard stats ──────────────────────────────────────
export async function getAdminDashboardAction() {
  noStore()
  await requireAdmin()

  const [eventsSnap, usersCountSnap] = await Promise.all([
    adminDb.collection("events")
      .where("status", "in", ["UPCOMING", "ONGOING"])
      .orderBy("date", "asc")
      .limit(5)
      .get(),
    adminDb.collection("users").count().get(),
  ])

  const activeEvents = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const totalUsers = usersCountSnap.data().count

  return { activeEvents, totalUsers }
}