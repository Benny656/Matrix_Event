import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { getCurrentUser } from "@/lib/auth-session"

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || !["ADMIN", "FACULTY_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const type = searchParams.get("type") // "registrations" | "attendance"
  const eventId = searchParams.get("eventId")

  if (!type || !eventId) {
    return NextResponse.json({ error: "Missing type or eventId" }, { status: 400 })
  }

  try {
    let rows: Record<string, string>[] = []
    let filename = ""

    if (type === "registrations") {
      const snap = await adminDb
        .collection("registrations")
        .where("eventId", "==", eventId)
        .orderBy("createdAt", "asc")
        .get()

      rows = snap.docs.map((d) => {
        const data = d.data()
        return {
          Name: data.studentName ?? "",
          Email: data.email ?? "",
          "Roll Number": data.rollNumber ?? "",
          Department: data.department ?? "",
          Status: data.status ?? "",
          "Event Role": data.eventRole ?? "",
          "Registered At": data.createdAt
            ? new Date(data.createdAt).toLocaleString("en-IN")
            : "",
        }
      })
      filename = `registrations-${eventId}.csv`
    }

    if (type === "attendance") {
      const snap = await adminDb
        .collection("attendances")
        .where("eventId", "==", eventId)
        .orderBy("checkInTime", "asc")
        .get()

      rows = snap.docs.map((d) => {
        const data = d.data()
        return {
          Name: data.studentName ?? "",
          "Roll Number": data.rollNumber ?? "",
          Department: data.department ?? "",
          "Year of Study": data.yearOfStudy ?? "",
          "Program Type": data.programType ?? "",
          "Check-in Method": data.checkInMethod ?? "",
          "Check-in Time": data.checkInTime
            ? new Date(data.checkInTime).toLocaleString("en-IN")
            : "",
          Session: data.sessionId ?? "",
        }
      })
      filename = `attendance-${eventId}.csv`
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((h) => `"${(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}