"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminEventsAction, getEventAttendanceAction } from "@/actions/admin";
import { useEventStore } from "@/store/eventStore";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { Sheet, FileText } from "lucide-react";
import Header from "@/components/layout/header";

export default function AdminReportsPage() {
  const router = useRouter();
  const { events: cachedEvents, setInitialEvents } = useEventStore();
  const cachedEventsList = Object.values(cachedEvents);

  const [events, setEvents] = useState<any[]>(cachedEventsList);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(cachedEventsList.length === 0);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byMethod: Record<string, number>;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (cachedEventsList.length > 0) {
      setEvents(cachedEventsList);
      setLoading(false);
    }

    getAdminEventsAction()
      .then((res) => {
        setEvents(res.events);
        setInitialEvents(res.events, res.lastId, res.hasMore);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedEventId) {
      setStats(null);
      setAttendanceData([]);
      return;
    }
    fetchStats();
  }, [selectedEventId]);

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const data = await getEventAttendanceAction(selectedEventId);
      setAttendanceData(data);
      const byMethod: Record<string, number> = {};
      data.forEach((a: any) => {
        const method = a.checkInMethod || a.method || "SCANNED";
        byMethod[method] = (byMethod[method] ?? 0) + 1;
      });
      setStats({ total: data.length, byMethod });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  function getFormattedAttendanceRows() {
    return attendanceData.map((a: any) => {
      const checkInRaw = a.checkInTime || a.createdAt || a.timestamp;
      const formattedCheckIn = checkInRaw
        ? new Date(checkInRaw).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : "";

      return {
        "Student Name": a.studentName ?? "",
        "Roll Number": a.rollNumber ?? "",
        "Year": a.yearOfStudy ?? "",
        "Check In Time": formattedCheckIn,
      };
    });
  }

  function handleExcelExport() {
    if (!selectedEvent || attendanceData.length === 0) return;
    const rows = getFormattedAttendanceRows();
    const filename = `${selectedEvent.title}-attendance`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    exportToExcel(rows, filename);
  }

  function handlePDFExport() {
    if (!selectedEvent || attendanceData.length === 0) return;
    const formatted = getFormattedAttendanceRows();
    const title = `${selectedEvent.title} - Attendance Report`;
    const columns = ["Student Name", "Roll Number", "Year", "Check In Time"];
    const rows = formatted.map((r) => [
      r["Student Name"],
      r["Roll Number"],
      r["Year"],
      r["Check In Time"],
    ]);
    const filename = `${selectedEvent.title}-attendance`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    exportToPDF(title, columns, rows, filename);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
              Reports & Exports
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Select an event to view check-in statistics and export attendance datasets
            </p>
          </div>

          {/* Event Selector */}
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 mb-6">
            <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
              Select Event
            </label>
            {loading ? (
              <div className="h-11 bg-[hsl(var(--surface-2))] rounded-xl animate-pulse" />
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full"
              >
                <option value="">Choose an event...</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} —{" "}
                    {new Date(e.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedEvent && (
            <>
              {/* Stats Summary */}
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 mb-6">
                <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">
                  Attendance Summary
                </h2>
                {loadingStats ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-[hsl(var(--surface-2))] rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : stats ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-[hsl(var(--accent-subtle))] rounded-xl px-4 py-3 border border-[hsl(var(--border))]">
                      <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                        Total Check-ins
                      </p>
                      <p className="text-3xl font-bold text-[hsl(var(--accent))]">
                        {stats.total}
                      </p>
                    </div>
                    {Object.entries(stats.byMethod).map(([method, count]) => (
                      <div
                        key={method}
                        className="flex items-center justify-between bg-[hsl(var(--surface))] rounded-xl px-4 py-3 border border-[hsl(var(--border))]"
                      >
                        <p className="text-sm text-[hsl(var(--text-secondary))]">
                          {method}
                        </p>
                        <p className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                          {count}
                        </p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-[hsl(var(--surface))] rounded-xl px-4 py-3 border border-[hsl(var(--border))]"
                    >
                      <p className="text-sm text-[hsl(var(--text-secondary))]">
                        Total Registrations
                      </p>
                      <p className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                        {selectedEvent.registrationCount ?? 0}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    No attendance data yet
                  </p>
                )}
              </div>

              {/* Export Buttons */}
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">
                  Export Data
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExcelExport}
                    disabled={attendanceData.length === 0}
                    className="flex items-center gap-2 bg-[#16a34a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Sheet className="w-4 h-4" />
                    Export Excel
                  </button>

                  <button
                    onClick={handlePDFExport}
                    disabled={attendanceData.length === 0}
                    className="flex items-center gap-2 bg-[#dc2626] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
  );
}
