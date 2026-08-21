"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminEventsAction } from "@/actions/admin";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  ONGOING: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
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
      <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white border-2 border-black rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm font-bold text-gray-500 hover:text-black mb-1 block"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-black text-black">All Events</h1>
          </div>
          <button
            onClick={() => router.push("/admin/events/new")}
            className="bg-[#0d9488] text-white border-2 border-black rounded-xl px-5 py-3 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            + New
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[4px_4px_0px_#000]">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-bold text-black">No events yet</p>
            <button
              onClick={() => router.push("/admin/events/new")}
              className="mt-4 bg-[#0d9488] text-white border-2 border-black rounded-xl px-5 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
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
                className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-black leading-tight">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {event.venue}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[event.status]}`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
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
                className="w-full bg-white border-2 border-black rounded-2xl py-4 font-bold text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
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
