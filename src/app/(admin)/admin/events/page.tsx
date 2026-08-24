"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAdminEventsAction } from "@/actions/admin";
import { useEventStore } from "@/store/eventStore";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

function getStatusBadge(status: string) {
  switch (status) {
    case "ONGOING":
    case "REGISTERED":
      return "bg-emerald-500/10 text-emerald-600";
    case "UPCOMING":
    case "WAITLISTED":
      return "bg-amber-500/10 text-amber-600";
    case "CANCELLED":
      return "bg-red-500/10 text-red-500";
    case "COMPLETED":
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]";
    default:
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]";
  }
}

export default function AdminEventsPage() {
  const router = useRouter();

  // ── Zustand store ────────────────────────────────────────────
  const { events, lastId, hasMore, setInitialEvents, appendEvents } =
    useEventStore();

  // Derive a stable, ordered array from the store map (newest first)
  const eventList = Object.values(events).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // ── Local UI state ───────────────────────────────────────────
  const [loading, setLoading] = useState(eventList.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Data fetching ────────────────────────────────────────────
  useEffect(() => {
    // If the store already has data (e.g. navigated back) skip the re-fetch
    if (eventList.length > 0) return;

    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await getAdminEventsAction();
        setInitialEvents(res.events, res.lastId, res.hasMore);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMore() {
    if (!lastId) return;
    try {
      setLoadingMore(true);
      const res = await getAdminEventsAction(lastId);
      appendEvents(res.events, res.lastId, res.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header & New Event button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
            All Events
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Manage, monitor, and create departmental events
          </p>
        </div>
        <InteractiveHoverButton
          onClick={() => router.push("/admin/events/new")}
          className="self-start sm:self-auto shrink-0 py-2.5 px-5"
        >
          + New Event
        </InteractiveHoverButton>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-36 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : eventList.length === 0 ? (
        <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
          <p className="text-3xl mb-2">📭</p>
          <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
            No events yet
          </p>
          <InteractiveHoverButton
            onClick={() => router.push("/admin/events/new")}
            className="mt-4 py-2.5 px-5 inline-block"
          >
            Create first event
          </InteractiveHoverButton>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventList.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => router.push(`/admin/events/${event.id}`)}
                className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md hover:border-[hsl(var(--accent))]/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-[hsl(var(--text-primary))] text-base leading-tight break-words line-clamp-1 flex-1">
                      {event.title}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${getStatusBadge(event.status)}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <p className="text-xs text-[hsl(var(--text-tertiary))] mb-3">
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    &middot;{" "}
                    <span className="font-medium text-[hsl(var(--text-secondary))]">
                      {event.category}
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                  {/* Reads from the live Zustand cache — never shows stale server data */}
                  <span className="text-xs text-[hsl(var(--text-secondary))]">
                    {event.registrationCount ?? 0} registered
                  </span>
                  <span className="text-xs font-medium text-[hsl(var(--accent))]">
                    Manage →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-sm font-medium w-full py-3 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-all mt-6 disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
