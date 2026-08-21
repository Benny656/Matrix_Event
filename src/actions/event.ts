"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-session"
import { FieldValue } from "firebase-admin/firestore"
import type { Event, Registration } from "@/types"

const PAGE_SIZE = 10

function buildEligibilityTokens(user: { programType: string | null; department: string | null; yearOfStudy: string | null }): string[] {
  const tokens: string[] = ["AUDIENCE_ALL"]
  if (user.programType) tokens.push(`DEG_${user.programType}`)
  if (user.department) tokens.push(`DEPT_${user.department}`)
  if (user.yearOfStudy) {
    const yr = user.yearOfStudy.replace(" Year", "").replace("1st", "1").replace("2nd", "2").replace("3rd", "3").replace("4th", "4")
    tokens.push(`YR_${yr}`)
  }
  tokens.push("AUDIENCE_STUDENTS")
  return tokens
}

export function buildEventEligibilityTokens(eligibility: Event["eligibility"]): string[] {
  const tokens: string[] = []
  if (eligibility.targetAudience === "ALL") tokens.push("AUDIENCE_ALL")
  if (eligibility.targetAudience === "STUDENTS" || eligibility.targetAudience === "ALL") tokens.push("AUDIENCE_STUDENTS")
  if (eligibility.targetAudience === "FACULTY") tokens.push("AUDIENCE_FACULTY")
  if (eligibility.degrees) eligibility.degrees.forEach((d) => tokens.push(`DEG_${d}`))
  if (eligibility.years) {
    eligibility.years.forEach((y) => {
      if (y === "ALL") {
        tokens.push("YR_1", "YR_2", "YR_3", "YR_4")
      } else {
        const yr = y.replace(" Year", "").replace("1st", "1").replace("2nd", "2").replace("3rd", "3").replace("4th", "4")
        tokens.push(`YR_${yr}`)
      }
    })
  }
  if (eligibility.departments) eligibility.departments.forEach((d) => tokens.push(`DEPT_${d}`))
  return [...new Set(tokens)]
}

export async function getStudentEventsAction(lastDocId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const tokens = buildEligibilityTokens(user)

  let q = adminDb.collection("events")
    .where("status", "!=", "ARCHIVED")
    .where("eligibilityTokens", "array-contains-any", tokens.slice(0, 10))
    .orderBy("status")
    .orderBy("date", "asc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const lastSnap = await adminDb.collection("events").doc(lastDocId).get()
    q = adminDb.collection("events")
      .where("status", "!=", "ARCHIVED")
      .where("eligibilityTokens", "array-contains-any", tokens.slice(0, 10))
      .orderBy("status")
      .orderBy("date", "asc")
      .startAfter(lastSnap)
      .limit(PAGE_SIZE)
  }

  const snap = await q.get()
  const events = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event))
  const lastId = snap.docs[snap.docs.length - 1]?.id ?? null
  const hasMore = snap.docs.length === PAGE_SIZE

  return { events, lastId, hasMore }
}

export async function getEventByIdAction(eventId: string) {
  const snap = await adminDb.collection("events").doc(eventId).get()
  if (!snap.exists) throw new Error("Event not found")
  return { id: snap.id, ...snap.data() } as Event
}

export async function getStudentRegistrationAction(eventId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const snap = await adminDb.collection("registrations")
    .where("eventId", "==", eventId)
    .where("studentId", "==", user.id)
    .limit(1)
    .get()

  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Registration
}

export async function registerForEventAction(eventId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const eventSnap = await adminDb.collection("events").doc(eventId).get()
  if (!eventSnap.exists) throw new Error("Event not found")
  const event = { id: eventSnap.id, ...eventSnap.data() } as Event

  if (!event.registrationOpen) throw new Error("Registration is closed")

  const existing = await adminDb.collection("registrations")
    .where("eventId", "==", eventId)
    .where("studentId", "==", user.id)
    .limit(1)
    .get()

  if (!existing.empty) throw new Error("Already registered")

  const isWaitlisted = event.maxParticipants !== null && event.registrationCount >= event.maxParticipants
  const ref = adminDb.collection("registrations").doc()

  const batch = adminDb.batch()
  batch.set(ref, {
    id: ref.id,
    eventId,
    studentId: user.id,
    status: isWaitlisted ? "WAITLISTED" : "REGISTERED",
    eventRole: "participant",
    participantRole: user.role,
    studentName: user.name,
    email: user.email,
    rollNumber: user.rollNumber,
    department: user.department,
    eventTitle: event.title,
    eventCategory: event.category,
    eventDate: event.date,
    whatsappInviteLink: event.whatsappInviteLink,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  })

  if (!isWaitlisted) {
    batch.update(adminDb.collection("events").doc(eventId), {
      registrationCount: FieldValue.increment(1),
    })
  }

  await batch.commit()
  return { status: isWaitlisted ? "WAITLISTED" : "REGISTERED" }
}

export async function cancelRegistrationAction(registrationId: string, eventId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  const batch = adminDb.batch()
  batch.update(adminDb.collection("registrations").doc(registrationId), {
    status: "CANCELLED",
    updatedAt: new Date().toISOString(),
  })
  batch.update(adminDb.collection("events").doc(eventId), {
    registrationCount: FieldValue.increment(-1),
  })

  await batch.commit()
}