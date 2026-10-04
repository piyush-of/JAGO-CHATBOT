import { knowledgeChunkCount } from "./services/rag.service.js";
import express from "express";
import cors from "cors";
import path from "node:path";
import chatRoutes from "./routes/chat.routes.js";
import { aiEnabled } from "./services/ai.service.js";
import { env } from "./config/env.js";

const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: env.corsOrigins.includes("*") ? true : env.corsOrigins }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "JAGO API",
    ai: aiEnabled ? "gemini" : "offline-demo",
    knowledgeChunks: knowledgeChunkCount()
  });
});

// Demo UI config: tells the web client whether it must send an API key.
app.get("/api/v1/config", (_req, res) => res.json({ authRequired: Boolean(env.jagoApiKey) }));

app.use("/api/v1", chatRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Not found" }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ success: false, message: "Bad request" });
});

export default app;
