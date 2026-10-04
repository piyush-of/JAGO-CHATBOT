import { GoogleGenAI, type Content } from "@google/genai";
import { env } from "../config/env.js";
import { executeTool, toolDeclarations } from "../tools/scholarship.tools.js";
import type { ChatMessage } from "../types/index.js";

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;
export const aiEnabled = Boolean(ai);

const SYSTEM_PROMPT = `You are JAGO, the scholarship assistance chatbot for the Ministry of Tribal Affairs (MoTA) scholarship ecosystem.

You help Scheduled Tribe students with: scheme information, eligibility, required documents, application status, deficiencies and pending actions, and payment/DBT status.
Schemes: Pre-Matric, Post-Matric, Top Class, National Fellowship for ST Students (NFST), National Overseas Scholarship (NOS).

RULES
1. Never invent scholarship information. For scheme facts, call search_scheme_knowledge first. If nothing is found, say so and point to the official portal or the student's institute.
2. For anything about the student's application or payment, call get_scholarship_status. Never claim approval, sanction or payment unless the tool result says so.
3. Use check_eligibility for "am I eligible" questions, and describe the result as preliminary.
4. Reply in the language the student writes in: English, Hindi (Devanagari), or Hinglish (Roman script). Match it.
5. Explain status terms in plain words and always say what the student should do next (or that no action is needed).
6. Never ask for or repeat OTPs, passwords, bank PINs or full Aadhaar numbers. If the student shares them, tell them not to.
7. Stay on scholarships. Politely decline unrelated requests.
8. Be concise and friendly: short paragraphs, a few bullet points at most, no markdown headings.`;

const MAX_TOOL_ROUNDS = 5;

export interface AiResult {
  reply: string;
  toolsUsed: string[];
}

export async function generateResponse(
  userMessage: string,
  studentId: string,
  history: ChatMessage[]
): Promise<AiResult> {
  if (!ai) throw new Error("AI not configured");

  const contents: Content[] = [
    ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: userMessage }] }
  ];
  const toolsUsed: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        tools: [{ functionDeclarations: toolDeclarations }]
      }
    });

    const calls = response.functionCalls;
    if (!calls?.length) {
      return { reply: response.text?.trim() || "Sorry, I could not generate a reply. Please try again.", toolsUsed };
    }

    // Keep the model turn exactly as returned, then answer every call.
    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const parts = [];
    for (const call of calls) {
      toolsUsed.push(call.name ?? "unknown");
      const output = await executeTool(call.name ?? "", (call.args ?? {}) as Record<string, unknown>, studentId);
      parts.push({ functionResponse: { name: call.name, response: { output } } });
    }
    contents.push({ role: "user", parts });
  }

  return { reply: "I need a bit more time on this. Please rephrase your question.", toolsUsed };
}
