import { create } from "zustand"

type EventData = {
  id: string
  title: string
  registrationCount: number
  [key: string]: any
}

interface EventStore {
  events: Record<string, EventData>
  lastId: string | null
  hasMore: boolean

  /** Hydrate (or replace) the store with a fresh page of server data. */
  setInitialEvents: (events: EventData[], lastId?: string | null, hasMore?: boolean) => void

  /** Append the next page of events (for "load more"). */
  appendEvents: (events: EventData[], lastId: string | null, hasMore: boolean) => void

  /** Put or update a single event in the cache */
  setSingleEvent: (event: EventData) => void

  /** Update partial event fields in cache (e.g. status, registrationOpen, registrationCount) */
  updateEvent: (eventId: string, data: Partial<EventData>) => void

  /** Instantly update a single event's registration count in the client cache. */
  updateRegistrationCount: (eventId: string, newCount: number) => void

  /** Wipe the cache so the next mount re-fetches fresh data. */
  invalidate: () => void
}

export const useEventStore = create<EventStore>((set) => ({
  events: {},
  lastId: null,
  hasMore: true,

  setInitialEvents: (eventsArray, lastId = null, hasMore = false) =>
    set(() => {
      const eventsMap: Record<string, EventData> = {}
      eventsArray.forEach((evt) => {
        eventsMap[evt.id] = evt
      })
      return { events: eventsMap, lastId: lastId ?? null, hasMore: !!hasMore }
    }),

  appendEvents: (eventsArray, lastId, hasMore) =>
    set((state) => {
      const next = { ...state.events }
      eventsArray.forEach((evt) => {
        next[evt.id] = evt
      })
      return { events: next, lastId, hasMore }
    }),

  setSingleEvent: (event) =>
    set((state) => ({
      events: {
        ...state.events,
        [event.id]: {
          ...(state.events[event.id] || {}),
          ...event,
        },
      },
    })),

  updateEvent: (eventId, data) =>
    set((state) => {
      const existing = state.events[eventId]
      if (!existing) return state
      return {
        events: {
          ...state.events,
          [eventId]: {
            ...existing,
            ...data,
          },
        },
      }
    }),

  updateRegistrationCount: (eventId, newCount) =>
    set((state) => {
      const event = state.events[eventId]
      if (!event) return state
      return {
        events: {
          ...state.events,
          [eventId]: { ...event, registrationCount: newCount },
        },
      }
    }),

  invalidate: () => set({ events: {}, lastId: null, hasMore: true }),
}))
