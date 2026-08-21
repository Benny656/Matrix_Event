"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllUsersAction,
  updateUserRoleAction,
  searchUsersAction,
} from "@/actions/user";

const roleColors: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  VOLUNTEER: "bg-blue-100 text-blue-700",
  STUDENT: "bg-green-100 text-green-700",
};

const ROLES = ["STUDENT", "VOLUNTEER", "ADMIN"] as const;

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setIsSearchMode(false);
      const res = await getAllUsersAction();
      setUsers(res.users);
      setLastId(res.lastId);
      setHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!lastId) return;
    try {
      setLoadingMore(true);
      const res = await getAllUsersAction(lastId);
      setUsers((prev) => [...prev, ...res.users]);
      setLastId(res.lastId);
      setHasMore(res.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }
    try {
      setSearching(true);
      setIsSearchMode(true);
      const results = await searchUsersAction(searchQuery.trim());
      setUsers(results);
      setHasMore(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }

  async function handleRoleChange(
    userId: string,
    role: "ADMIN" | "VOLUNTEER" | "STUDENT",
  ) {
    try {
      setUpdatingId(userId);
      await updateUserRoleAction(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-black text-black mb-6">Users</h1>

        {/* Search */}
        <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000] mb-6">
          <div className="flex gap-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by roll number..."
              className="flex-1 border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-[#0d9488] text-white border-2 border-black rounded-xl px-5 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {searching ? "..." : "Search"}
            </button>
            {isSearchMode && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchUsers();
                }}
                className="bg-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white border-2 border-black rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-2xl p-8 text-center shadow-[4px_4px_0px_#000]">
            <p className="text-2xl mb-2">👤</p>
            <p className="font-bold text-black">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white border-2 border-black rounded-2xl px-5 py-4 shadow-[3px_3px_0px_#000]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-black leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.rollNumber} · {user.department}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${roleColors[user.role]}`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Role switcher */}
                <div className="flex gap-2 mt-3">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(user.id, role)}
                      disabled={user.role === role || updatingId === user.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 transition-all disabled:opacity-40 ${
                        user.role === role
                          ? "border-[#0d9488] text-[#0d9488] bg-[#f0faf8]"
                          : "border-gray-300 text-gray-500 hover:border-black hover:text-black"
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

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full bg-white border-2 border-black rounded-2xl py-4 font-bold text-sm shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
