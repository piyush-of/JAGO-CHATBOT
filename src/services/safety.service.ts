// Redact sensitive identifiers before text reaches the model or the logs.
export function redactSensitive(text: string): { text: string; redacted: boolean } {
  let redacted = false;
  const out = text
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, () => { redacted = true; return "[AADHAAR REDACTED]"; })
    .replace(/\b(?:otp|ओटीपी)\D{0,10}\d{4,8}\b/gi, () => { redacted = true; return "[OTP REDACTED]"; });
  return { text: out, redacted };
}
