"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminDashboardAction } from "@/actions/admin";

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
    <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
      <p className="text-3xl font-black text-[#0d9488]">{value}</p>
      <p className="text-sm font-bold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<{
    activeEvents: any[];
    recentRegistrations: any[];
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
      <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white border-2 border-black rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#0d9488] uppercase tracking-widest">
              Matrix Admin
            </p>
            <h1 className="text-3xl font-black text-black">Dashboard</h1>
          </div>
          <button
            onClick={() => router.push("/admin/events/new")}
            className="bg-[#0d9488] text-white border-2 border-black rounded-xl px-5 py-3 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            + New Event
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            label="Active Events"
            value={data?.activeEvents.length ?? 0}
            sub="Upcoming + Ongoing"
          />
          <StatCard
            label="Recent Registrations"
            value={data?.recentRegistrations.length ?? 0}
            sub="Last 10"
          />
        </div>

        {/* Active Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-black">Active Events</h2>
            <button
              onClick={() => router.push("/admin/events")}
              className="text-sm font-bold text-[#0d9488] hover:underline"
            >
              Manage all →
            </button>
          </div>
          {data?.activeEvents.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-[3px_3px_0px_#000]">
              <p className="text-2xl mb-2">📭</p>
              <p className="font-bold text-black text-sm">No active events</p>
              <button
                onClick={() => router.push("/admin/events/new")}
                className="mt-3 text-sm font-bold text-[#0d9488] hover:underline"
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
                  className="bg-white border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-black text-black text-sm">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-[#0d9488]">
                        {event.registrationCount ?? 0}
                      </p>
                      <p className="text-xs text-gray-400">registered</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-black">
              Recent Registrations
            </h2>
          </div>
          <div className="space-y-2">
            {data?.recentRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="bg-white border-2 border-black rounded-xl px-4 py-3 shadow-[2px_2px_0px_#000] flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-black">
                    {reg.studentName}
                  </p>
                  <p className="text-xs text-gray-400">{reg.eventTitle}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    reg.status === "REGISTERED"
                      ? "bg-green-100 text-green-700"
                      : reg.status === "WAITLISTED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          {[
            { label: "Events", path: "/admin/events" },
            { label: "Users", path: "/admin/users" },
            { label: "Export", path: "/admin/reports" },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="bg-white text-black border-2 border-black rounded-2xl px-4 py-4 font-black text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
