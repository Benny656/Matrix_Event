"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/user-store";
import { getStudentDashboardAction } from "@/actions/registration";
import GlassNav from "@/components/shared/GlassNav";
import SignOutButton from "@/components/shared/signout-button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import type { Registration } from "@/types";

const statusColors: Record<string, string> = {
  REGISTERED: "bg-emerald-500/10 text-emerald-600",
  WAITLISTED: "bg-amber-500/10 text-amber-600",
  CANCELLED: "bg-red-500/10 text-red-500",
  UPCOMING: "bg-blue-500/10 text-blue-600",
  ONGOING: "bg-emerald-500/10 text-emerald-600",
  COMPLETED: "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 min-w-0">
      <p className="text-3xl font-bold text-[hsl(var(--accent))]">{value}</p>
      <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 truncate">{label}</p>
    </div>
  );
}

function RegistrationCard({
  reg,
  onClick,
}: {
  reg: Registration;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm sm:text-base leading-tight break-words line-clamp-1">
          {reg.eventTitle}
        </h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColors[reg.status] || "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]"}`}
        >
          {reg.status}
        </span>
      </div>
      <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium">
        {new Date(reg.eventDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

function EventCard({ event, onClick }: { event: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm sm:text-base leading-tight break-words line-clamp-1">
          {event.title}
        </h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColors[event.status] || "bg-blue-500/10 text-blue-600"}`}
        >
          {event.status}
        </span>
      </div>
      <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium">
        {new Date(event.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const { dashboardData, setDashboardData } = useStore();
  const [data, setData] = useState<{
    user: any;
    registrations: Registration[];
    upcomingEvents: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dashboardData) {
      setData(dashboardData);
      setLoading(false);
      return;
    }
    getStudentDashboardAction()
      .then((result) => {
        setData(result);
        setDashboardData(result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="h-10 w-64 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[hsl(var(--accent))] uppercase tracking-widest truncate">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold text-[hsl(var(--text-primary))] mt-1 truncate">
            {data?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-0.5 truncate">
            {data?.user?.rollNumber} · {data?.user?.department}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard
            label="My Registrations"
            value={data?.registrations.length ?? 0}
          />
          <StatCard
            label="Upcoming Events"
            value={data?.upcomingEvents.length ?? 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Registrations column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">My Registrations</h2>
              <button
                onClick={() => router.push("/student/registrations")}
                className="text-sm font-medium text-[hsl(var(--accent))] hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>
            {data?.registrations.length === 0 ? (
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
                  No registrations yet
                </p>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                  Browse events to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.registrations.map((reg, index) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RegistrationCard
                      reg={reg}
                      onClick={() => router.push(`/student/events/${reg.eventId}`)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Upcoming Events</h2>
              <button
                onClick={() => router.push("/student/events")}
                className="text-sm font-medium text-[hsl(var(--accent))] hover:underline cursor-pointer"
              >
                View all →
              </button>
            </div>
            {data?.upcomingEvents.length === 0 ? (
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
                <p className="text-3xl mb-2">📭</p>
                <p className="font-semibold text-[hsl(var(--text-primary))] text-base">No upcoming events</p>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Check back later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data?.upcomingEvents.map((event, index) => (
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
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-3 pt-2">
          <InteractiveHoverButton
            onClick={() => router.push("/student/events")}
            className="py-2.5 px-5"
          >
            Browse Events
          </InteractiveHoverButton>
          <button
            onClick={() => router.push("/student/registrations")}
            className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] text-sm font-medium px-4 py-2.5 rounded-full hover:bg-[hsl(var(--surface-2))] transition-all cursor-pointer"
          >
            My Registrations
          </button>
        </div>
      </div>
  );
}
