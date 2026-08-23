"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/actions/auth";
import { motion } from "framer-motion";

const DEPARTMENTS = ["AI", "AIML"];
const PROGRAM_TYPES = ["UG", "PG"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    programType: "",
    department: "",
    yearOfStudy: "",
    phoneNumber: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/auth/verify");
      const { role } = await res.json();
      if (!role) throw new Error("Not authenticated");
      const sessionRes = await fetch("/api/auth/me");
      const { uid } = await sessionRes.json();
      await completeOnboardingAction(uid, form);
      router.push("/student");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4 relative overflow-hidden">
      {/* Ambient background orb */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(var(--accent)/0.08)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(var(--accent-light)/0.08)] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="glass rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-8 shadow-xl">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    s <= step ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--border))]"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wide mb-1">
              Step {step} of 2
            </p>
            <h2 className="text-2xl font-semibold text-[hsl(var(--text-primary))]">
              {step === 1 ? "Your Identity" : "Academic Details"}
            </h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3 break-words">
              {error}
            </div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                  Full Name
                </label>
                <input
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                  Roll Number
                </label>
                <input
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all uppercase"
                  placeholder="e.g. URK22AI001"
                  value={form.rollNumber}
                  onChange={(e) =>
                    update("rollNumber", e.target.value.toUpperCase())
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                  Phone Number
                </label>
                <input
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all"
                  placeholder="10-digit mobile number"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!form.name || !form.rollNumber || !form.phoneNumber) {
                    setError("Please fill in all fields");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full bg-[hsl(var(--accent))] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                Next →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                  Department
                </label>
                <select
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all cursor-pointer"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                >
                  <option value="" className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
                    Select department...
                  </option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                  Program Type
                </label>
                <select
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all cursor-pointer"
                  value={form.programType}
                  onChange={(e) => update("programType", e.target.value)}
                >
                  <option value="" className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
                    Select program...
                  </option>
                  {PROGRAM_TYPES.map((p) => (
                    <option key={p} value={p} className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                  Year of Study
                </label>
                <select
                  className="w-full bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all cursor-pointer"
                  value={form.yearOfStudy}
                  onChange={(e) => update("yearOfStudy", e.target.value)}
                >
                  <option value="" className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
                    Select year...
                  </option>
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))]">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[hsl(var(--surface-2))] transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.department ||
                    !form.programType ||
                    !form.yearOfStudy
                  }
                  className="flex-1 bg-[hsl(var(--accent))] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Saving..." : "Complete Setup →"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
