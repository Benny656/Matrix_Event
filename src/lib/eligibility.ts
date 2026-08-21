import type { Event } from "@/types"

export function buildEventEligibilityTokens(eligibility: Event["eligibility"]): string[] {
  const tokens: string[] = []
  if (eligibility.targetAudience === "ALL") tokens.push("AUDIENCE_ALL")
  if (eligibility.targetAudience === "STUDENTS" || eligibility.targetAudience === "ALL") tokens.push("AUDIENCE_STUDENTS")
  if (eligibility.targetAudience === "FACULTY") tokens.push("AUDIENCE_FACULTY")
  if (eligibility.degrees) eligibility.degrees.forEach((d) => tokens.push(`DEG_${d}`))
  if (eligibility.years) {
    eligibility.years.forEach((y) => {
      if (y === "ALL") {
        tokens.push("YR_1", "YR_2", "YR_3", "YR_4")
      } else {
        const yr = y.replace(" Year", "").replace("1st", "1").replace("2nd", "2").replace("3rd", "3").replace("4th", "4")
        tokens.push(`YR_${yr}`)
      }
    })
  }
  if (eligibility.departments) eligibility.departments.forEach((d) => tokens.push(`DEPT_${d}`))
  return [...new Set(tokens)]
}
