"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentDashboardAction } from "@/actions/registration";
import type { Registration } from "@/types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] min-w-0">
      <p className="text-2xl sm:text-3xl font-black text-[#00666B]">{value}</p>
      <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1 truncate">{label}</p>
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
  const statusColors: Record<string, string> = {
    REGISTERED: "bg-[#73FFFF] text-[#051B1D]",
    WAITLISTED: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-black text-[#051B1D] text-xs sm:text-sm leading-tight break-words line-clamp-1">
          {reg.eventTitle}
        </h3>
        <span
          className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${statusColors[reg.status] || "bg-gray-100 text-[#051B1D]"}`}
        >
          {reg.status}
        </span>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
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
      className="bg-white border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-black text-[#051B1D] text-xs sm:text-sm leading-tight break-words line-clamp-1">
          {event.title}
        </h3>
        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full bg-[#73FFFF] text-[#051B1D] shrink-0 border border-black">
          {event.status}
        </span>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
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
  const [data, setData] = useState<{
    user: any;
    registrations: Registration[];
    upcomingEvents: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboardAction()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F7F8] px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white border-2 border-black rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white border-2 border-black rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F7F8] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm font-bold text-[#00666B] uppercase tracking-widest truncate">
            Welcome back
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] truncate">
            {data?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">
            {data?.user?.rollNumber} · {data?.user?.department}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard
            label="My Registrations"
            value={data?.registrations.length ?? 0}
          />
          <StatCard
            label="Upcoming Events"
            value={data?.upcomingEvents.length ?? 0}
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-black text-[#051B1D]">My Registrations</h2>
            <button
              onClick={() => router.push("/student/registrations")}
              className="text-xs sm:text-sm font-bold text-[#00666B] hover:underline"
            >
              View all →
            </button>
          </div>
          {data?.registrations.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-1">📋</p>
              <p className="font-bold text-[#051B1D] text-sm">
                No registrations yet
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Browse events to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {data?.registrations.map((reg) => (
                <RegistrationCard
                  key={reg.id}
                  reg={reg}
                  onClick={() => router.push(`/student/events/${reg.eventId}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-black text-[#051B1D]">Upcoming Events</h2>
            <button
              onClick={() => router.push("/student/events")}
              className="text-xs sm:text-sm font-bold text-[#00666B] hover:underline"
            >
              View all →
            </button>
          </div>
          {data?.upcomingEvents.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-1">📭</p>
              <p className="font-bold text-[#051B1D] text-sm">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {data?.upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => router.push(`/student/events/${event.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={() => router.push("/student/events")}
            className="bg-[#00666B] text-white border-2 border-black rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3.5 sm:py-4 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center"
          >
            Browse Events
          </button>
          <button
            onClick={() => router.push("/student/registrations")}
            className="bg-white text-[#051B1D] border-2 border-black rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3.5 sm:py-4 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center"
          >
            My Registrations
          </button>
        </div>
      </div>
    </main>
  );
}
