"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { completeOnboardingAction } from "@/actions/auth";

const DEPARTMENTS = ["AI", "AIML", "CSE", "ECE", "MECH", "CIVIL", "EEE"];
const PROGRAM_TYPES = ["UG", "PG"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const DEGREES = ["B.Tech AI & ML", "B.Tech CSE", "M.Tech AI", "MCA", "MBA"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    programType: "",
    degree: "",
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
    <main className="min-h-screen bg-[#f0faf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-black rounded-2xl p-8 shadow-[6px_6px_0px_#000]">
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-[#0d9488]" : "bg-gray-200"}`}
                />
              ))}
            </div>
            <h2 className="text-2xl font-black text-black">
              {step === 1 ? "Your Identity" : "Academic Details"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Step {step} of 2</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Full Name
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Roll Number
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                  placeholder="e.g. URK22AI001"
                  value={form.rollNumber}
                  onChange={(e) =>
                    update("rollNumber", e.target.value.toUpperCase())
                  }
                />
              </div>
              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Phone Number
                </label>
                <input
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                  placeholder="10-digit mobile number"
                  value={form.phoneNumber}
                  onChange={(e) => update("phoneNumber", e.target.value)}
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.rollNumber || !form.phoneNumber}
                className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                { label: "Degree", field: "degree", options: DEGREES },
              ].map(({ label, field, options }) => (
                <div key={field}>
                  <label className="text-sm font-bold text-black block mb-1">
                    {label}
                  </label>
                  <select
                    className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488] bg-white"
                    value={form[field as keyof typeof form]}
                    onChange={(e) => update(field, e.target.value)}
                  >
                    <option value="">Select {label}</option>
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !form.programType ||
                    !form.department ||
                    !form.yearOfStudy ||
                    !form.degree
                  }
                  className="flex-1 bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
