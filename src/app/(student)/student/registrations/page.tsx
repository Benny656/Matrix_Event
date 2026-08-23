"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/user-store";
import { getStudentRegistrationsAction } from "@/actions/registration";
import Header from "@/components/layout/header";
import type { Registration } from "@/types";

const statusColors: Record<string, string> = {
  REGISTERED: "bg-emerald-500/10 text-emerald-600",
  WAITLISTED: "bg-amber-500/10 text-amber-600",
  CANCELLED: "bg-red-500/10 text-red-500",
  UPCOMING: "bg-blue-500/10 text-blue-600",
  ONGOING: "bg-emerald-500/10 text-emerald-600",
  COMPLETED: "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]",
};

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
      className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-[hsl(var(--text-primary))] leading-tight text-sm sm:text-base break-words line-clamp-1">
          {reg.eventTitle}
        </h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColors[reg.status] || "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]"}`}
        >
          {reg.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-[hsl(var(--text-tertiary))] font-medium">
        <span>{reg.eventCategory}</span>
        <span>
          {new Date(reg.eventDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

export default function StudentRegistrationsPage() {
  const router = useRouter();
  const { registrations, setRegistrations, appendRegistrations } = useStore();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (registrations.items.length > 0) return;
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      setLoading(true);
      const {
        registrations: items,
        lastId,
        hasMore,
      } = await getStudentRegistrationsAction();
      setRegistrations(items, lastId as any, hasMore);
    } catch {
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!registrations.hasMore || loadingMore) return;
    try {
      setLoadingMore(true);
      const {
        registrations: items,
        lastId,
        hasMore,
      } = await getStudentRegistrationsAction(registrations.lastId as any);
      appendRegistrations(items, lastId as any, hasMore);
    } catch {
      setError("Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">My Registrations</h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">All your event sign-ups</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : registrations.items.length === 0 ? (
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-12 text-center">
            <p className="text-3xl mb-3">📋</p>
            <h3 className="font-semibold text-[hsl(var(--text-primary))] text-base">No registrations yet</h3>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Browse events and register
            </p>
            <button
              onClick={() => router.push("/student/events")}
              className="mt-5 bg-[hsl(var(--accent))] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {registrations.items.map((reg, index) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RegistrationCard
                  key={reg.id}
                  reg={reg}
                  onClick={() => router.push(`/student/events/${reg.eventId}`)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {registrations.hasMore && !loading && (
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
