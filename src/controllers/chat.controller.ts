import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getStudent } from "../services/student.service.js";
import { getScholarshipStatus } from "../services/scholarship.service.js";
import { aiEnabled, generateResponse } from "../services/ai.service.js";
import { fallbackReply } from "../services/fallback.service.js";
import { getHistory, saveTurn } from "../services/session.service.js";
import { redactSensitive } from "../services/safety.service.js";

const bodySchema = z.object({
  studentId: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().trim().min(8).max(80).optional()
});

export async function chatController(req: Request, res: Response) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "studentId and message are required", issues: parsed.error.flatten().fieldErrors });
  }
  const { studentId, sessionId = randomUUID() } = parsed.data;
  const { text: message, redacted } = redactSensitive(parsed.data.message);

  try {
    const student = await getStudent(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    let reply: string;
    let toolsUsed: string[] = [];
    let mode: "ai" | "fallback" = "ai";

    try {
      if (!aiEnabled) throw new Error("no-ai");
      ({ reply, toolsUsed } = await generateResponse(message, studentId, getHistory(sessionId, studentId)));
    } catch (err) {
      if ((err as Error).message !== "no-ai") console.error("[ai] falling back:", err);
      mode = "fallback";
      reply = await fallbackReply(message, student);
    }

    if (redacted) reply += "\n\nFor your safety, please never share OTPs or your full Aadhaar number in chat.";
    saveTurn(sessionId, studentId, message, reply);

    const apps = await getScholarshipStatus(studentId);
    return res.json({
      success: true,
      data: { reply, sessionId, studentId, mode, toolsUsed, context: { scholarshipCount: apps.length } }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "JAGO encountered an internal error" });
  }
}
