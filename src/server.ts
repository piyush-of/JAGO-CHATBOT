import app from "./app.js";
import { env } from "./config/env.js";
import { ensureKnowledge } from "./services/rag.service.js";

await ensureKnowledge();
app.listen(env.port, () => {
  console.log(`JAGO API running on http://localhost:${env.port}`);
  if (!env.geminiApiKey) console.log("[jago] GEMINI_API_KEY not set: running in offline demo mode");
  if (!env.jagoApiKey) console.log("[jago] JAGO_API_KEY not set: auth disabled (development only)");
});