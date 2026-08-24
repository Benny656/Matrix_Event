"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminDashboardAction } from "@/actions/admin";
import { useStore } from "@/store/user-store";
import GlassNav from "@/components/shared/GlassNav";
import SignOutButton from "@/components/shared/signout-button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

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
    <div className="glass rounded-2xl border border-[hsl(var(--border))] p-6 min-w-0">
      <p className="text-3xl font-bold text-[hsl(var(--accent))]">{value}</p>
      <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-1 truncate">
        {label}
      </p>
      {sub && (
        <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5 truncate">
          {sub}
        </p>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const router = useRouter();
  const { adminDashboardData, setAdminDashboardData } = useStore();
  const [data, setData] = useState<{
    activeEvents: any[];
    totalUsers: number;
  } | null>(adminDashboardData);
  const [loading, setLoading] = useState(!adminDashboardData);

  useEffect(() => {
    // Show cached data instantly (if available) while fresh fetch runs
    if (adminDashboardData) {
      setData(adminDashboardData);
      setLoading(false);
    }

    // Always fetch fresh from Firestore — never skip
    getAdminDashboardAction()
      .then((res) => {
        setData(res);
        setAdminDashboardData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-sm font-medium text-[hsl(var(--accent))] uppercase tracking-widest block mb-1">
              Matrix Admin
            </span>
            <h1 className="text-3xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Overview of events, attendance, and administrative controls
            </p>
          </div>
          <InteractiveHoverButton
            onClick={() => router.push("/admin/events/new")}
            className="self-start sm:self-auto shrink-0 py-2.5 px-5"
          >
            + New Event
          </InteractiveHoverButton>
        </div>

        {/* Stats */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="h-28 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse" />
              <div className="h-28 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                label="Active Events"
                value={data?.activeEvents.length ?? 0}
                sub="Upcoming + Ongoing"
              />
              <StatCard
                label="Total Registered Users"
                value={data?.totalUsers ?? 0}
                sub="Total registered accounts"
              />
            </div>
          )}
        </div>

        {/* Active Events */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
              Active Events
            </h2>
            <button
              onClick={() => router.push("/admin/events")}
              className="text-sm font-medium text-[hsl(var(--accent))] hover:underline"
            >
              Manage all →
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : data?.activeEvents.length === 0 ? (
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
                No active events
              </p>
              <button
                onClick={() => router.push("/admin/events/new")}
                className="mt-3 text-sm font-medium text-[hsl(var(--accent))] hover:underline inline-block"
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
                  className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 hover:shadow-md hover:border-[hsl(var(--accent))]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[hsl(var(--text-primary))] text-sm break-words line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1 truncate">
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-[hsl(var(--accent))] leading-none">
                        {event.registrationCount ?? 0}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-1">
                        registered
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            {
              label: "Events",
              path: "/admin/events",
              desc: "Manage and configure all events",
              icon: "📋",
            },
            {
              label: "Users",
              path: "/admin/users",
              desc: "Directory and role management",
              icon: "👥",
            },
            {
              label: "Export & Reports",
              path: "/admin/reports",
              desc: "Download attendance reports",
              icon: "📊",
            },
          ].map(({ label, path, desc, icon }) => (
            <div
              key={path}
              onClick={() => router.push(path)}
              className="glass rounded-2xl border border-[hsl(var(--border))] hover:border-[hsl(var(--accent))] p-5 text-center cursor-pointer transition-all hover:shadow-md"
            >
              <p className="text-2xl mb-2">{icon}</p>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">
                {label}
              </p>
              <p className="text-xs text-[hsl(var(--text-secondary))] mt-1">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
  );
}
