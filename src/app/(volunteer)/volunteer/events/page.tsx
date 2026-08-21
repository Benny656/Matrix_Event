"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVolunteerEventsAction } from "@/actions/attendance";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-yellow-100 text-yellow-700",
};

export default function VolunteerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getVolunteerEventsAction()
      .then(setEvents)
      .catch(() => setError("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse mb-6" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white border-2 border-black rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-black text-black mb-6">My Events</h1>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[4px_4px_0px_#000]">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-bold text-black">No events assigned yet</p>
            <p className="text-gray-400 text-sm mt-1">Check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/volunteer/events/${event.id}`)}
                className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-black text-black leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {event.venue}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[event.status]}`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {event.sessions?.length ?? 0} session
                      {event.sessions?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {event.category}
                  </span>
                  <span className="text-xs font-bold text-[#0d9488]">
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
