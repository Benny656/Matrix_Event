import type { Event } from "@/types"

export function buildFacultyEligibilityTokens(): string[] {
  return ["AUDIENCE_ALL", "AUDIENCE_FACULTY"]
}

export function buildEventEligibilityTokens(eligibility?: Event["eligibility"]): string[] {
  if (!eligibility) {
    return ["AUDIENCE_ALL", "AUDIENCE_STUDENTS", "AUDIENCE_FACULTY"]
  }

  const tokens: string[] = []
  if (eligibility.targetAudience === "ALL") {
    tokens.push("AUDIENCE_ALL", "AUDIENCE_STUDENTS", "AUDIENCE_FACULTY")
  }
  if (eligibility.targetAudience === "STUDENTS") {
    tokens.push("AUDIENCE_STUDENTS")
  }
  if (eligibility.targetAudience === "FACULTY") {
    tokens.push("AUDIENCE_FACULTY")
  }
  if (eligibility.degrees) eligibility.degrees.forEach((d) => tokens.push(`DEG_${d}`))
  if (eligibility.years) {
    eligibility.years.forEach((y) => {
      if (y === "ALL" || y === "All Years") {
        tokens.push("YR_1", "YR_2", "YR_3", "YR_4")
      } else {
        const yr = y.replace(" Year", "").replace("1st", "1").replace("2nd", "2").replace("3rd", "3").replace("4th", "4")
        tokens.push(`YR_${yr}`)
      }
    })
  }
  return [...new Set(tokens)]
}
