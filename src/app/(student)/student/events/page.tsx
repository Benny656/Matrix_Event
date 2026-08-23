"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/user-store";
import { getStudentEventsAction } from "@/actions/event";
import Header from "@/components/layout/header";
import type { Event } from "@/types";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-500/10 text-blue-600",
  ONGOING: "bg-emerald-500/10 text-emerald-600",
  COMPLETED: "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]",
};

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[event.status] || "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]"}`}
          >
            {event.status}
          </span>
          <span className="text-xs font-medium text-[hsl(var(--text-tertiary))] truncate">
            {event.category}
          </span>
        </div>
        <h3 className="text-base font-semibold text-[hsl(var(--text-primary))] leading-tight mb-1 break-words line-clamp-1">
          {event.title}
        </h3>
        <p className="text-sm text-[hsl(var(--text-secondary))] mb-4 line-clamp-2 break-words">
          {event.description}
        </p>
      </div>
      <div className="text-xs text-[hsl(var(--text-tertiary))] font-medium">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">Events</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Browse and register for upcoming events
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-44 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : events.items.length === 0 ? (
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-12 text-center">
            <p className="text-3xl mb-3">📭</p>
            <h3 className="font-semibold text-[hsl(var(--text-primary))] text-base">No events yet</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Check back soon for upcoming events</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.items.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EventCard
                  event={event}
                  onClick={() => router.push(`/student/events/${event.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {events.hasMore && !loading && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-all text-[hsl(var(--text-primary))] disabled:opacity-50 cursor-pointer"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
  );
}
