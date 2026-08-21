"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/actions/admin";
import { v4 as uuidv4 } from "uuid";

type Session = {
  id: string;
  title: string;
  startTime: string;
};

const CATEGORIES = [
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
  "Other",
];
const STATUS_OPTIONS = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"];

export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    date: "",
    category: "",
    description: "",
    venue: "",
    capacity: "",
    coordinatorName: "",
  });

  const [sessions, setSessions] = useState<Session[]>([
    { id: uuidv4(), title: "", startTime: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function addSession() {
    setSessions((prev) => [
      ...prev,
      { id: uuidv4(), title: "", startTime: "" },
    ]);
  }

  function removeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSession(
    id: string,
    field: keyof Omit<Session, "id">,
    value: string,
  ) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function handleSubmit() {
    if (
      !form.title ||
      !form.date ||
      !form.category ||
      !form.venue ||
      !form.coordinatorName
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    if (sessions.some((s) => !s.title || !s.startTime)) {
      setError("Each session must have a title and start time.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      const { id } = await createEventAction({
        ...form,
        capacity: Number(form.capacity) || 0,
        sessions,
      });
      router.push(`/admin/events/${id}`);
    } catch (e: any) {
      setError(e.message || "Failed to create event.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-black text-black mb-8">Create Event</h1>

        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Title */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
            <h2 className="font-black text-black mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Tech Fest 2025"
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-black block mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-black block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488] bg-white"
                  >
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Main Auditorium"
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-black block mb-1">
                    Coordinator Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="coordinatorName"
                    value={form.coordinatorName}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Ramesh"
                    className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-black block mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 200"
                    min={0}
                    className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-black block mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the event..."
                  className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#0d9488] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-black">Sessions</h2>
              <button
                onClick={addSession}
                className="text-sm font-bold text-[#0d9488] border-2 border-[#0d9488] rounded-xl px-3 py-1.5 hover:bg-[#0d9488] hover:text-white transition-all"
              >
                + Add Session
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="border-2 border-gray-200 rounded-xl p-4 bg-[#f9fafb]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                      Session {index + 1}
                    </p>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => removeSession(session.id)}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-black block mb-1">
                        Title
                      </label>
                      <input
                        value={session.title}
                        onChange={(e) =>
                          updateSession(session.id, "title", e.target.value)
                        }
                        placeholder="e.g. Morning Session"
                        className="w-full border-2 border-black rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-black block mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(e) =>
                          updateSession(session.id, "startTime", e.target.value)
                        }
                        className="w-full border-2 border-black rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#0d9488]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#0d9488] text-white border-2 border-black rounded-2xl px-4 py-4 font-black text-base shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
          >
            {submitting ? "Creating Event..." : "Create Event →"}
          </button>
        </div>
      </div>
    </main>
  );
}
