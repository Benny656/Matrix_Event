"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/user-store";
import { getStudentRegistrationsAction } from "@/actions/registration";
import type { Registration } from "@/types";

const statusColors: Record<string, string> = {
  REGISTERED: "bg-[#73FFFF] text-[#051B1D]",
  WAITLISTED: "bg-yellow-200 text-yellow-900",
  CANCELLED: "bg-red-200 text-red-700",
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
      className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-black text-[#051B1D] leading-tight text-sm sm:text-base break-words">
          {reg.eventTitle}
        </h3>
        <span
          className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shrink-0 border border-black ${statusColors[reg.status] || "bg-gray-200 text-[#051B1D]"}`}
        >
          {reg.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-700 font-bold">
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
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D]">My Registrations</h1>
          <p className="text-gray-700 text-xs sm:text-sm mt-0.5 font-medium">All your event sign-ups</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3 sm:space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-5 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : registrations.items.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-3xl sm:text-4xl mb-3">📋</p>
            <p className="font-bold text-[#051B1D] text-sm sm:text-base">No registrations yet</p>
            <p className="text-gray-700 text-xs sm:text-sm mt-1 font-medium">
              Browse events and register
            </p>
            <button
              onClick={() => router.push("/student/events")}
              className="mt-4 bg-[#00666B] text-white border-2 border-black rounded-xl px-6 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-xs sm:text-sm"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
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
              className="bg-[#D3D3D3] border-2 border-black rounded-xl px-6 py-3 font-bold text-[#051B1D] shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 text-xs sm:text-sm"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
