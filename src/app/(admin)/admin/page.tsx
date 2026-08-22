"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminDashboardAction } from "@/actions/admin";
import SignOutButton from "@/components/shared/signout-button";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] min-w-0">
      <p className="text-2xl sm:text-3xl font-black text-[#00666B]">{value}</p>
      <p className="text-xs sm:text-sm font-bold text-[#051B1D] mt-1 truncate">{label}</p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-700 font-medium mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<{
    activeEvents: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardAction()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F7F8] px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-gray-400 rounded-xl animate-pulse" />
          <div className="h-24 bg-[#F5F7F8] border-2 border-black rounded-2xl animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7F8] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[#00666B] uppercase tracking-widest truncate">
              Matrix Admin
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] truncate">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push("/admin/events/new")}
              className="bg-[#00666B] text-white border-2 border-black rounded-xl px-3 sm:px-5 py-2.5 sm:py-3 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all shrink-0"
            >
              + New Event
            </button>
            <SignOutButton />
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <StatCard
            label="Active Events"
            value={data?.activeEvents.length ?? 0}
            sub="Upcoming + Ongoing"
          />
        </div>

        {/* Active Events */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-black text-[#051B1D]">Active Events</h2>
            <button
              onClick={() => router.push("/admin/events")}
              className="text-xs sm:text-sm font-bold text-[#00666B] hover:underline"
            >
              Manage all →
            </button>
          </div>
          {data?.activeEvents.length === 0 ? (
            <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-2">📭</p>
              <p className="font-bold text-[#051B1D] text-sm">No active events</p>
              <button
                onClick={() => router.push("/admin/events/new")}
                className="mt-3 text-xs sm:text-sm font-bold text-[#00666B] hover:underline"
              >
                Create one →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.activeEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/admin/events/${event.id}`)}
                  className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-[#051B1D] text-sm break-words line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-700 font-medium mt-0.5 truncate">
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base sm:text-lg font-black text-[#00666B]">
                        {event.registrationCount ?? 0}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-700 font-bold">registered</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8">
          {[
            { label: "Events", path: "/admin/events" },
            { label: "Users", path: "/admin/users" },
            { label: "Export", path: "/admin/reports" },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="bg-[#F5F7F8] text-[#051B1D] border-2 border-black rounded-xl sm:rounded-2xl px-2 sm:px-4 py-3 sm:py-4 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-center"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
