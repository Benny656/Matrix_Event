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
    <main className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000]">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-[#00666B]" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#051B1D]">
              {step === 1 ? "Your Identity" : "Academic Details"}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Step {step} of 2</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-xs sm:text-sm font-medium break-words">
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
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D] placeholder:text-gray-400"
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
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] uppercase bg-white text-[#051B1D] placeholder:text-gray-400"
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
                  type="tel"
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D] placeholder:text-gray-400"
                  placeholder="10-digit mobile number"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.name.trim() || !form.rollNumber.trim() || !form.phoneNumber.trim()}
                className="w-full bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm sm:text-base shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {[
                {
                  label: "Program Type",
                  field: "programType",
                  options: PROGRAM_TYPES,
                },
                {
                  label: "Department",
                  field: "department",
                  options: DEPARTMENTS,
                },
                {
                  label: "Year of Study",
                  field: "yearOfStudy",
                  options: YEARS,
                },
              ].map(({ label, field, options }) => (
                <div key={field}>
                  <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                    {label}
                  </label>
                  <select
                    className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-white text-[#051B1D]"
                    value={form[field as keyof typeof form]}
                    onChange={(e) => update(field, e.target.value)}
                  >
                    <option value="" className="text-[#051B1D]">Select {label}</option>
                    {options.map((o) => (
                      <option key={o} value={o} className="text-[#051B1D]">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white text-[#051B1D] border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.programType ||
                    !form.department ||
                    !form.yearOfStudy
                  }
                  className="flex-1 bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Complete →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
