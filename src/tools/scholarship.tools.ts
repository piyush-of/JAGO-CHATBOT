import { Type, type FunctionDeclaration } from "@google/genai";
import { getStudent } from "../services/student.service.js";
import { getScholarshipStatus } from "../services/scholarship.service.js";
import { searchKnowledge } from "../services/rag.service.js";
import { checkEligibility, SCHEMES } from "../services/eligibility.service.js";
import type { Scheme } from "../types/index.js";

// Student identity is bound server-side. The model can never pass a studentId,
// so it cannot be tricked into reading another student's data.
export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_student_profile",
    description: "Get the current student's profile (course, level, state, category, family income).",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "get_scholarship_status",
    description:
      "Get the current student's live scholarship applications: status, deficiency remarks and payment/DBT status. Use for any question about application or payment status.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "search_scheme_knowledge",
    description:
      "Search official scheme guidelines for eligibility, documents, process, benefits and FAQs. Use before answering any scheme-information question.",
    parameters: {
      type: Type.OBJECT,
      properties: { query: { type: Type.STRING, description: "Search query in English" } },
      required: ["query"]
    }
  },
  {
    name: "check_eligibility",
    description: "Run a preliminary eligibility check of the current student for a scheme.",
    parameters: {
      type: Type.OBJECT,
      properties: { scheme: { type: Type.STRING, enum: SCHEMES, description: "Scheme id" } },
      required: ["scheme"]
    }
  }
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  studentId: string
): Promise<Record<string, unknown>> {
  try {
    switch (name) {
      case "get_student_profile": {
        const s = await getStudent(studentId);
        return s ? { success: true, data: s } : { success: false, message: "Student not found" };
      }
      case "get_scholarship_status":
        return { success: true, data: await getScholarshipStatus(studentId) };
      case "search_scheme_knowledge": {
        const results = await searchKnowledge(String(args.query ?? ""));
        return results.length
          ? { success: true, data: results }
          : { success: false, message: "No matching guideline found. Do not guess; refer to the official portal." };
      }
      case "check_eligibility": {
        const scheme = String(args.scheme) as Scheme;
        if (!SCHEMES.includes(scheme)) return { success: false, message: "Unknown scheme" };
        const s = await getStudent(studentId);
        return s ? { success: true, data: checkEligibility(scheme, s) } : { success: false, message: "Student not found" };
      }
      default:
        return { success: false, message: `Unknown tool ${name}` };
    }
  } catch (err) {
    console.error(`[tool:${name}]`, err);
    return { success: false, message: "Tool failed" };
  }
}
