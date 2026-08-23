"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventByIdAction } from "@/actions/event";
import { getSessionAttendanceAction } from "@/actions/attendance";
import type { Event, Attendance } from "@/types";
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

export default function VolunteerEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, Attendance[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      const ev = await getEventByIdAction(id);
      setEvent(ev);

      if (ev.sessions && ev.sessions.length > 0) {
        const results = await Promise.all(
          ev.sessions.map((s) => getSessionAttendanceAction(s.id)),
        );
        const map: Record<string, Attendance[]> = {};
        ev.sessions.forEach((s, i) => {
          map[s.id] = results[i];
        });
        setAttendanceMap(map);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <Header role="volunteer" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="h-8 w-32 bg-[hsl(var(--surface-2))] rounded-xl animate-pulse" />
          <div className="h-64 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <Header role="volunteer" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">
              Event not found
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <Header role="volunteer" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Main card */}
        <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-[hsl(var(--accent))] uppercase tracking-widest block mb-1">
                Event Detail
              </span>
              <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] leading-tight break-words">
                {event.title}
              </h1>
            </div>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${getStatusBadge(event.status)}`}
            >
              {event.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
            {[
              {
                label: "Date",
                value: new Date(event.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
              { label: "Registered", value: event.registrationCount },
              { label: "Category", value: event.category },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[hsl(var(--surface))] rounded-xl px-4 py-3 border border-[hsl(var(--border))] min-w-0"
              >
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{label}</p>
                <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5 truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              router.push(`/volunteer/attendance?eventId=${event.id}`)
            }
            className="w-full bg-[hsl(var(--accent))] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span>📷</span>
            <span>Open Scanner for this Event</span>
          </button>
        </div>

        {/* Sessions section */}
        {event.sessions && event.sessions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">
              Sessions & Attendance
            </h2>
            <div className="space-y-3">
              {event.sessions.map((session) => {
                const count = attendanceMap[session.id]?.length ?? 0;
                return (
                  <div
                    key={session.id}
                    className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm truncate">
                        {session.title}
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                        {session.startTime}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-[hsl(var(--accent))] leading-none">
                        {count}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                        checked in
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
