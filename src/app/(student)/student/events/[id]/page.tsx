"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/user-store";
import {
  getEventByIdAction,
  getStudentRegistrationAction,
  registerForEventAction,
} from "@/actions/event";
import type { Event, Registration } from "@/types";

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
  const { invalidateEvents, invalidateRegistrations } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
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
      const [ev, reg] = await Promise.all([
        getEventByIdAction(id),
        getStudentRegistrationAction(id),
      ]);
      setEvent(ev);
      setRegistration(reg);
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
    try {
      setActionLoading(true);
      setError("");
      setModalStep("loading");

      const result = await registerForEventAction(id);
      setSuccess(
        result.status === "WAITLISTED"
          ? "Added to waitlist!"
          : "Registered successfully!",
      );
      invalidateEvents();
      invalidateRegistrations();
      await fetchData();

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
      <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-gray-400 rounded-xl animate-pulse" />
          <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-6 h-64 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#D3D3D3] flex items-center justify-center p-4">
        <p className="font-bold text-[#051B1D]">Event not found</p>
      </main>
    );
  }

  const isRegistered = registration?.status === "REGISTERED";
  const isWaitlisted = registration?.status === "WAITLISTED";
  const isCancelled = registration?.status === "CANCELLED" || !registration;

  return (
    <main className="min-h-screen bg-[#D3D3D3] px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm font-bold text-[#051B1D] hover:text-[#00666B] transition-colors"
        >
          ← Back
        </button>

        {error && (
          <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold break-words">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border-2 border-green-600 rounded-xl px-4 py-3 text-green-800 text-xs sm:text-sm font-bold break-words">
            {success}
          </div>
        )}

        <div className="bg-[#D3D3D3] border-2 border-black rounded-2xl p-4 sm:p-6 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] mb-4">
          <div className="flex items-start justify-between gap-2 mb-4">
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-[#73FFFF] text-[#051B1D] border border-black">
              {event.status}
            </span>
            <span className="text-xs text-gray-800 font-bold truncate">
              {event.category}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#051B1D] mb-2 leading-tight break-words">
            {event.title}
          </h1>
          <p className="text-gray-800 text-xs sm:text-sm leading-relaxed mb-6 break-words font-medium">
            {event.description}
          </p>

          <div className="bg-[#c8c8c8] border-2 border-black rounded-xl p-2.5 sm:p-3 mb-6">
            <p className="text-[10px] sm:text-xs text-gray-700 font-bold truncate">
              Date
            </p>
            <p className="text-xs sm:text-sm font-black text-[#051B1D] truncate">
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
              <h3 className="font-black text-[#051B1D] text-sm sm:text-base mb-3">
                Sessions
              </h3>
              <div className="space-y-2">
                {event.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-[#c8c8c8] border-2 border-black rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 gap-2"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#051B1D] truncate">
                      {s.title}
                    </span>
                    <span className="text-xs font-bold text-gray-700 shrink-0">
                      {s.startTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Button for registered students in WhatsApp Green #25D366 */}
          {isRegistered && event.whatsappInviteLink && (
            <a
              href={event.whatsappInviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white border-2 border-black rounded-xl px-4 py-3.5 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all mb-3"
            >
              <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
              Join WhatsApp Group
            </a>
          )}

          {/* Registration Actions */}
          {event.registrationOpen && isCancelled && (
            <button
              onClick={handleInitiateRegister}
              disabled={actionLoading}
              className="w-full bg-[#00666B] text-white border-2 border-black rounded-xl px-4 py-3 font-black text-xs sm:text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50 cursor-pointer"
            >
              Register Now
            </button>
          )}

          {isWaitlisted && (
            <div className="bg-yellow-100 border-2 border-yellow-600 rounded-xl px-4 py-3 text-yellow-900 text-xs sm:text-sm font-bold text-center">
              You are on the waitlist
            </div>
          )}

          {isRegistered && (
            <div className="bg-green-100 border-2 border-green-600 rounded-xl px-4 py-3 text-green-900 text-xs sm:text-sm font-bold text-center">
              ✓ You are registered
            </div>
          )}

          {!event.registrationOpen && isCancelled && (
            <div className="bg-gray-200 border-2 border-gray-500 rounded-xl px-4 py-3 text-gray-800 text-xs sm:text-sm font-bold text-center">
              Registration is currently closed
            </div>
          )}
        </div>
      </div>

      {/* ── Registration Flow Modal Popup ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#D3D3D3] border-4 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[6px_6px_0px_#000] text-center relative animate-scaleUp">
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
                <div className="w-16 h-16 bg-[#25D366] text-white border-2 border-black rounded-full flex items-center justify-center text-3xl mx-auto shadow-[3px_3px_0px_#000]">
                  <WhatsAppIcon className="w-9 h-9 fill-white" />
                </div>

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
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white border-2 border-black rounded-2xl px-5 py-4 font-black text-sm sm:text-base shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                      <WhatsAppIcon className="w-6 h-6 fill-white shrink-0" />
                      Join the WhatsApp Group
                    </a>

                    <button
                      onClick={() => setShowModal(false)}
                      className="w-full bg-[#D3D3D3] text-gray-800 border-2 border-black rounded-xl px-4 py-2.5 font-bold text-xs hover:bg-[#b8b8b8] transition-all"
                    >
                      I&apos;ll join later
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-[#00666B] text-white border-2 border-black rounded-2xl px-5 py-3.5 font-black text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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