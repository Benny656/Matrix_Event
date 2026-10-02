"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminEventsAction, getEventAttendanceAction, getAllEventRegistrationsAction } from "@/actions/admin";
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
  const [registrationData, setRegistrationData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"attendance" | "registration">("attendance");

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
      const [attData, regData] = await Promise.all([
        getEventAttendanceAction(selectedEventId),
        getAllEventRegistrationsAction(selectedEventId)
      ]);
      setAttendanceData(attData);
      setRegistrationData(regData);

      const byMethod: Record<string, number> = {};
      attData.forEach((a: any) => {
        const method = a.checkInMethod || a.method || "SCANNED";
        byMethod[method] = (byMethod[method] ?? 0) + 1;
      });
      setStats({ total: attData.length, byMethod });
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

  function getFormattedRegistrationRows() {
    return registrationData.map((r: any) => ({
      "Student Name": r.studentName ?? "",
      "Roll Number": r.rollNumber ?? "",
      "Year": r.yearOfStudy ?? "",
    }));
  }

  function handleExcelExport() {
    if (!selectedEvent) return;
    const isAttendance = activeTab === "attendance";
    const data = isAttendance ? attendanceData : registrationData;
    if (data.length === 0) return;

    const rows = isAttendance ? getFormattedAttendanceRows() : getFormattedRegistrationRows();
    const filename = `${selectedEvent.title}-${isAttendance ? 'attendance' : 'registration'}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    exportToExcel(rows, filename);
  }

  function handlePDFExport() {
    if (!selectedEvent) return;
    const isAttendance = activeTab === "attendance";
    const data = isAttendance ? attendanceData : registrationData;
    if (data.length === 0) return;

    const formatted = isAttendance ? getFormattedAttendanceRows() : getFormattedRegistrationRows();
    const title = `${selectedEvent.title} - ${isAttendance ? 'Attendance' : 'Registration'} Report`;
    
    const columns = isAttendance 
      ? ["Student Name", "Roll Number", "Year", "Check In Time"]
      : ["Student Name", "Roll Number", "Year"];

    const rows = formatted.map((r: any) => {
      return columns.map(col => r[col] || "");
    });

    const filename = `${selectedEvent.title}-${isAttendance ? 'attendance' : 'registration'}`
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
              {/* Tabs */}
              <div className="flex items-center gap-4 mb-6 border-b border-[hsl(var(--border))]">
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`pb-3 text-sm font-medium transition-colors ${
                    activeTab === "attendance"
                      ? "text-[hsl(var(--text-primary))] border-b-2 border-[hsl(var(--accent))]"
                      : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveTab("registration")}
                  className={`pb-3 text-sm font-medium transition-colors ${
                    activeTab === "registration"
                      ? "text-[hsl(var(--text-primary))] border-b-2 border-[hsl(var(--accent))]"
                      : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  }`}
                >
                  Registration
                </button>
              </div>

              {/* Stats Summary */}
              {activeTab === "attendance" ? (
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
              ) : (
                <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 mb-6">
                  <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">
                    Registration Summary
                  </h2>
                  {loadingStats ? (
                    <div className="space-y-2">
                      <div className="h-12 bg-[hsl(var(--surface-2))] rounded-xl animate-pulse" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-[hsl(var(--accent-subtle))] rounded-xl px-4 py-3 border border-[hsl(var(--border))]">
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">
                          Total Registrations
                        </p>
                        <p className="text-3xl font-bold text-[hsl(var(--accent))]">
                          {registrationData.length}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Export Buttons */}
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">
                  Export Data
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExcelExport}
                    disabled={activeTab === "attendance" ? attendanceData.length === 0 : registrationData.length === 0}
                    className="flex items-center gap-2 bg-[#16a34a] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Sheet className="w-4 h-4" />
                    Export Excel
                  </button>

                  <button
                    onClick={handlePDFExport}
                    disabled={activeTab === "attendance" ? attendanceData.length === 0 : registrationData.length === 0}
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
