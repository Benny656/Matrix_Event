"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateUserRoleAction,
  searchUsersAction,
} from "@/actions/user";
import { useStore } from "@/store/user-store";
import Header from "@/components/layout/header";
import { ShineBorder } from "@/components/ui/shine-border";

function getRoleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]";
    case "VOLUNTEER":
      return "bg-blue-500/10 text-blue-600";
    case "FACULTY":
      return "bg-purple-500/10 text-purple-600";
    case "STUDENT":
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]";
    default:
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-secondary))]";
  }
}

const ROLES = ["STUDENT", "VOLUNTEER", "FACULTY", "ADMIN"] as const;

export default function AdminUsersPage() {
  const router = useRouter();
  const { userSearchCache, setUserSearchCache } = useStore();

  const [users, setUsers] = useState<any[]>(userSearchCache?.results ?? []);
  const [searchQuery, setSearchQuery] = useState(userSearchCache?.query ?? "");
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!userSearchCache);
  const [lastSearchedQuery, setLastSearchedQuery] = useState(userSearchCache?.query ?? "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleSearch() {
    const query = searchQuery.trim();
    if (!query) {
      setUsers([]);
      setHasSearched(false);
      setLastSearchedQuery("");
      setUserSearchCache(null);
      return;
    }
    try {
      setSearching(true);
      setLastSearchedQuery(query);
      const results = await searchUsersAction(query);
      setUsers(results);
      setHasSearched(true);
      setUserSearchCache({ query, results });
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }

  function handleClear() {
    setSearchQuery("");
    setUsers([]);
    setHasSearched(false);
    setLastSearchedQuery("");
    setUserSearchCache(null);
  }

  async function handleRoleChange(
    userId: string,
    role: "ADMIN" | "VOLUNTEER" | "FACULTY" | "STUDENT",
  ) {
    try {
      setUpdatingId(userId);
      await updateUserRoleAction(userId, role);
      setUsers((prev) => {
        const updated = prev.map((u) => (u.id === userId ? { ...u, role } : u));
        if (userSearchCache) {
          setUserSearchCache({ ...userSearchCache, results: updated });
        }
        return updated;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
              Users Directory
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Search students, faculty, volunteers, and manage administrative roles
            </p>
          </div>

          {/* Search Card */}
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-4 sm:p-5 mb-6 relative overflow-hidden">
            <ShineBorder shineColor={["#00666B", "#39A8AD", "#76F7F7"]} />
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by roll number, name, or email..."
                className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full sm:flex-1 placeholder:text-[hsl(var(--text-tertiary))]"
              />
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="bg-[hsl(var(--accent))] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex-1 sm:flex-initial"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
                {(hasSearched || searchQuery) && (
                  <button
                    onClick={handleClear}
                    className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Users Content */}
          {searching ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : !hasSearched ? (
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
              <p className="text-3xl mb-2">🔍</p>
              <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
                Search Users
              </p>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1 max-w-md mx-auto">
                Enter a roll number, name, or email to search and manage user roles across the platform.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
              <p className="text-3xl mb-2">👤</p>
              <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
                No users found matching &quot;{lastSearchedQuery}&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-[hsl(var(--text-tertiary))] mb-1">
                Found {users.length} {users.length === 1 ? "user" : "users"}
              </p>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="glass rounded-2xl border border-[hsl(var(--border))] px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[hsl(var(--text-primary))] leading-tight text-sm sm:text-base truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5 truncate">
                        {user.rollNumber || "No Roll No."} {user.department ? `· ${user.department}` : ""}
                      </p>
                      <p className="text-xs text-[hsl(var(--text-secondary))] break-all mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${getRoleBadge(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Role switcher */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[hsl(var(--border))]">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(user.id, role)}
                        disabled={user.role === role || updatingId === user.id}
                        className={`text-xs font-medium px-3 py-1 rounded-xl transition-all disabled:cursor-default ${
                          user.role === role
                            ? "bg-[hsl(var(--accent))] text-white"
                            : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
                        }`}
                      >
                        {updatingId === user.id && user.role !== role
                          ? "..."
                          : role}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
