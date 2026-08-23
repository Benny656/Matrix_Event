"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { changePasswordAction } from "@/actions/auth";
import { Lock, Eye, EyeOff } from "lucide-react";
import { ShineBorder } from "@/components/ui/shine-border";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    <main className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Ambient background orb */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(var(--accent)/0.08)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(var(--accent-light)/0.08)] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="glass rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <ShineBorder shineColor={["#00666B", "#39A8AD", "#76F7F7"]} />
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent-subtle))] border border-[hsl(var(--accent)/0.2)] flex items-center justify-center text-[hsl(var(--accent))] mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold text-[hsl(var(--text-primary))]">
              Set new password
            </h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Your admin has reset your password. Set a new one to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3 break-words">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 pr-11 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 pr-11 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !password || !confirm}
              className="w-full bg-[hsl(var(--accent))] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? "Saving..." : "Set Password →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
