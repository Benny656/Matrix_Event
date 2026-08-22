"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/actions/auth";

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
    <main className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#F5F7F8] border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000]">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-[#00666B]" : "bg-gray-400"}`}
                />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#051B1D]">
              {step === 1 ? "Your Identity" : "Academic Details"}
            </h2>
            <p className="text-gray-700 text-xs sm:text-sm mt-1 font-medium">Step {step} of 2</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold break-words">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Full Name
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#F5F7F8] text-[#051B1D] placeholder:text-gray-600"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Roll Number
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] uppercase bg-[#F5F7F8] text-[#051B1D] placeholder:text-gray-600"
                  placeholder="e.g. URK22AI001"
                  value={form.rollNumber}
                  onChange={(e) =>
                    update("rollNumber", e.target.value.toUpperCase())
                  }
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Phone Number
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#F5F7F8] text-[#051B1D] placeholder:text-gray-600"
                  placeholder="10-digit mobile number"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  if (!form.name || !form.rollNumber || !form.phoneNumber) {
                    setError("Please fill in all fields");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm sm:text-base shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Department
                </label>
                <select
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#F5F7F8] text-[#051B1D]"
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                >
                  <option value="" className="text-[#051B1D]">Select department...</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="text-[#051B1D]">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Program Type
                </label>
                <select
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#F5F7F8] text-[#051B1D]"
                  value={form.programType}
                  onChange={(e) => update("programType", e.target.value)}
                >
                  <option value="" className="text-[#051B1D]">Select program...</option>
                  {PROGRAM_TYPES.map((p) => (
                    <option key={p} value={p} className="text-[#051B1D]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Year of Study
                </label>
                <select
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#F5F7F8] text-[#051B1D]"
                  value={form.yearOfStudy}
                  onChange={(e) => update("yearOfStudy", e.target.value)}
                >
                  <option value="" className="text-[#051B1D]">Select year...</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="text-[#051B1D]">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="bg-[#F5F7F8] text-[#051B1D] border-2 border-black rounded-xl px-4 py-3 font-bold text-sm sm:text-base shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.department ||
                    !form.programType ||
                    !form.yearOfStudy
                  }
                  className="flex-1 bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm sm:text-base shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Complete Setup →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
