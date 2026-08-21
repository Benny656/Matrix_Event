"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/user-store";
import { getStudentRegistrationsAction } from "@/actions/registration";
import type { Registration } from "@/types";

const statusColors: Record<string, string> = {
  REGISTERED: "bg-green-100 text-green-700",
  WAITLISTED: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-600",
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
      className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-black text-black leading-tight">
          {reg.eventTitle}
        </h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${statusColors[reg.status]}`}
        >
          {reg.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
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
      } = await getStudentRegistrationsAction(registrations.lastDoc as any);
      appendRegistrations(items, lastId as any, hasMore);
    } catch {
      setError("Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black text-black">My Registrations</h1>
          <p className="text-gray-500 text-sm mt-1">All your event sign-ups</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border-2 border-black rounded-2xl p-5 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : registrations.items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-bold text-black">No registrations yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Browse events and register
            </p>
            <button
              onClick={() => router.push("/student/events")}
              className="mt-4 bg-[#0d9488] text-white border-2 border-black rounded-xl px-6 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.items.map((reg) => (
              <RegistrationCard
                key={reg.id}
                reg={reg}
                onClick={() => router.push(`/student/events/${reg.eventId}`)}
              />
            ))}
          </div>
        )}

        {registrations.hasMore && !loading && (
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
