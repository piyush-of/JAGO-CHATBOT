import type { ChatMessage } from "../types/index.js";

// In-memory for the prototype. Swap for PostgreSQL/Redis in production.
const MAX_TURNS = 12;
const TTL_MS = 30 * 60 * 1000;
const sessions = new Map<string, { studentId: string; messages: ChatMessage[]; touched: number }>();

export function getHistory(sessionId: string, studentId: string): ChatMessage[] {
  const s = sessions.get(sessionId);
  // A session id can never leak history across students.
  return s && s.studentId === studentId ? s.messages : [];
}

export function saveTurn(sessionId: string, studentId: string, user: string, model: string) {
  const prev = getHistory(sessionId, studentId);
  const now = Date.now();
  const messages = [...prev, { role: "user" as const, text: user, at: now }, { role: "model" as const, text: model, at: now }]
    .slice(-MAX_TURNS * 2);
  sessions.set(sessionId, { studentId, messages, touched: now });
}

setInterval(() => {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, s] of sessions) if (s.touched < cutoff) sessions.delete(id);
}, 5 * 60 * 1000).unref();
