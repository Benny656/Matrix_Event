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

  if (!eventId) {
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
  }

  try {
    let rows: Record<string, string>[] = []
    let filename = `attendance-${eventId}.csv`

    const snap = await adminDb
      .collection("attendances")
      .where("eventId", "==", eventId)
      .orderBy("checkInTime", "asc")
      .get()

    rows = snap.docs.map((d) => {
      const data = d.data()
      const checkInDateObj = data.checkInTime ? new Date(data.checkInTime) : null
      const formattedCheckIn = checkInDateObj
        ? checkInDateObj.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : ""

      return {
        Name: data.studentName ?? "",
        "Roll Number": data.rollNumber ?? "",
        Department: data.department ?? "",
        "Year of Study": data.yearOfStudy ?? "",
        "Program Type": data.programType ?? "",
        "Check-in Time": formattedCheckIn,
        Session: data.sessionId ?? "",
      }
    })

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