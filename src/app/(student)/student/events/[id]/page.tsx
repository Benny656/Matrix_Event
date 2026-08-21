"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useStore } from "@/store/user-store"
import { getEventByIdAction, getStudentRegistrationAction, registerForEventAction, cancelRegistrationAction } from "@/actions/event"
import type { Event, Registration } from "@/types"

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { invalidateEvents, invalidateRegistrations } = useStore()
  const [event, setEvent] = useState<Event | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      setLoading(true)
      const [ev, reg] = await Promise.all([
        getEventByIdAction(id),
        getStudentRegistrationAction(id),
      ])
      setEvent(ev)
      setRegistration(reg)
    } catch {
      setError("Failed to load event")
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister() {
    try {
      setActionLoading(true)
      setError("")
      const result = await registerForEventAction(id)
      setSuccess(result.status === "WAITLISTED" ? "Added to waitlist!" : "Registered successfully!")
      invalidateEvents()
      invalidateRegistrations()
      fetchData()
    } catch (e: any) {
      setError(e.message || "Registration failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!registration) return
    try {
      setActionLoading(true)
      setError("")
      await cancelRegistrationAction(registration.id, id)
      setSuccess("Registration cancelled")
      invalidateEvents()
      invalidateRegistrations()
      fetchData()
    } catch {
      setError("Failed to cancel registration")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded-xl animate-pulse" />
          <div className="bg-white border-2 border-black rounded-2xl p-6 h-64 animate-pulse" />
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#f0faf8] flex items-center justify-center">
        <p className="font-bold text-black">Event not found</p>
      </main>
    )
  }

  const isRegistered = registration?.status === "REGISTERED"
  const isWaitlisted = registration?.status === "WAITLISTED"
  const isCancelled = registration?.status === "CANCELLED" || !registration

  return (
    <main className="min-h-screen bg-[#f0faf8] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-black hover:text-[#0d9488] transition-colors"
        >
          ← Back
        </button>

        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-2 border-green-400 rounded-xl px-4 py-3 text-green-600 text-sm font-medium">
            {success}
          </div>
        )}

        <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000] mb-4">
          <div className="flex items-start justify-between gap-2 mb-4">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#0d9488] text-white">
              {event.status}
            </span>
            <span className="text-xs text-gray-400 font-medium">{event.category}</span>
          </div>

          <h1 className="text-2xl font-black text-black mb-2">{event.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{event.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Coordinator", value: event.coordinatorName },
              { label: "Registered", value: `${event.registrationCount}${event.maxParticipants ? ` / ${event.maxParticipants}` : ""}` },
              { label: "Category", value: event.category },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#f0faf8] border-2 border-black rounded-xl p-3">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-sm font-bold text-black">{value}</p>
              </div>
            ))}
          </div>

          {event.sessions && event.sessions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-black text-black mb-3">Sessions</h3>
              <div className="space-y-2">
                {event.sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-[#f0faf8] border-2 border-black rounded-xl px-4 py-3">
                    <span className="text-sm font-bold text-black">{s.title}</span>
                    <span className="text-xs text-gray-500">{new Date(s.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isRegistered && event.whatsappInviteLink && (
            <a
              href={event.whatsappInviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-500 text-white border-2 border-black rounded-xl px-4 py-3 font-bold text-sm shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all mb-3"
            >
              Join WhatsApp Group
            </a>
          )}

          {event.registrationOpen && isCancelled && (
            <button
              onClick={handleRegister}
              disabled={actionLoading}
              className="w-full bg-[#0d9488] text-white border-2 border-black rounded-xl px-4 py-3 font-bold shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all disabled:opacity-50"
            >
              {actionLoading ? "Registering..." : "Register Now"}
            </button>
          )}

          {isWaitlisted && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl px-4 py-3 text-yellow-700 text-sm font-bold text-center">
              You are on the waitlist
            </div>
          )}

          {isRegistered && (
            <div className="space-y-3">
              <div className="bg-green-50 border-2 border-green-400 rounded-xl px-4 py-3 text-green-700 text-sm font-bold text-center">
                ✓ You are registered
              </div>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="w-full bg-white text-red-500 border-2 border-red-400 rounded-xl px-4 py-3 font-bold hover:bg-red-50 transition-all disabled:opacity-50"
              >
                {actionLoading ? "Cancelling..." : "Cancel Registration"}
              </button>
            </div>
          )}

          {!event.registrationOpen && isCancelled && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-500 text-sm font-bold text-center">
              Registration is closed
            </div>
          )}
        </div>
      </div>
    </main>
  )
}