"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVolunteerEventsAction } from "@/actions/attendance";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-[#39A8AD]/20 text-[#00666B]",
  ONGOING: "bg-[#73FFFF] text-[#051B1D]",
  COMPLETED: "bg-gray-200 text-gray-700",
  ARCHIVED: "bg-yellow-200 text-yellow-900",
};

export default function VolunteerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getVolunteerEventsAction()
      .then((res: any) => setEvents(res))
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="h-8 w-40 bg-gray-400 rounded-xl animate-pulse mb-6" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[#D3D3D3] border-2 border-black rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] mb-6">My Events</h1>

        {error && (
          <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-6 sm:p-8 text-center shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-bold text-[#051B1D] text-sm sm:text-base">No events assigned yet</p>
            <p className="text-gray-700 text-xs mt-1 font-medium">Check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/volunteer/events/${event.id}`)}
                className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-[#051B1D] leading-tight text-sm sm:text-base break-words">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-700 font-bold mt-1 truncate">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-black ${statusColors[event.status] || "bg-gray-200 text-[#051B1D]"}`}
                    >
                      {event.status}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-800 font-bold">
                      {event.sessions?.length ?? 0} session
                      {event.sessions?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-400 flex items-center justify-between">
                  <span className="text-xs text-gray-800 font-bold">
                    {event.category}
                  </span>
                  <span className="text-xs font-bold text-[#00666B]">
                    View details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
