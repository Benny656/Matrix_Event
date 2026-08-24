import { create } from "zustand"
import type { User, Event, Registration, Attendance, RegisteredStudent } from "@/types"

interface Paginated<T> {
  items: T[]
  lastId: string | null
  hasMore: boolean
}

interface Store {
  user: User | null
  setUser: (user: User | null) => void

  dashboardData: { user: any; registrations: Registration[]; upcomingEvents: any[] } | null
  setDashboardData: (data: { user: any; registrations: Registration[]; upcomingEvents: any[] }) => void
  invalidateDashboard: () => void

  adminDashboardData: { activeEvents: any[]; totalUsers: number } | null
  setAdminDashboardData: (data: { activeEvents: any[]; totalUsers: number } | null) => void
  invalidateAdminDashboard: () => void

  volunteerEvents: any[] | null
  setVolunteerEvents: (events: any[] | null) => void
  invalidateVolunteerEvents: () => void

  userSearchCache: { query: string; results: any[] } | null
  setUserSearchCache: (cache: { query: string; results: any[] } | null) => void

  events: Paginated<Event>
  setEvents: (items: Event[], lastId: string | null, hasMore: boolean) => void
  appendEvents: (items: Event[], lastId: string | null, hasMore: boolean) => void
  invalidateEvents: () => void

  registrations: Paginated<Registration>
  setRegistrations: (items: Registration[], lastId: string | null, hasMore: boolean) => void
  appendRegistrations: (items: Registration[], lastId: string | null, hasMore: boolean) => void
  invalidateRegistrations: () => void

  attendances: Attendance[]
  setAttendances: (items: Attendance[]) => void
  invalidateAttendances: () => void

  adminUsers: Paginated<User>
  setAdminUsers: (items: User[], lastId: string | null, hasMore: boolean) => void
  appendAdminUsers: (items: User[], lastId: string | null, hasMore: boolean) => void
  invalidateAdminUsers: () => void

  scannerStudents: RegisteredStudent[]
  scannedIds: Set<string>
  setScannerStudents: (students: RegisteredStudent[]) => void
  markScanned: (studentId: string) => void
  clearScanner: () => void
}

const empty = <T>(): Paginated<T> => ({ items: [], lastId: null, hasMore: true })

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),
  invalidateDashboard: () => set({ dashboardData: null }),

  adminDashboardData: null,
  setAdminDashboardData: (data) => set({ adminDashboardData: data }),
  invalidateAdminDashboard: () => set({ adminDashboardData: null }),

  volunteerEvents: null,
  setVolunteerEvents: (volunteerEvents) => set({ volunteerEvents }),
  invalidateVolunteerEvents: () => set({ volunteerEvents: null }),

  userSearchCache: null,
  setUserSearchCache: (userSearchCache) => set({ userSearchCache }),

  events: empty(),
  setEvents: (items, lastId, hasMore) => set({ events: { items, lastId, hasMore } }),
  appendEvents: (items, lastId, hasMore) =>
    set((s) => ({ events: { items: [...s.events.items, ...items], lastId, hasMore } })),
  invalidateEvents: () => set({ events: empty() }),

  registrations: empty(),
  setRegistrations: (items, lastId, hasMore) => set({ registrations: { items, lastId, hasMore } }),
  appendRegistrations: (items, lastId, hasMore) =>
    set((s) => ({ registrations: { items: [...s.registrations.items, ...items], lastId, hasMore } })),
  invalidateRegistrations: () => set({ registrations: empty() }),

  attendances: [],
  setAttendances: (items) => set({ attendances: items }),
  invalidateAttendances: () => set({ attendances: [] }),

  adminUsers: empty(),
  setAdminUsers: (items, lastId, hasMore) => set({ adminUsers: { items, lastId, hasMore } }),
  appendAdminUsers: (items, lastId, hasMore) =>
    set((s) => ({ adminUsers: { items: [...s.adminUsers.items, ...items], lastId, hasMore } })),
  invalidateAdminUsers: () => set({ adminUsers: empty() }),

  scannerStudents: [],
  scannedIds: new Set(),
  setScannerStudents: (students) => set({ scannerStudents: students, scannedIds: new Set() }),
  markScanned: (studentId) =>
    set((s) => ({ scannedIds: new Set([...s.scannedIds, studentId]) })),
  clearScanner: () => set({ scannerStudents: [], scannedIds: new Set() }),
}))