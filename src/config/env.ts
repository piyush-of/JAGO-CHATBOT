import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  geminiEmbedModel: process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001",
  jagoApiKey: process.env.JAGO_API_KEY || "",
  corsOrigins: (process.env.CORS_ORIGINS || "*").split(",").map((s) => s.trim()),
  rateLimitPerMin: Number(process.env.RATE_LIMIT_PER_MIN) || 30,
  isProd: process.env.NODE_ENV === "production"
};
