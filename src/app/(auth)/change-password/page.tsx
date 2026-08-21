"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { changePasswordAction } from "@/actions/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (password !== confirm) return setError("Passwords do not match");
    if (password.length < 8)
      return setError("Password must be at least 8 characters");
    try {
      setLoading(true);
      setError("");
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not authenticated");
      await changePasswordAction(uid, password);
      router.push("/student");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[6px_6px_0px_#000]">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-black">Set New Password</h2>
            <p className="text-gray-500 text-sm mt-1">
              Your admin has reset your password. Set a new one to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-black block mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-black block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !password || !confirm}
              className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold border-2 border-black shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Set Password →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
