"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/user-store";
import { getStudentEventsAction } from "@/actions/event";
import type { Event } from "@/types";

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-500",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[event.status] || "bg-gray-100 text-gray-500"}`}
        >
          {event.status}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {event.category}
        </span>
      </div>
      <h3 className="font-black text-black text-lg leading-tight mb-1">
        {event.title}
      </h3>
      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
        {event.description}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
        <span>
          {new Date(event.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>{event.registrationCount} registered</span>
      </div>
    </div>
  );
}

export default function StudentEventsPage() {
  const router = useRouter();
  const { events, setEvents, appendEvents } = useStore();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (events.items.length > 0) return;
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { events: items, lastId, hasMore } = await getStudentEventsAction();
      setEvents(items, lastId as any, hasMore);
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!events.hasMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const {
        events: items,
        lastId,
        hasMore,
      } = await getStudentEventsAction(events.lastDoc as any);
      appendEvents(items, lastId as any, hasMore);
    } catch {
      setError("Failed to load more events");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black">Events</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse and register for upcoming events
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-black rounded-2xl p-5 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : events.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-bold text-black">No events yet</p>
            <p className="text-gray-500 text-sm">Check back soon</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => router.push(`/student/events/${event.id}`)}
              />
            ))}
          </div>
        )}

        {events.hasMore && !loading && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-white border-2 border-black rounded-xl px-6 py-3 font-bold text-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
