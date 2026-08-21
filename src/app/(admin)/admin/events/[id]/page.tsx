"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getEventRegistrationsAction,
  updateRegistrationStatusAction,
  getEventAttendanceAction,
  updateEventAction,
  deleteEventAction,
} from "@/actions/admin";

type Tab = "registrations" | "attendance" | "settings";

const statusColors: Record<string, string> = {
  REGISTERED: "bg-green-100 text-green-700",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function AdminEventDetailPage() {
  const router = useRouter();
  const { id: eventId } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("registrations");

  // Registrations
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regLastId, setRegLastId] = useState<string | null>(null);
  const [regHasMore, setRegHasMore] = useState(false);
  const [loadingReg, setLoadingReg] = useState(true);
  const [loadingMoreReg, setLoadingMoreReg] = useState(false);

  // Attendance
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [attLoaded, setAttLoaded] = useState(false);

  // Settings
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [eventStatus, setEventStatus] = useState("");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      setLoadingReg(true);
      const res = await getEventRegistrationsAction(eventId);
      setRegistrations(res.registrations);
      setRegLastId(res.lastId);
      setRegHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReg(false);
    }
  }

  async function loadMoreRegistrations() {
    if (!regLastId) return;
    try {
      setLoadingMoreReg(true);
      const res = await getEventRegistrationsAction(eventId, regLastId);
      setRegistrations((prev) => [...prev, ...res.registrations]);
      setRegLastId(res.lastId);
      setRegHasMore(res.hasMore);
    } finally {
      setLoadingMoreReg(false);
    }
  }

  async function handleTabChange(t: Tab) {
    setTab(t);
    if (t === "attendance" && !attLoaded) {
      try {
        setLoadingAtt(true);
        const data = await getEventAttendanceAction(eventId);
        setAttendance(data);
        setAttLoaded(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAtt(false);
      }
    }
  }

  async function toggleRegStatus(regId: string, current: string) {
    const next = current === "REGISTERED" ? "CANCELLED" : "REGISTERED";
    await updateRegistrationStatusAction(regId, next as any);
    setRegistrations((prev) =>
      prev.map((r) => (r.id === regId ? { ...r, status: next } : r)),
    );
  }

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await deleteEventAction(eventId);
      router.push("/admin/events");
    } catch {
      setDeleting(false);
    }
  }

  async function handleStatusUpdate(status: string) {
    try {
      setStatusUpdating(true);
      await updateEventAction(eventId, { status });
      setEventStatus(status);
    } finally {
      setStatusUpdating(false);
    }
  }

  function exportCSV() {
    const rows = attendance.map((a) => ({
      Name: a.studentName,
      Roll: a.rollNumber,
      Department: a.department,
      Year: a.yearOfStudy,
      Program: a.programType,
      Session: a.sessionId,
      Method: a.method,
      Time: new Date(a.timestamp).toLocaleString("en-IN"),
    }));
    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${(r as any)[h] ?? ""}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-black text-black mb-6">Event Detail</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-black pb-2">
          {(["registrations", "attendance", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-2 rounded-xl font-bold text-sm border-2 border-black transition-all capitalize ${
                tab === t
                  ? "bg-[#0d9488] text-white shadow-[2px_2px_0px_#000]"
                  : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Registrations Tab ── */}
        {tab === "registrations" && (
          <div>
            <p className="text-sm text-gray-500 font-medium mb-4">
              {registrations.length} loaded
            </p>
            {loadingReg ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-white border-2 border-black rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : registrations.length === 0 ? (
              <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[4px_4px_0px_#000]">
                <p className="text-2xl mb-2">📋</p>
                <p className="font-bold text-black">No registrations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-white border-2 border-black rounded-2xl px-5 py-4 shadow-[3px_3px_0px_#000] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-black text-black text-sm">
                        {reg.studentName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {reg.rollNumber} · {reg.department}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[reg.status]}`}
                      >
                        {reg.status}
                      </span>
                      <button
                        onClick={() => toggleRegStatus(reg.id, reg.status)}
                        className="text-xs font-bold text-gray-500 border border-gray-300 rounded-lg px-2 py-1 hover:border-black transition-colors"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                ))}

                {regHasMore && (
                  <button
                    onClick={loadMoreRegistrations}
                    disabled={loadingMoreReg}
                    className="w-full bg-white border-2 border-black rounded-2xl py-4 font-bold text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
                  >
                    {loadingMoreReg ? "Loading..." : "Load more"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Attendance Tab ── */}
        {tab === "attendance" && (
          <div>
            {loadingAtt ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-white border-2 border-black rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 font-medium">
                    {attendance.length} records
                  </p>
                  {attendance.length > 0 && (
                    <button
                      onClick={exportCSV}
                      className="bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-2 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                      Export CSV
                    </button>
                  )}
                </div>
                {attendance.length === 0 ? (
                  <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[4px_4px_0px_#000]">
                    <p className="text-2xl mb-2">📊</p>
                    <p className="font-bold text-black">
                      No attendance recorded yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attendance.map((a) => (
                      <div
                        key={a.id}
                        className="bg-white border-2 border-black rounded-xl px-4 py-3 shadow-[2px_2px_0px_#000] flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-black">
                            {a.studentName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {a.rollNumber} · {a.department}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-500">
                            {a.method}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(a.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Settings Tab ── */}
        {tab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
              <h3 className="font-black text-black mb-4">Update Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={statusUpdating}
                    className="border-2 border-black rounded-xl px-4 py-3 font-bold text-sm hover:bg-[#0d9488] hover:text-white transition-all disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
              {eventStatus && (
                <p className="text-xs text-green-600 font-bold mt-3">
                  Status updated to {eventStatus}
                </p>
              )}
            </div>

            <div className="bg-white border-2 border-red-400 rounded-2xl p-5 shadow-[4px_4px_0px_#f87171]">
              <h3 className="font-black text-red-600 mb-2">Danger Zone</h3>
              <p className="text-xs text-gray-500 mb-4">
                Deleting an event is permanent. Registrations and attendance
                records are not automatically removed.
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-500 text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
