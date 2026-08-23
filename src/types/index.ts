export interface User {
  id: string
  name: string
  email: string
  rollNumber: string | null
  phoneNumber: string | null
  department: string | null
  programType: string | null
  degree: string | null
  yearOfStudy: string | null
  role: "STUDENT" | "VOLUNTEER" | "ADMIN"
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string | null
}

export interface Event {
  id: string
  title: string
  description: string
  posterUrl: string | null
  date: string
  venue?: string | null
  category: string
  coordinatorName?: string | null
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "ARCHIVED"
  registrationOpen: boolean
  maxParticipants?: number | null
  registrationCount: number
  eligibility?: {
    targetAudience: string
    degrees: string[] | null
    years: string[] | null
    departments: string[] | null
  }
  eligibilityTokens?: string[]
  sessions?: { id: string; title: string; startTime: string; endTime?: string | null }[]
  whatsappInviteLink?: string | null
  createdById?: string
  createdAt: string
  updatedAt?: string
}

export interface Session {
  id: string
  eventId: string
  title: string
  startTime: string
  endTime: string | null
  createdAt: string
  updatedAt: string | null
}

export interface Registration {
  id: string
  eventId: string
  studentId: string
  status: "REGISTERED" | "WAITLISTED" | "CANCELLED"
  eventRole: "participant" | "volunteer"
  participantRole: string
  studentName: string
  email: string
  rollNumber: string | null
  department: string | null
  eventTitle: string
  eventCategory: string
  eventDate: string
  whatsappInviteLink: string | null
  createdAt: string
  updatedAt: string | null
}

export interface Attendance {
  id: string
  sessionId: string
  studentId: string
  studentName: string
  rollNumber: string
  department: string
  yearOfStudy: string
  programType: string
  checkInTime: string
  checkInMethod: "SCANNED" | "MANUAL"
  markedById: string
  createdAt: string
}

export interface Update {
  id: string
  content: string
  authorId: string
  createdAt: string
}

export interface RegisteredStudent {
  studentId: string
  studentName: string
  rollNumber: string | null
  department: string | null
  yearOfStudy: string | null
  programType: string | null
  email: string
  registrationId: string
}