"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/actions/admin";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/layout/header";
import { ShineBorder } from "@/components/ui/shine-border";

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

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

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

  // Eligibility state
  const [targetAudience, setTargetAudience] = useState<"ALL" | "STUDENTS" | "FACULTY">("ALL");
  const [programTypes, setProgramTypes] = useState<string[]>(["UG", "PG"]);
  const [years, setYears] = useState<string[]>(["ALL"]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isAllYears = years.includes("ALL") || years.includes("All Years");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleProgramType(type: "UG" | "PG" | "Both") {
    if (type === "Both") {
      if (programTypes.includes("UG") && programTypes.includes("PG")) {
        setProgramTypes([]);
      } else {
        setProgramTypes(["UG", "PG"]);
      }
    } else {
      if (programTypes.includes(type)) {
        setProgramTypes(programTypes.filter((p) => p !== type));
      } else {
        setProgramTypes([...programTypes, type]);
      }
    }
  }

  function toggleYear(year: string) {
    if (year === "ALL") {
      setYears(["ALL"]);
      return;
    }
    const currentWithoutAll = years.filter((y) => y !== "ALL" && y !== "All Years");
    if (currentWithoutAll.includes(year)) {
      const next = currentWithoutAll.filter((y) => y !== year);
      setYears(next.length === 0 ? ["ALL"] : next);
    } else {
      const next = [...currentWithoutAll, year];
      if (next.length === 4) {
        setYears(["ALL"]);
      } else {
        setYears(next);
      }
    }
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
        eligibility: {
          targetAudience,
          programTypes: programTypes.length === 0 ? ["UG", "PG"] : programTypes,
          years: years.length === 0 ? ["ALL"] : years,
        },
      });
      router.push(`/admin/events/${id}`);
    } catch (e: any) {
      setError(e.message || "Failed to create event.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] tracking-tight">
              Create Event
            </h1>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Configure details, eligibility criteria, and sessions for the new event
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3 break-words">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 relative overflow-hidden">
              <ShineBorder shineColor={["#00666B", "#39A8AD", "#76F7F7"]} />
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">
                Basic Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. AI & Web3 Hackathon 2025"
                    className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full placeholder:text-[hsl(var(--text-tertiary))]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full"
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] flex items-center gap-1.5 mb-1.5">
                    <span className="p-1 bg-[#25D366] text-white rounded-md inline-flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </span>
                    <span>WhatsApp Group / Community Link</span>
                    <span className="text-xs text-[hsl(var(--text-tertiary))] font-normal">(Optional)</span>
                  </label>
                  <input
                    name="whatsappInviteLink"
                    value={form.whatsappInviteLink}
                    onChange={handleChange}
                    placeholder="e.g. https://chat.whatsapp.com/..."
                    className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full placeholder:text-[hsl(var(--text-tertiary))]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                    Capacity / Max Participants <span className="text-xs text-[hsl(var(--text-tertiary))] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 200 (Leave empty for unlimited)"
                    min={0}
                    className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full placeholder:text-[hsl(var(--text-tertiary))]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description of the event..."
                    className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full resize-none placeholder:text-[hsl(var(--text-tertiary))]"
                  />
                </div>
              </div>
            </div>

            {/* Eligibility Criteria */}
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 relative overflow-hidden">
              <ShineBorder shineColor={["#00666B", "#39A8AD", "#76F7F7"]} />
              <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-1">
                Eligibility Criteria
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] mb-4">
                Specify which students can view and register for this event.
              </p>

              <div className="space-y-4">
                {/* Target Audience */}
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) =>
                      setTargetAudience(e.target.value as "ALL" | "STUDENTS" | "FACULTY")
                    }
                    className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full"
                  >
                    <option value="ALL">All (Students & Faculty)</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="FACULTY">Faculty Only</option>
                  </select>
                </div>

                {/* Program Type */}
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                    Program Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "UG", key: "UG", active: programTypes.includes("UG") },
                      { label: "PG", key: "PG", active: programTypes.includes("PG") },
                      {
                        label: "Both",
                        key: "Both",
                        active:
                          programTypes.includes("UG") && programTypes.includes("PG"),
                      },
                    ].map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => toggleProgramType(chip.key as "UG" | "PG" | "Both")}
                        className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          chip.active
                            ? "bg-[hsl(var(--accent))] text-white border border-transparent"
                            : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year of Study */}
                <div>
                  <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                    Year of Study
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleYear("ALL")}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isAllYears
                          ? "bg-[hsl(var(--accent))] text-white border border-transparent"
                          : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
                      }`}
                    >
                      All Years
                    </button>

                    {YEAR_OPTIONS.map((yr) => {
                      const isSelected = !isAllYears && years.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => toggleYear(yr)}
                          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[hsl(var(--accent))] text-white border border-transparent"
                              : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
                          }`}
                        >
                          {yr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sessions (Optional) */}
            <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 relative overflow-hidden">
              <ShineBorder shineColor={["#00666B", "#39A8AD", "#76F7F7"]} />
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                    Sessions <span className="text-xs text-[hsl(var(--text-tertiary))] font-normal">(Optional)</span>
                  </h2>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                    Define scheduled sessions now or configure them later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSession}
                  className="text-xs font-medium text-[hsl(var(--accent))] border border-[hsl(var(--accent))] rounded-xl px-3 py-1.5 hover:bg-[hsl(var(--accent))] hover:text-white transition-all shrink-0"
                >
                  + Add Session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="border border-dashed border-[hsl(var(--border-2))] rounded-xl p-4 text-center">
                  <p className="text-xs text-[hsl(var(--text-secondary))]">
                    No sessions added yet. Click &quot;+ Add Session&quot; to define agenda tracks.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-medium text-[hsl(var(--text-tertiary))] uppercase tracking-wide">
                          Session {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeSession(session.id)}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                            Session Title
                          </label>
                          <input
                            value={session.title}
                            onChange={(e) =>
                              updateSession(session.id, "title", e.target.value)
                            }
                            placeholder="e.g. Keynote Speech"
                            className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full placeholder:text-[hsl(var(--text-tertiary))]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-[hsl(var(--text-secondary))] mb-1.5 block">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={session.startTime}
                            onChange={(e) =>
                              updateSession(session.id, "startTime", e.target.value)
                            }
                            className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[hsl(var(--accent))] text-white text-base font-semibold px-5 py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Creating Event..." : "Create Event →"}
            </button>
          </div>
        </div>
      </div>
  );
}
