"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVolunteerEventsAction } from "@/actions/attendance";
import SignOutButton from "@/components/shared/signout-button";

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
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-block bg-[#00666B] text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest border border-black">
              Volunteer
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D]">Terminal</h1>
            <p className="text-gray-700 text-xs sm:text-sm mt-1 font-medium">
              Manage events and scan attendance
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => router.push("/volunteer/attendance")}
            className="bg-[#00666B] text-white border-2 border-black rounded-2xl px-4 py-4 sm:py-5 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-left"
          >
            <p className="text-xl sm:text-2xl mb-2">📷</p>
            Scan Attendance
          </button>
          <button
            onClick={() => router.push("/volunteer/events")}
            className="bg-[#D3D3D3] text-[#051B1D] border-2 border-black rounded-2xl px-4 py-4 sm:py-5 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-left"
          >
            <p className="text-xl sm:text-2xl mb-2">📋</p>
            View Events
          </button>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-black text-[#051B1D] mb-3 sm:mb-4">
            Active & Upcoming Events
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-[#D3D3D3] border-2 border-black rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-2">📭</p>
              <p className="font-bold text-[#051B1D] text-sm">No active events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/volunteer/events/${event.id}`)}
                  className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-[#051B1D] text-sm truncate">
                      {event.title}
                    </h3>
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full border border-black shrink-0 ${event.status === "ONGOING" ? "bg-[#73FFFF] text-[#051B1D]" : "bg-[#39A8AD]/20 text-[#00666B]"}`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 font-bold mt-1 truncate">
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
