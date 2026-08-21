"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVolunteerEventsAction } from "@/actions/attendance";

export default function VolunteerDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVolunteerEventsAction()
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <span className="inline-block bg-[#0d9488] text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
            Volunteer
          </span>
          <h1 className="text-3xl font-black text-black">Terminal</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage events and scan attendance
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => router.push("/volunteer/attendance")}
            className="bg-[#0d9488] text-white border-2 border-black rounded-2xl px-4 py-5 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-left"
          >
            <p className="text-2xl mb-2">📷</p>
            Scan Attendance
          </button>
          <button
            onClick={() => router.push("/volunteer/events")}
            className="bg-white text-black border-2 border-black rounded-2xl px-4 py-5 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-left"
          >
            <p className="text-2xl mb-2">📋</p>
            View Events
          </button>
        </div>

        <div>
          <h2 className="text-lg font-black text-black mb-4">
            Active & Upcoming Events
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white border-2 border-black rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-2">📭</p>
              <p className="font-bold text-black text-sm">No active events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/volunteer/events/${event.id}`)}
                  className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-black text-sm">
                      {event.title}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${event.status === "ONGOING" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-1">
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
    </main>
  );
}
