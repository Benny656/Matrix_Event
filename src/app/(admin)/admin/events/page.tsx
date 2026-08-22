"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminEventsAction } from "@/actions/admin";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-[#39A8AD]/20 text-[#00666B]",
  ONGOING: "bg-[#73FFFF] text-[#051B1D]",
  COMPLETED: "bg-gray-200 text-gray-700",
  CANCELLED: "bg-red-200 text-red-700",
};

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const res = await getAdminEventsAction();
      setEvents(res.events);
      setLastId(res.lastId);
      setHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!lastId) return;
    try {
      setLoadingMore(true);
      const res = await getAdminEventsAction(lastId);
      setEvents((prev) => [...prev, ...res.events]);
      setLastId(res.lastId);
      setHasMore(res.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[#D3D3D3] border-2 border-black rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="min-w-0">
            <button
              onClick={() => router.back()}
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#051B1D] mb-1 block"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] truncate">
              All Events
            </h1>
          </div>
          <button
            onClick={() => router.push("/admin/events/new")}
            className="bg-[#00666B] text-white border-2 border-black rounded-xl px-3.5 sm:px-5 py-2.5 sm:py-3 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all shrink-0"
          >
            + New Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-6 sm:p-8 text-center shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-bold text-[#051B1D] text-sm sm:text-base">
              No events yet
            </p>
            <button
              onClick={() => router.push("/admin/events/new")}
              className="mt-4 bg-[#00666B] text-white border-2 border-black rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              Create first event
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => router.push(`/admin/events/${event.id}`)}
                className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#051B1D] text-sm sm:text-base leading-tight break-words line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-700 font-medium mt-1 truncate">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · <span className="font-bold">{event.category}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-black ${statusColors[event.status] || "bg-gray-200 text-[#051B1D]"}`}
                    >
                      {event.status}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-800 font-bold">
                      {event.registrationCount ?? 0} registered
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full bg-[#D3D3D3] text-[#051B1D] border-2 border-black rounded-2xl py-3 sm:py-4 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
