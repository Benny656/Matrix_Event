"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllUsersAction,
  updateUserRoleAction,
  searchUsersAction,
} from "@/actions/user";

const roleColors: Record<string, string> = {
  ADMIN: "bg-[#73FFFF] text-[#051B1D]",
  VOLUNTEER: "bg-[#39A8AD]/20 text-[#00666B]",
  STUDENT: "bg-gray-200 text-[#051B1D]",
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
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] mb-6">Users</h1>

        {/* Search */}
        <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-3 sm:p-4 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by roll number..."
              className="w-full sm:flex-1 border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D] placeholder:text-gray-600"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={searching}
                className="flex-1 sm:flex-initial bg-[#00666B] text-white border-2 border-black rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                {searching ? "..." : "Search"}
              </button>
              {isSearchMode && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    fetchUsers();
                  }}
                  className="bg-[#D3D3D3] text-[#051B1D] border-2 border-black rounded-xl px-4 py-2.5 sm:py-3 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-[#D3D3D3] border-2 border-black rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-6 sm:p-8 text-center shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <p className="text-2xl mb-2">👤</p>
            <p className="font-bold text-[#051B1D] text-sm sm:text-base">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-[#D3D3D3] border-2 border-black rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-[3px_3px_0px_#000]"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[#051B1D] leading-tight text-sm sm:text-base truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-700 font-medium mt-0.5 truncate">
                      {user.rollNumber} {user.department ? `· ${user.department}` : ""}
                    </p>
                    <p className="text-xs text-gray-700 font-medium break-all">{user.email}</p>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:py-1 rounded-full shrink-0 border border-black ${roleColors[user.role] || "bg-gray-200 text-[#051B1D]"}`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Role switcher */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-gray-400">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(user.id, role)}
                      disabled={user.role === role || updatingId === user.id}
                      className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-black transition-all disabled:opacity-40 ${
                        user.role === role
                          ? "text-[#00666B] bg-[#73FFFF] shadow-[1px_1px_0px_#000]"
                          : "text-gray-800 bg-[#c8c8c8] hover:bg-[#00666B] hover:text-white"
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
                className="w-full bg-[#D3D3D3] text-[#051B1D] border-2 border-black rounded-2xl py-3 sm:py-4 font-bold text-xs sm:text-sm shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
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
