"use server"

import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser, getSessionPayload } from "@/lib/auth-session"
import type { Registration } from "@/types"

const PAGE_SIZE = 10

export async function getStudentRegistrationsAction(lastDocId?: string) {
  const payload = await getSessionPayload()
  if (!payload) throw new Error("Unauthorized")

  let q = adminDb.collection("registrations")
    .where("studentId", "==", payload.uid)
    .orderBy("createdAt", "desc")
    .limit(PAGE_SIZE)

  if (lastDocId) {
    const lastSnap = await adminDb.collection("registrations").doc(lastDocId).get()
    if (lastSnap.exists) {
      q = adminDb.collection("registrations")
        .where("studentId", "==", payload.uid)
        .orderBy("createdAt", "desc")
        .startAfter(lastSnap)
        .limit(PAGE_SIZE)
    }
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

export async function registerForEventAction(eventId: string) {
  const session = await getSessionPayload()
  if (!session) throw new Error("Unauthorized")

  return adminDb.runTransaction(async (tx) => {
    // Both reads happen inside the transaction for a consistent snapshot
    const eventRef = adminDb.collection("events").doc(eventId)
    const userRef = adminDb.collection("users").doc(session.uid)

    const [eventSnap, userSnap] = await Promise.all([
      tx.get(eventRef),
      tx.get(userRef),
    ])

    if (!eventSnap.exists) throw new Error("Event not found")
    const event = eventSnap.data()!

    if (!event.registrationOpen) throw new Error("Registration is closed")

    // getSessionPayload() only stores {uid, role, onboardingCompleted, session}
    // — name/email/rollNumber/department are only in the users doc, read above
    const userData = userSnap.data() ?? {}

    // Duplicate prevention is fully atomic: the deterministic doc ID
    // means tx.set() will conflict if the doc already exists.

    // Atomic capacity check
    const isWaitlisted =
      typeof event.maxParticipants === "number" &&
      event.maxParticipants > 0 &&
      event.registrationCount >= event.maxParticipants

    const status = isWaitlisted ? "WAITLISTED" : "REGISTERED"

    // Deterministic ID: one doc per student per event, collision = already registered
    const regRef = adminDb
      .collection("registrations")
      .doc(`${eventId}_${session.uid}`)
    tx.set(regRef, {
      eventId,
      studentId: session.uid,
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
      status,
      eventRole: "participant",
      participantRole: "attendee",
      createdAt: new Date().toISOString(),
      updatedAt: null,
    })

    if (!isWaitlisted) {
      tx.update(eventRef, {
        registrationCount: FieldValue.increment(1),
      })
    }

    return { status }
  })
}