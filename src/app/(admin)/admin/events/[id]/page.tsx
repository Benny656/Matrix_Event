"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getEventRegistrationsAction,
  getEventAttendanceAction,
  updateEventAction,
  deleteEventAction,
} from "@/actions/admin";
import { getEventByIdAction } from "@/actions/event";
import { v4 as uuidv4 } from "uuid";
import type { Event } from "@/types";
import Header from "@/components/layout/header";

type Tab = "registrations" | "attendance" | "sessions" | "settings";

function getStatusBadge(status: string) {
  switch (status) {
    case "ONGOING":
    case "REGISTERED":
      return "bg-emerald-500/10 text-emerald-600";
    case "UPCOMING":
    case "WAITLISTED":
      return "bg-amber-500/10 text-amber-600";
    case "CANCELLED":
      return "bg-red-500/10 text-red-500";
    case "COMPLETED":
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]";
    default:
      return "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]";
  }
}

export default function AdminEventDetailPage() {
  const router = useRouter();
  const { id: eventId } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("registrations");

  const [event, setEvent] = useState<Event | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // Registrations
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regLastId, setRegLastId] = useState<string | null>(null);
  const [regHasMore, setRegHasMore] = useState(false);
  const [loadingReg, setLoadingReg] = useState(true);
  const [loadingMoreReg, setLoadingMoreReg] = useState(false);

  // Attendance
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingAtt, setLoadingAtt] = useState(false);
  const [attLoaded, setAttLoaded] = useState(false);

  // Sessions Management
  const [sessions, setSessions] = useState<{ id: string; title: string; startTime: string }[]>([]);
  const [savingSessions, setSavingSessions] = useState(false);
  const [sessionMsg, setSessionMsg] = useState("");

  // Settings
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [togglingReg, setTogglingReg] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [eventStatus, setEventStatus] = useState("");

  useEffect(() => {
    fetchEventDetails();
    fetchRegistrations();
  }, [eventId]);

  async function fetchEventDetails() {
    try {
      setLoadingEvent(true);
      const ev = await getEventByIdAction(eventId);
      setEvent(ev);
      setSessions(ev.sessions || []);
      setWhatsappLink(ev.whatsappInviteLink || "");
    } catch (e) {
      console.error("Failed to load event details", e);
    } finally {
      setLoadingEvent(false);
    }
  }

  async function fetchRegistrations() {
    try {
      setLoadingReg(true);
      const res = await getEventRegistrationsAction(eventId);
      setRegistrations(res.registrations);
      setRegLastId(res.lastId);
      setRegHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReg(false);
    }
  }

  async function loadMoreRegistrations() {
    if (!regLastId) return;
    try {
      setLoadingMoreReg(true);
      const res = await getEventRegistrationsAction(eventId, regLastId);
      setRegistrations((prev) => [...prev, ...res.registrations]);
      setRegLastId(res.lastId);
      setRegHasMore(res.hasMore);
    } finally {
      setLoadingMoreReg(false);
    }
  }

  async function handleTabChange(t: Tab) {
    setTab(t);
    if (t === "attendance" && !attLoaded) {
      try {
        setLoadingAtt(true);
        const data = await getEventAttendanceAction(eventId);
        setAttendance(data);
        setAttLoaded(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAtt(false);
      }
    }
  }

  async function handleToggleRegistration() {
    if (!event) return;
    try {
      setTogglingReg(true);
      const nextState = !event.registrationOpen;
      await updateEventAction(eventId, { registrationOpen: nextState });
      setEvent((prev) => (prev ? { ...prev, registrationOpen: nextState } : null));
    } catch (e) {
      console.error("Failed to toggle registration", e);
    } finally {
      setTogglingReg(false);
    }
  }

  async function handleSaveWhatsapp() {
    try {
      setSavingWhatsapp(true);
      await updateEventAction(eventId, {
        whatsappInviteLink: whatsappLink.trim() || null,
      });
      setEvent((prev) =>
        prev ? { ...prev, whatsappInviteLink: whatsappLink.trim() || null } : null,
      );
      setSessionMsg("WhatsApp link updated!");
      setTimeout(() => setSessionMsg(""), 3000);
    } catch (e) {
      console.error("Failed to save whatsapp link", e);
    } finally {
      setSavingWhatsapp(false);
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

  function updateSessionField(
    id: string,
    field: "title" | "startTime",
    value: string,
  ) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  async function handleSaveSessions() {
    try {
      setSavingSessions(true);
      setSessionMsg("");
      const validSessions = sessions.filter(
        (s) => s.title.trim() !== "" && s.startTime.trim() !== "",
      );
      await updateEventAction(eventId, { sessions: validSessions });
      setSessions(validSessions);
      setEvent((prev) => (prev ? { ...prev, sessions: validSessions } : null));
      setSessionMsg("Sessions saved successfully!");
      setTimeout(() => setSessionMsg(""), 3000);
    } catch (e) {
      console.error("Failed to save sessions", e);
    } finally {
      setSavingSessions(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await deleteEventAction(eventId);
      router.push("/admin/events");
    } catch {
      setDeleting(false);
    }
  }

  async function handleStatusUpdate(status: string) {
    try {
      setStatusUpdating(true);
      await updateEventAction(eventId, { status });
      setEventStatus(status);
      setEvent((prev) => (prev ? { ...prev, status: status as any } : null));
    } finally {
      setStatusUpdating(false);
    }
  }

  function exportCSV() {
    const rows = attendance.map((a) => ({
      Name: a.studentName ?? "",
      "Roll Number": a.rollNumber ?? "",
      "Year of Study": a.yearOfStudy ?? "",
      "Check-in Time": a.timestamp
        ? new Date(a.timestamp).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : "",
    }));
    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${(r as any)[h] ?? ""}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <Header role="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Title & Quick Registration Toggle */}
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))] inline-block mb-2">
                  {event?.category || "Event"}
                </span>
                <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] leading-tight break-words">
                  {event?.title || "Event Detail"}
                </h1>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                  {event?.date
                    ? new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleRegistration}
                  disabled={togglingReg || loadingEvent}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50 ${
                    event?.registrationOpen
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                      : "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                  }`}
                >
                  {togglingReg
                    ? "Updating..."
                    : event?.registrationOpen
                    ? "✓ Registration: OPEN"
                    : "✕ Registration: CLOSED"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[hsl(var(--border))] mb-6 flex gap-2 overflow-x-auto">
            {(["registrations", "attendance", "sessions", "settings"] as Tab[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize whitespace-nowrap ${
                    tab === t
                      ? "border-[hsl(var(--accent))] text-[hsl(var(--accent))]"
                      : "border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  }`}
                >
                  {t}
                </button>
              ),
            )}
          </div>

          {/* ── Registrations Tab ── */}
          {tab === "registrations" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-[hsl(var(--text-secondary))]">
                  {registrations.length} registered students loaded
                </p>
              </div>

              {loadingReg ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
                    No registrations yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="glass rounded-xl border border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[hsl(var(--text-primary))] text-sm truncate">
                          {reg.studentName}
                        </p>
                        <p className="text-xs text-[hsl(var(--text-tertiary))] truncate mt-0.5">
                          {reg.rollNumber} {reg.department ? `· ${reg.department}` : ""}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${getStatusBadge(reg.status)}`}
                      >
                        {reg.status}
                      </span>
                    </div>
                  ))}

                  {regHasMore && (
                    <button
                      onClick={loadMoreRegistrations}
                      disabled={loadingMoreReg}
                      className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] text-sm font-medium w-full py-3 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-all mt-4 disabled:opacity-50"
                    >
                      {loadingMoreReg ? "Loading..." : "Load more"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Attendance Tab ── */}
          {tab === "attendance" && (
            <div>
              {loadingAtt ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-14 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <p className="text-sm font-medium text-[hsl(var(--text-secondary))]">
                      {attendance.length} check-in records
                    </p>
                    {attendance.length > 0 && (
                      <button
                        onClick={exportCSV}
                        className="bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] text-sm font-medium px-4 py-2 rounded-xl hover:bg-[hsl(var(--surface-2))] transition-all"
                      >
                        Export CSV
                      </button>
                    )}
                  </div>

                  {attendance.length === 0 ? (
                    <div className="glass rounded-2xl border border-[hsl(var(--border))] p-8 text-center">
                      <p className="text-3xl mb-2">📊</p>
                      <p className="font-semibold text-[hsl(var(--text-primary))] text-base">
                        No attendance recorded yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attendance.map((a) => (
                        <div
                          key={a.id}
                          className="glass rounded-xl border border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                              {a.studentName}
                            </p>
                            <p className="text-xs text-[hsl(var(--text-tertiary))] truncate mt-0.5">
                              {a.rollNumber} {a.department ? `· ${a.department}` : ""}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-medium text-[hsl(var(--text-secondary))]">
                              {a.method}
                            </p>
                            <p className="text-xs text-[hsl(var(--text-tertiary))] mt-0.5">
                              {new Date(a.timestamp).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Sessions Tab ── */}
          {tab === "sessions" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                      Manage Sessions
                    </h2>
                    <p className="text-xs text-[hsl(var(--text-secondary))] mt-0.5">
                      Add, edit, or remove sessions for this event at any time.
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

                {sessionMsg && (
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-emerald-600 text-sm font-medium">
                    {sessionMsg}
                  </div>
                )}

                {sessions.length === 0 ? (
                  <div className="border border-dashed border-[hsl(var(--border-2))] rounded-xl p-6 text-center">
                    <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
                      No sessions created yet for this event.
                    </p>
                    <button
                      onClick={addSession}
                      className="bg-[hsl(var(--accent))] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                    >
                      + Create First Session
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
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
                                updateSessionField(session.id, "title", e.target.value)
                              }
                              placeholder="e.g. Workshop Track 1"
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
                                updateSessionField(
                                  session.id,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sessions.length > 0 && (
                  <button
                    onClick={handleSaveSessions}
                    disabled={savingSessions}
                    className="w-full bg-[hsl(var(--accent))] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {savingSessions ? "Saving Sessions..." : "Save Sessions"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Settings Tab ── */}
          {tab === "settings" && (
            <div className="space-y-4">
              {/* WhatsApp Link Configuration */}
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#25D366] text-white rounded-lg inline-flex items-center justify-center">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </span>
                  <h3 className="font-semibold text-[hsl(var(--text-primary))] text-base sm:text-lg">
                    WhatsApp Group / Community Link
                  </h3>
                </div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  Students will be prompted to join this WhatsApp group right after registering.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="flex-1 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-xl px-4 py-2.5 text-sm text-[hsl(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:border-transparent transition-all placeholder:text-[hsl(var(--text-tertiary))]"
                  />
                  <button
                    onClick={handleSaveWhatsapp}
                    disabled={savingWhatsapp}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 shrink-0 flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    <span>{savingWhatsapp ? "Saving..." : "Update WhatsApp Link"}</span>
                  </button>
                </div>
              </div>

              {/* Event Status Update */}
              <div className="glass rounded-2xl border border-[hsl(var(--border))] p-5 sm:p-6">
                <h3 className="font-semibold text-[hsl(var(--text-primary))] text-base sm:text-lg mb-3">
                  Update Status
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(s)}
                      disabled={statusUpdating}
                      className={`rounded-xl py-2.5 text-sm transition-all disabled:opacity-50 text-center ${
                        event?.status === s
                          ? "bg-[hsl(var(--accent))] text-white font-semibold"
                          : "bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--surface-2))]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {eventStatus && (
                  <p className="text-xs text-[hsl(var(--accent))] font-medium mt-3">
                    Status updated to {eventStatus}
                  </p>
                )}
              </div>

              {/* Danger Zone */}
              <div className="glass rounded-2xl border border-red-500/20 p-6">
                <h3 className="font-semibold text-red-500 text-base mb-2">
                  Danger Zone
                </h3>
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-4">
                  Deleting an event is permanent. Registrations and attendance
                  records are not automatically removed.
                </p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 w-full sm:w-auto"
                >
                  {deleting ? "Deleting..." : "Delete Event"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
