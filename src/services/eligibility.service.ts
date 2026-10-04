import type { Scheme, StudentProfile } from "../types/index.js";

// SAMPLE RULES: confirm every ceiling and level against current official guidelines.
const RULES: Record<Scheme, { label: string; incomeCeilingLakh?: number; levels: StudentProfile["level"][] }> = {
  "pre-matric": { label: "Pre-Matric Scholarship", incomeCeilingLakh: 2.5, levels: ["School"] },
  "post-matric": { label: "Post-Matric Scholarship", incomeCeilingLakh: 2.5, levels: ["UG", "PG", "PhD"] },
  "top-class": { label: "Top Class Scholarship", incomeCeilingLakh: 6, levels: ["UG", "PG"] },
  nfst: { label: "National Fellowship for ST Students", levels: ["PhD"] },
  nos: { label: "National Overseas Scholarship", incomeCeilingLakh: 6, levels: ["PG", "PhD"] }
};

export function checkEligibility(scheme: Scheme, s: StudentProfile) {
  const rule = RULES[scheme];
  const reasons: string[] = [];
  let eligible = true;

  if (s.category !== "ST") { eligible = false; reasons.push("Scheme is for Scheduled Tribe students."); }
  if (!rule.levels.includes(s.level)) {
    eligible = false;
    reasons.push(`Scheme targets ${rule.levels.join("/")} students; student is at ${s.level} level.`);
  }
  if (rule.incomeCeilingLakh !== undefined && s.annualFamilyIncomeLakh > rule.incomeCeilingLakh) {
    eligible = false;
    reasons.push(`Family income Rs ${s.annualFamilyIncomeLakh} lakh exceeds the Rs ${rule.incomeCeilingLakh} lakh ceiling.`);
  }
  if (scheme === "nfst") reasons.push("Also needs a qualifying national test (e.g. NET-JRF); cannot be verified automatically.");
  if (scheme === "top-class") reasons.push("Institution must be on the notified top-class list; cannot be verified automatically.");

  return {
    scheme: rule.label,
    likelyEligible: eligible,
    reasons,
    note: "Preliminary check only. Final eligibility is decided by the official portal and verifying authorities."
  };
}

export const SCHEMES = Object.keys(RULES) as Scheme[];
