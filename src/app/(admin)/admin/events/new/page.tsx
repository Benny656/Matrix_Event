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
  "Non-Technical",
  "Workshop",
  "Seminar",
  "Hackathon",
  "Bootcamp",
];

export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    date: "",
    category: "",
    description: "",
    capacity: "",
    whatsappInviteLink: "",
  });

  const [sessions, setSessions] = useState<Session[]>([]);

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
    if (!form.title || !form.date || !form.category) {
      setError("Please fill in all required fields (Title, Date, Category).");
      return;
    }

    // Sessions are optional, but if added, ensure they have title & start time
    const activeSessions = sessions.filter(
      (s) => s.title.trim() !== "" || s.startTime.trim() !== "",
    );
    if (activeSessions.some((s) => !s.title || !s.startTime)) {
      setError("Each added session must have both a title and start time, or be removed.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      const { id } = await createEventAction({
        title: form.title,
        date: form.date,
        category: form.category,
        description: form.description,
        capacity: Number(form.capacity) || 0,
        whatsappInviteLink: form.whatsappInviteLink.trim() || undefined,
        sessions: activeSessions,
      });
      router.push(`/admin/events/${id}`);
    } catch (e: any) {
      setError(e.message || "Failed to create event.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] mb-6 sm:mb-8">
          Create Event
        </h1>

        {error && (
          <div className="mb-6 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold break-words">
            {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          {/* Basic Info */}
          <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <h2 className="font-black text-[#051B1D] text-base sm:text-lg mb-3 sm:mb-4">
              Basic Info
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. AI & Web3 Hackathon 2025"
                  className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D] placeholder:text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D]"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D]"
                  >
                    <option value="" className="text-[#051B1D]">
                      Select category...
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="text-[#051B1D]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] flex items-center gap-1.5 mb-1">
                  <span className="p-1 bg-[#25D366] text-white rounded-lg inline-flex items-center justify-center border border-black">
                    <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </span>
                  WhatsApp Group / Community Link <span className="text-xs text-gray-700 font-normal">(Optional)</span>
                </label>
                <input
                  name="whatsappInviteLink"
                  value={form.whatsappInviteLink}
                  onChange={handleChange}
                  placeholder="e.g. https://chat.whatsapp.com/..."
                  className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#25D366] bg-[#D3D3D3] text-[#051B1D] placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Capacity / Max Participants (Optional)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 200 (Leave empty for unlimited)"
                  min={0}
                  className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D] placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-[#051B1D] block mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the event..."
                  className="w-full border-2 border-black rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium focus:outline-none focus:border-[#39A8AD] resize-none bg-[#D3D3D3] text-[#051B1D] placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Sessions (Optional) */}
          <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 sm:p-5 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="font-black text-[#051B1D] text-base sm:text-lg">
                  Sessions <span className="text-xs text-gray-700 font-normal">(Optional)</span>
                </h2>
                <p className="text-xs text-gray-700">
                  You can proceed without creating sessions now and add or edit them later.
                </p>
              </div>
              <button
                type="button"
                onClick={addSession}
                className="text-xs sm:text-sm font-bold text-[#00666B] border-2 border-[#00666B] rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 hover:bg-[#00666B] hover:text-white transition-all shrink-0"
              >
                + Add Session
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-700 font-medium">
                  No sessions added yet. Click &quot;+ Add Session&quot; if you want to define sessions now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="border-2 border-black rounded-xl p-3 sm:p-4 bg-[#c8c8c8]"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <p className="text-[10px] sm:text-xs font-black text-gray-800 uppercase tracking-widest">
                        Session {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeSession(session.id)}
                        className="text-xs text-red-600 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-[#051B1D] block mb-1">
                          Session Title
                        </label>
                        <input
                          value={session.title}
                          onChange={(e) =>
                            updateSession(session.id, "title", e.target.value)
                          }
                          placeholder="e.g. Keynote Speech"
                          className="w-full border-2 border-black rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D] placeholder:text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] sm:text-xs font-bold text-[#051B1D] block mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={session.startTime}
                          onChange={(e) =>
                            updateSession(session.id, "startTime", e.target.value)
                          }
                          className="w-full border-2 border-black rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#39A8AD] bg-[#D3D3D3] text-[#051B1D]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#00666B] text-white border-2 border-black rounded-2xl px-4 py-3.5 sm:py-4 font-black text-sm sm:text-base shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
          >
            {submitting ? "Creating Event..." : "Create Event →"}
          </button>
        </div>
      </div>
    </main>
  );
}
