import { getScholarshipStatus } from "./scholarship.service.js";
import { searchKnowledge } from "./rag.service.js";
import type { StudentProfile } from "../types/index.js";

// Offline demo mode (no Gemini key) and last-resort fallback if the model call fails.
export async function fallbackReply(message: string, student: StudentProfile) {
  const m = message.toLowerCase();
  const hindi = /[\u0900-\u097F]/.test(message);
  const hinglish = /\b(meri|mera|kya|hai|kab|kaise|nahi|paisa|scholarship ka)\b/i.test(message);

  if (/status|स्थिति|payment|paisa|पैसा|dbt|kab|कब|application/.test(m)) {
    const apps = await getScholarshipStatus(student.id);
    if (!apps.length) return "I could not find any scholarship application for you yet.";
    const lines = apps.map(
      (a) => `${a.scheme} (${a.applicationId}): ${a.status}. Payment: ${a.paymentStatus}.` + (a.deficiency ? ` Action needed: ${a.deficiency}` : "")
    );
    const intro = hindi || hinglish ? "Aapki application ki jaankari:" : "Here is your application status:";
    return `${intro}\n${lines.join("\n")}`;
  }

  const hits = await searchKnowledge(message, 1);
  if (hits.length) return hits[0].content;
  return "I can help with scheme eligibility, documents, application status and payments. Please ask about one of these.";
}
