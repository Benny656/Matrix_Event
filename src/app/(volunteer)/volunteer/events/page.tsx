"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getVolunteerEventsAction } from "@/actions/attendance";
import Header from "@/components/layout/header";

function getStatusBadge(status: string) {
  switch (status) {
    case "ONGOING":
      return "bg-emerald-500/10 text-emerald-600";
    case "UPCOMING":
      return "bg-blue-500/10 text-blue-600";
    case "COMPLETED":
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]";
    default:
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]";
  }
}

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
            My Events
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Events assigned to you for attendance management
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
                className="h-36 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
              No events assigned yet
            </p>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Check back later when events are assigned to your volunteer terminal
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/volunteer/events/${event.id}`)}
                className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md hover:border-[hsl(var(--accent))]/50 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-[hsl(var(--text-primary))] leading-tight text-base break-words flex-1">
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
                    })}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[hsl(var(--text-secondary))]">
                      {event.category}
                    </span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">·</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">
                      {event.sessions?.length ?? 0} session
                      {event.sessions?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[hsl(var(--accent))]">
                    View details →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}
