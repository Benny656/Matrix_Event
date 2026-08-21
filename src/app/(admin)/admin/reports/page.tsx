"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminEventsAction } from "@/actions/admin";
import { getEventAttendanceAction } from "@/actions/admin";

export default function AdminReportsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<
    "registrations" | "attendance" | null
  >(null);
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
      return;
    }
    fetchStats();
  }, [selectedEventId]);

  async function fetchStats() {
    try {
      setLoadingStats(true);
      const data = await getEventAttendanceAction(selectedEventId);
      const byMethod: Record<string, number> = {};
      data.forEach((a: any) => {
        byMethod[a.checkInMethod] = (byMethod[a.checkInMethod] ?? 0) + 1;
      });
      setStats({ total: data.length, byMethod });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }

  async function handleExport(type: "registrations" | "attendance") {
    if (!selectedEventId) return;
    try {
      setDownloading(type);
      const res = await fetch(
        `/api/reports/export?type=${type}&eventId=${selectedEventId}`,
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${selectedEventId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-black text-black mb-2">Reports</h1>
        <p className="text-sm text-gray-500 font-medium mb-8">
          Select an event to view stats and export data
        </p>

        {/* Event Selector */}
        <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] mb-6">
          <label className="text-sm font-bold text-black block mb-2">
            Select Event
          </label>
          {loading ? (
            <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488] bg-white"
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
            {/* Stats */}
            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] mb-6">
              <h2 className="font-black text-black mb-4">Attendance Summary</h2>
              {loadingStats ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#f0faf8] border-2 border-black rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-black">
                      Total Check-ins
                    </p>
                    <p className="text-2xl font-black text-[#0d9488]">
                      {stats.total}
                    </p>
                  </div>
                  {Object.entries(stats.byMethod).map(([method, count]) => (
                    <div
                      key={method}
                      className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3"
                    >
                      <p className="text-sm font-bold text-gray-600">
                        {method}
                      </p>
                      <p className="text-lg font-black text-black">{count}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3">
                    <p className="text-sm font-bold text-gray-600">
                      Registrations
                    </p>
                    <p className="text-lg font-black text-black">
                      {selectedEvent.registrationCount ?? 0}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-medium">
                  No attendance data yet
                </p>
              )}
            </div>

            {/* Export Buttons */}
            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
              <h2 className="font-black text-black mb-4">Export Data</h2>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport("registrations")}
                  disabled={downloading !== null}
                  className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {downloading === "registrations"
                    ? "Downloading..."
                    : "⬇ Export Registrations CSV"}
                </button>
                <button
                  onClick={() => handleExport("attendance")}
                  disabled={downloading !== null}
                  className="w-full bg-white text-black border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {downloading === "attendance"
                    ? "Downloading..."
                    : "⬇ Export Attendance CSV"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
