"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventByIdAction } from "@/actions/event";
import { getSessionAttendanceAction } from "@/actions/attendance";
import type { Event, Attendance } from "@/types";

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
      <main className="min-h-screen bg-[#F5F7F8] px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-gray-400 rounded-xl animate-pulse" />
          <div className="h-48 bg-[#F5F7F8] border-2 border-black rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-4">
        <p className="font-bold text-[#051B1D]">Event not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7F8] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Top Navigation */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/volunteer")}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors bg-[#F5F7F8] border-2 border-black rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => router.push("/volunteer/events")}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors bg-[#F5F7F8] border-2 border-black rounded-xl px-3 py-1.5 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            >
              All Events
            </button>
          </div>
        </div>

        <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] mb-4">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h1 className="text-xl sm:text-2xl font-black text-[#051B1D] leading-tight break-words">
              {event.title}
            </h1>
            <span
              className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-black shrink-0 ${event.status === "ONGOING" ? "bg-[#73FFFF] text-[#051B1D]" : "bg-[#39A8AD]/20 text-[#00666B]"}`}
            >
              {event.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
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
                className="bg-[#c8c8c8] border-2 border-black rounded-xl p-2.5 sm:p-3 min-w-0"
              >
                <p className="text-[10px] sm:text-xs text-gray-700 font-bold truncate">{label}</p>
                <p className="text-xs sm:text-sm font-black text-[#051B1D] truncate">{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              router.push(`/volunteer/attendance?eventId=${event.id}`)
            }
            className="w-full bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            📷 Open Scanner for this Event
          </button>
        </div>

        {event.sessions && event.sessions.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#051B1D] mb-3 sm:mb-4">
              Sessions & Attendance
            </h2>
            <div className="space-y-3">
              {event.sessions.map((session) => {
                const count = attendanceMap[session.id]?.length ?? 0;
                return (
                  <div
                    key={session.id}
                    className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-[#051B1D] text-sm truncate">
                          {session.title}
                        </h3>
                        <p className="text-xs text-gray-700 font-bold mt-0.5">
                          {session.startTime}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl sm:text-2xl font-black text-[#00666B]">
                          {count}
                        </p>
                        <p className="text-[10px] text-gray-700 font-bold">checked in</p>
                      </div>
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
