"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminEventsAction, getEventAttendanceAction } from "@/actions/admin";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { Sheet, FileText } from "lucide-react";

export default function AdminReportsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    byMethod: Record<string, number>;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    getAdminEventsAction()
      .then((res) => setEvents(res.events))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    <main className="min-h-screen bg-[#F5F7F8] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="mb-4 sm:mb-6 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#00666B] hover:text-[#051B1D] transition-colors"
        >
          ← Dashboard
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] mb-2">Reports</h1>
        <p className="text-xs sm:text-sm text-gray-700 font-medium mb-6 sm:mb-8">
          Select an event to view stats and export data
        </p>

        {/* Event Selector */}
        <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] mb-6">
          <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-2">
            Select Event
          </label>
          {loading ? (
            <div className="h-12 bg-gray-400 rounded-xl animate-pulse" />
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#F5F7F8] text-[#051B1D]"
            >
              <option value="" className="text-[#051B1D]">Choose an event...</option>
              {events.map((e) => (
                <option key={e.id} value={e.id} className="text-[#051B1D]">
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
            {/* Stats */}
            <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] mb-6">
              <h2 className="font-black text-[#051B1D] text-base sm:text-lg mb-3 sm:mb-4">Attendance Summary</h2>
              {loadingStats ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-400 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between bg-[#73FFFF]/30 border-2 border-black rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3">
                    <p className="text-xs sm:text-sm font-bold text-[#051B1D]">
                      Total Check-ins
                    </p>
                    <p className="text-xl sm:text-2xl font-black text-[#00666B]">
                      {stats.total}
                    </p>
                  </div>
                  {Object.entries(stats.byMethod).map(([method, count]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between bg-[#c8c8c8] border-2 border-black rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3"
                    >
                      <p className="text-xs sm:text-sm font-bold text-gray-800">
                        {method}
                      </p>
                      <p className="text-base sm:text-lg font-black text-[#051B1D]">{count}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-[#c8c8c8] border-2 border-black rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3">
                    <p className="text-xs sm:text-sm font-bold text-gray-800">
                      Registrations
                    </p>
                    <p className="text-base sm:text-lg font-black text-[#051B1D]">
                      {selectedEvent.registrationCount ?? 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-700 font-medium">
                  No attendance data yet
                </p>
              )}
            </div>

            {/* Export Buttons */}
            <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
              <h2 className="font-black text-[#051B1D] text-base sm:text-lg mb-3 sm:mb-4">Export Data</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExcelExport}
                  disabled={attendanceData.length === 0}
                  className="flex items-center gap-2 bg-[#16a34a] text-white font-black px-5 py-3 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sheet className="w-4 h-4" />
                  Export Excel
                </button>

                <button
                  onClick={handlePDFExport}
                  disabled={attendanceData.length === 0}
                  className="flex items-center gap-2 bg-[#dc2626] text-white font-black px-5 py-3 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
