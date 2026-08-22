"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/user-store";
import { getStudentEventsAction } from "@/actions/event";
import type { Event } from "@/types";

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    UPCOMING: "bg-[#39A8AD]/20 text-[#00666B]",
    ONGOING: "bg-[#73FFFF] text-[#051B1D]",
    COMPLETED: "bg-gray-200 text-gray-700",
  };

  return (
    <div
      onClick={onClick}
      className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
        <span
          className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-black ${statusColors[event.status] || "bg-gray-200 text-gray-700"}`}
        >
          {event.status}
        </span>
        <span className="text-xs text-gray-800 font-bold truncate">
          {event.category}
        </span>
      </div>
      <h3 className="font-black text-[#051B1D] text-base sm:text-lg leading-tight mb-1 break-words">
        {event.title}
      </h3>
      <p className="text-gray-800 text-xs sm:text-sm mb-3 line-clamp-2 break-words font-medium">
        {event.description}
      </p>
      <div className="text-xs text-gray-700 font-bold">
        <span>
          {new Date(event.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
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
      } = await getStudentEventsAction(events.lastId as any);
      appendEvents(items, lastId as any, hasMore);
    } catch {
      setError("Failed to load more events");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7F8] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Navigation */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/student")}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors bg-[#F5F7F8] border-2 border-black rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => router.push("/student/registrations")}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors bg-[#F5F7F8] border-2 border-black rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              My Registrations
            </button>
          </div>
        </div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D]">Events</h1>
          <p className="text-gray-700 text-xs sm:text-sm mt-0.5 font-medium">
            Browse and register for upcoming events
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-5 h-36 animate-pulse"
              />
            ))}
          </div>
        ) : events.items.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-3xl sm:text-4xl mb-3">📭</p>
            <p className="font-bold text-[#051B1D] text-sm sm:text-base">No events yet</p>
            <p className="text-gray-700 text-xs sm:text-sm font-medium">Check back soon</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
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
              className="bg-[#F5F7F8] border-2 border-black rounded-xl px-6 py-3 font-bold text-[#051B1D] shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 text-xs sm:text-sm"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
