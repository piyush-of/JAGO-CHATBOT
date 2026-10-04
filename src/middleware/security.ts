import type { NextFunction, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  if (!env.jagoApiKey) return next(); // dev mode only
  const provided = Buffer.from(String(req.header("x-jago-api-key") ?? ""));
  const expected = Buffer.from(env.jagoApiKey);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return res.status(401).json({ success: false, message: "Invalid or missing API key" });
  }
  next();
}

// Small fixed-window limiter per student/IP. Use Redis-backed limiting when scaled out.
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = String(req.body?.studentId ?? req.ip);
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { count: 1, reset: now + 60_000 });
    return next();
  }
  if (++h.count > env.rateLimitPerMin) {
    return res.status(429).json({ success: false, message: "Too many requests. Please wait a minute." });
  }
  next();
}
