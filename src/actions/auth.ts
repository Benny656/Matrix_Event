"use server"

import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { createSession, destroySession, refreshSession } from "@/lib/auth-session"

const HARDCODED_ADMIN_EMAILS = [
  "bennymanuel2020@gmail.com",
  "matrixkarunya@gmail.com",
]

const ADMIN_EMAILS = [
  ...HARDCODED_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()),
].filter(Boolean)

export async function syncGoogleUserAction(
  uid: string,
  email: string,
  name: string,
  image: string,
  idToken: string,
) {
  const normalizedEmail = email.toLowerCase().trim()
  const ref = adminDb.collection("users").doc(uid)
  const snap = await ref.get()

  const isAdmin = ADMIN_EMAILS.includes(normalizedEmail)

  if (!snap.exists) {
    const isFaculty = normalizedEmail.endsWith("@karunya.edu")
    const isStudent = normalizedEmail.endsWith("@karunya.edu.in")

    if (!isAdmin && !isFaculty && !isStudent) {
      throw new Error("Use your Karunya college email to sign in")
    }

    await ref.set({
      id: uid,
      name,
      email: normalizedEmail,
      emailVerified: true,
      image,
      rollNumber: null,
      phoneNumber: null,
      department: null,
      programType: null,
      degree: null,
      yearOfStudy: null,
      role: isAdmin ? "ADMIN" : isFaculty ? "FACULTY" : "STUDENT",
      onboardingCompleted: isAdmin,
      mustChangePassword: false,
      totalCheckInsValidated: 0,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    })
  } else if (isAdmin) {
    const data = snap.data()
    if (data?.role !== "ADMIN" || !data?.onboardingCompleted) {
      await ref.update({
        role: "ADMIN",
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  await createSession(idToken)
}

export async function signOutAction() {
  await destroySession()
}

export async function completeOnboardingAction(
  uid: string,
  data: {
    name: string
    rollNumber: string
    programType: string
    degree?: string
    department: string
    yearOfStudy: string
    phoneNumber: string
  },
) {
  const duplicate = await adminDb
    .collection("users")
    .where("rollNumber", "==", data.rollNumber)
    .limit(2)
    .get()

  const others = duplicate.docs.filter((d) => d.id !== uid)
  if (others.length > 0) throw new Error("Roll number already in use")

  await adminDb
    .collection("users")
    .doc(uid)
    .update({
      ...data,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    })

  await refreshSession()
}

export async function changePasswordAction(uid: string, newPassword: string) {
  await adminAuth.updateUser(uid, { password: newPassword })
  await adminDb.collection("users").doc(uid).update({
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  })
  await refreshSession()
}