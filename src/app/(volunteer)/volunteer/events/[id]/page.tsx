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

      if (ev.sessions?.length > 0) {
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
      <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-48 bg-white border-2 border-black rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#f0faf8] flex items-center justify-center">
        <p className="font-bold text-black">Event not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] mb-4">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h1 className="text-2xl font-black text-black">{event.title}</h1>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${event.status === "ONGOING" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
            >
              {event.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
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
              { label: "Coordinator", value: event.coordinatorName },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-[#f0faf8] border-2 border-black rounded-xl p-3"
              >
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm font-bold text-black">{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              router.push(`/volunteer/attendance?eventId=${event.id}`)
            }
            className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
          >
            📷 Open Scanner for this Event
          </button>
        </div>

        {event.sessions?.length > 0 && (
          <div>
            <h2 className="text-lg font-black text-black mb-4">
              Sessions & Attendance
            </h2>
            <div className="space-y-3">
              {event.sessions.map((session) => {
                const count = attendanceMap[session.id]?.length ?? 0;
                return (
                  <div
                    key={session.id}
                    className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-black text-sm">
                          {session.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(session.startTime).toLocaleTimeString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#0d9488]">
                          {count}
                        </p>
                        <p className="text-xs text-gray-400">checked in</p>
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
