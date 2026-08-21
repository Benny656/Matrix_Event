"use server"

import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-session"
import { FieldValue } from "firebase-admin/firestore"
import type { RegisteredStudent, Attendance } from "@/types"

export async function getEventRegisteredStudentsAction(eventId: string): Promise<RegisteredStudent[]> {
  const snap = await adminDb.collection("registrations")
    .where("eventId", "==", eventId)
    .where("status", "==", "REGISTERED")
    .get()

  return snap.docs.map((d) => {
    const data = d.data()
    return {
      studentId: data.studentId,
      studentName: data.studentName,
      rollNumber: data.rollNumber ?? null,
      department: data.department ?? null,
      yearOfStudy: data.yearOfStudy ?? null,
      programType: data.programType ?? null,
      email: data.email,
      registrationId: d.id,
    } as RegisteredStudent
  })
}

export async function submitBatchAttendanceAction(
  sessionId: string,
  eventId: string,
  scanned: { studentId: string; studentName: string; rollNumber: string | null; department: string | null; yearOfStudy: string | null; programType: string | null; method: "SCANNED" | "MANUAL" }[]
) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  if (scanned.length === 0) throw new Error("No attendance to submit")

  const existing = await adminDb.collection("attendances")
    .where("sessionId", "==", sessionId)
    .get()

  const existingIds = new Set(existing.docs.map((d) => d.data().studentId))
  const newScanned = scanned.filter((s) => !existingIds.has(s.studentId))

  if (newScanned.length === 0) throw new Error("All attendance already submitted")

  const batch = adminDb.batch()
  const now = new Date().toISOString()

  for (const s of newScanned) {
    const ref = adminDb.collection("attendances").doc()
    batch.set(ref, {
      id: ref.id,
      sessionId,
      eventId,
      studentId: s.studentId,
      studentName: s.studentName,
      rollNumber: s.rollNumber ?? "",
      department: s.department ?? "",
      yearOfStudy: s.yearOfStudy ?? "",
      programType: s.programType ?? "",
      checkInTime: now,
      checkInMethod: s.method,
      markedById: user.id,
      createdAt: now,
    })
  }

  batch.update(adminDb.collection("users").doc(user.id), {
    totalCheckInsValidated: FieldValue.increment(newScanned.length),
  })

  await batch.commit()
  return { submitted: newScanned.length }
}

export async function getVolunteerEventsAction() {
  const snap = await adminDb.collection("events")
    .where("status", "in", ["UPCOMING", "ONGOING"])
    .orderBy("date", "asc")
    .limit(10)
    .get()

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getSessionAttendanceAction(sessionId: string): Promise<Attendance[]> {
  const snap = await adminDb.collection("attendances")
    .where("sessionId", "==", sessionId)
    .get()

  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Attendance))
}