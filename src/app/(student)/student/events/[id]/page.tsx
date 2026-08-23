"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/user-store";
import {
  getEventDetailAction,
  getStudentEventAttendanceAction,
  registerForEventAction,
} from "@/actions/event";
import Header from "@/components/layout/header";
import type { Event, Registration, Attendance } from "@/types";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-500/10 text-blue-600",
  ONGOING: "bg-emerald-500/10 text-emerald-600",
  COMPLETED: "bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]",
};

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { invalidateEvents, invalidateRegistrations, invalidateDashboard } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Registration Flow Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<"confirm" | "loading" | "whatsapp">("confirm");

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setLoading(true);
      const [{ event: ev, registration: reg }, att] = await Promise.all([
        getEventDetailAction(id),
        getStudentEventAttendanceAction(id),
      ]);
      setEvent(ev);
      setRegistration(reg);
      setAttendances(att);
    } catch {
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  }

  function handleInitiateRegister() {
    setError("");
    setModalStep("confirm");
    setShowModal(true);
  }

  async function handleConfirmRegister() {
    if (!event) return;
    try {
      setActionLoading(true);
      setError("");
      setModalStep("loading");

      const result = await registerForEventAction(id, {
        title: event.title,
        category: event.category,
        date: event.date,
        whatsappInviteLink: event.whatsappInviteLink ?? null,
        registrationOpen: event.registrationOpen,
        maxParticipants: event.maxParticipants ?? null,
        registrationCount: event.registrationCount,
      });

      setSuccess(
        result.status === "WAITLISTED"
          ? "Added to waitlist!"
          : "Registered successfully!",
      );
      setRegistration({ id: "temp", status: result.status, eventId: id } as any);
      setEvent((prev) => prev ? { ...prev, registrationCount: prev.registrationCount + 1 } : prev);
      invalidateEvents();
      invalidateRegistrations();
      invalidateDashboard();

      // Transition after 2.2 seconds of animation
      setTimeout(() => {
        setModalStep("whatsapp");
      }, 2200);
    } catch (e: any) {
      setShowModal(false);
      setError(e.message || "Registration failed");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <Header role="student" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="h-8 w-48 bg-[hsl(var(--surface-2))] rounded-2xl animate-pulse" />
          <div className="bg-[hsl(var(--surface-2))] rounded-2xl h-64 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[hsl(var(--background))]">
        <Header role="student" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="font-semibold text-lg text-[hsl(var(--text-primary))]">Event not found</p>
        </div>
      </main>
    );
  }

  const isRegistered = registration?.status === "REGISTERED";
  const isWaitlisted = registration?.status === "WAITLISTED";
  const isCancelled = registration?.status === "CANCELLED" || !registration;

  return (
    <main className="min-h-screen bg-[hsl(var(--background))]">
      <Header role="student" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3 break-words">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm rounded-xl px-4 py-3 break-words">
            {success}
          </div>
        )}

        <div className="glass rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between gap-2 mb-4">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[event.status] || "bg-blue-500/10 text-blue-600"}`}
            >
              {event.status}
            </span>
            <span className="text-xs font-medium text-[hsl(var(--text-tertiary))] truncate">
              {event.category}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-[hsl(var(--text-primary))] mb-2 leading-tight break-words">
            {event.title}
          </h1>
          <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed mb-6 break-words">
            {event.description}
          </p>

          <div className="bg-[hsl(var(--surface))] rounded-xl px-4 py-3 border border-[hsl(var(--border))] mb-6">
            <p className="text-xs text-[hsl(var(--text-tertiary))] font-medium truncate">
              Date
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mt-0.5 truncate">
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Sessions if configured */}
          {event.sessions && event.sessions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-[hsl(var(--text-primary))] text-base mb-3">
                Sessions
              </h3>
              <div className="space-y-2">
                {event.sessions.map((s) => {
                  const isPresent = attendances.some((a) => a.sessionId === s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-[hsl(var(--surface))] rounded-xl px-4 py-3 border border-[hsl(var(--border))] gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-[hsl(var(--text-primary))] truncate block">
                          {s.title}
                        </span>
                        <span className="text-xs text-[hsl(var(--text-tertiary))] font-medium">
                          {s.startTime}
                        </span>
                      </div>

                      {/* Present / Absent Badge for registered students */}
                      {isRegistered ? (
                        isPresent ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 shrink-0">
                            Present
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 shrink-0">
                            Absent
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-[hsl(var(--text-tertiary))] font-medium shrink-0">
                          {s.startTime}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WhatsApp Badge for registered students in cartoonish neo-brutalist style */}
          {isRegistered && event.whatsappInviteLink && (
            <div className="mb-6 bg-[#25D366]/20 border-2 border-black rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
              <a
                href={event.whatsappInviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-[#25D366] group-hover:bg-[#128C7E] text-white border-2 border-black rounded-2xl flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#000] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all -rotate-3 group-hover:rotate-0">
                  <WhatsAppIcon className="w-8 h-8 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-block bg-[#25D366] text-white border border-black px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000] mb-1 -rotate-1">
                    Official Group 💬
                  </div>
                  <p className="text-xs sm:text-sm font-black text-[#051B1D] truncate group-hover:text-[#128C7E] transition-colors">
                    Join WhatsApp Group →
                  </p>
                  <p className="text-[11px] text-gray-700 font-bold truncate">
                    Get live updates & announcements
                  </p>
                </div>
              </a>
            </div>
          )}

          {/* Registration Actions */}
          {event.registrationOpen && isCancelled && (
            <button
              onClick={handleInitiateRegister}
              disabled={actionLoading}
              className="w-full bg-[hsl(var(--accent))] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
            >
              Register Now
            </button>
          )}

          {isWaitlisted && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium rounded-xl px-4 py-3 text-center">
              You are on the waitlist
            </div>
          )}

          {isRegistered && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium rounded-xl px-4 py-3 text-center">
              ✓ You are registered
            </div>
          )}

          {!event.registrationOpen && isCancelled && (
            <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-sm font-medium rounded-xl px-4 py-3 text-center">
              Registration is currently closed
            </div>
          )}
        </div>
      </div>

      {/* ── Registration Flow Modal Popup ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#F5F7F8] border-4 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_#000] text-center relative animate-scaleUp">
            {modalStep === "confirm" ? (
              <div className="py-2 space-y-4">
                {/* Cartoonish Warning Sticker Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFE600] border-3 border-black rounded-3xl rotate-6 shadow-[3px_3px_0px_#000] text-3xl mx-auto mb-1">
                  ⚠️
                </div>

                <div>
                  <div className="inline-block bg-[#FF5E5B] text-white border-2 border-black px-3.5 py-0.5 rounded-full font-black text-[11px] uppercase tracking-widest -rotate-2 shadow-[2px_2px_0px_#000] mb-2">
                    Permanent Action
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#051B1D] uppercase tracking-tight leading-none mb-2 font-mono drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
                    Can&apos;t Change After!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-800 font-bold max-w-xs mx-auto">
                    Once you register, your slot is locked in and cannot be cancelled or modified.
                  </p>
                </div>

                {/* Action Buttons in Website's Neo-Brutalist Style */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleConfirmRegister}
                    disabled={actionLoading}
                    className="w-full bg-[#00666B] hover:bg-[#004f53] text-white border-2 border-black rounded-2xl px-5 py-3.5 sm:py-4 font-black text-sm sm:text-base shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Confirm Registration →
                  </button>

                  <button
                    onClick={() => setShowModal(false)}
                    disabled={actionLoading}
                    className="w-full bg-[#c8c8c8] hover:bg-[#b8b8b8] text-[#051B1D] border-2 border-black rounded-2xl px-5 py-3 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            ) : modalStep === "loading" ? (
              <div className="py-6 space-y-5">
                {/* Animated Spinner Ring */}
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-[#051B1D] border-t-transparent rounded-full animate-spin" />
                  <span className="absolute text-xl">⏳</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#051B1D]">
                  Wait, you are not yet done...
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 font-bold">
                  Finalizing your event registration details...
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-5">
                {event.whatsappInviteLink ? (
                  <div className="relative inline-flex flex-col items-center mx-auto">
                    {/* Animated Cartoon "Click Me!" Sticker */}
                    <div className="absolute -top-3 -right-7 sm:-right-9 z-10 animate-bounce pointer-events-none">
                      <div className="bg-[#FFE600] text-[#051B1D] border-2 border-black px-2.5 py-0.5 rounded-full font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] rotate-12 flex items-center gap-1 whitespace-nowrap">
                        <span>Click Me!</span>
                        <span className="text-xs">👇</span>
                      </div>
                    </div>

                    <a
                      href={event.whatsappInviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-col items-center group cursor-pointer transition-transform hover:scale-105"
                    >
                      <div className="w-20 h-20 bg-[#25D366] hover:bg-[#128C7E] text-white border-4 border-black rounded-3xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000] group-hover:shadow-[2px_2px_0px_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all -rotate-3 group-hover:rotate-0">
                        <WhatsAppIcon className="w-11 h-11 fill-white" />
                      </div>
                      <span className="mt-2.5 inline-block bg-[#25D366] text-white border-2 border-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] rotate-1">
                        Tap to Join Group 💬
                      </span>
                    </a>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-[#25D366] text-white border-4 border-black rounded-3xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_#000] -rotate-3">
                    <WhatsAppIcon className="w-11 h-11 fill-white" />
                  </div>
                )}

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#051B1D]">
                    Registration Confirmed!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-800 font-medium mt-1">
                    {event.whatsappInviteLink
                      ? "Join the official WhatsApp group for live updates, announcements, and coordination."
                      : "You are all set for this event!"}
                  </p>
                </div>

                {event.whatsappInviteLink ? (
                  <div className="space-y-3 pt-2">
                    <a
                      href={event.whatsappInviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white border-2 border-black rounded-2xl px-5 py-4 font-black text-sm sm:text-base shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all cursor-pointer"
                    >
                      <WhatsAppIcon className="w-6 h-6 fill-white shrink-0" />
                      Join WhatsApp Group
                    </a>

                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full bg-[#F5F7F8] text-gray-800 border-2 border-black rounded-xl px-4 py-2.5 font-bold text-xs hover:bg-[#b8b8b8] transition-all cursor-pointer"
                    >
                      I&apos;ll join later
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-[#00666B] text-white border-2 border-black rounded-2xl px-5 py-3.5 font-black text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}