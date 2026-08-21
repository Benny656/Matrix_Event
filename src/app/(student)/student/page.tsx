"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentDashboardAction } from "@/actions/registration";
import type { Registration, Event } from "@/types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
      <p className="text-3xl font-black text-[#0d9488]">{value}</p>
      <p className="text-sm font-bold text-gray-500 mt-1">{label}</p>
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
    REGISTERED: "bg-green-100 text-green-700",
    WAITLISTED: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-black text-black text-sm leading-tight">
          {reg.eventTitle}
        </h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${statusColors[reg.status]}`}
        >
          {reg.status}
        </span>
      </div>
      <p className="text-xs text-gray-400 font-medium">
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
      className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-black text-black text-sm leading-tight">
          {event.title}
        </h3>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 shrink-0">
          {event.status}
        </span>
      </div>
      <p className="text-xs text-gray-400 font-medium">
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
      <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
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
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-sm font-bold text-[#0d9488] uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="text-3xl font-black text-black">
            {data?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.user?.rollNumber} · {data?.user?.department}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            label="My Registrations"
            value={data?.registrations.length ?? 0}
          />
          <StatCard
            label="Upcoming Events"
            value={data?.upcomingEvents.length ?? 0}
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-black">My Registrations</h2>
            <button
              onClick={() => router.push("/student/registrations")}
              className="text-sm font-bold text-[#0d9488] hover:underline"
            >
              View all →
            </button>
          </div>
          {data?.registrations.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-2">📋</p>
              <p className="font-bold text-black text-sm">
                No registrations yet
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Browse events to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-black">Upcoming Events</h2>
            <button
              onClick={() => router.push("/student/events")}
              className="text-sm font-bold text-[#0d9488] hover:underline"
            >
              View all →
            </button>
          </div>
          {data?.upcomingEvents.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-2">📭</p>
              <p className="font-bold text-black text-sm">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
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

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/student/events")}
            className="bg-[#0d9488] text-white border-2 border-black rounded-2xl px-4 py-4 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            Browse Events
          </button>
          <button
            onClick={() => router.push("/student/registrations")}
            className="bg-white text-black border-2 border-black rounded-2xl px-4 py-4 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            My Registrations
          </button>
        </div>
      </div>
    </main>
  );
}
