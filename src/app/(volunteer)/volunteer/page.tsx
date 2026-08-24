"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVolunteerEventsAction } from "@/actions/attendance";
import { useStore } from "@/store/user-store";
import SignOutButton from "@/components/shared/signout-button";

export default function VolunteerDashboard() {
  const router = useRouter();
  const { volunteerEvents, setVolunteerEvents } = useStore();
  const [events, setEvents] = useState<any[]>(volunteerEvents ?? []);
  const [loading, setLoading] = useState(!volunteerEvents);

  useEffect(() => {
    if (volunteerEvents) {
      setEvents(volunteerEvents);
      setLoading(false);
      return;
    }

    getVolunteerEventsAction()
      .then((res) => {
        setEvents(res);
        setVolunteerEvents(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [volunteerEvents, setVolunteerEvents]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-sm font-medium text-[hsl(var(--accent))] uppercase tracking-widest block mb-1">
            Volunteer Terminal
          </span>
          <h1 className="text-3xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
            Manage active events and scan participant attendance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => router.push("/volunteer/attendance")}
            className="glass rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--accent))] transition-all text-left group hover:shadow-lg"
          >
            <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">📷</p>
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">Scan Attendance</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">QR scanner & manual roll entry</p>
          </button>
          <button
            onClick={() => router.push("/volunteer/events")}
            className="glass rounded-2xl border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--accent))] transition-all text-left group hover:shadow-lg"
          >
            <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">📋</p>
            <p className="text-base font-semibold text-[hsl(var(--text-primary))]">View Events</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">Browse assigned events & status</p>
          </button>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[hsl(var(--text-primary))] mb-3 sm:mb-4">
            Active & Upcoming Events
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 glass rounded-2xl border border-[hsl(var(--border))] animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-semibold text-[hsl(var(--text-primary))] text-sm">No active events</p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">Check back when upcoming events are assigned</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/volunteer/events/${event.id}`)}
                  className="glass rounded-2xl border border-[hsl(var(--border))] p-4 hover:border-[hsl(var(--accent))] transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm truncate">
                      {event.title}
                    </h3>
                    <span
                      className={`text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        event.status === "ONGOING"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-[hsl(var(--text-secondary))] font-medium mt-1 truncate">
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
