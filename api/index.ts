import app from "../src/app.js";
import { ensureKnowledge } from "../src/services/rag.service.js";

await ensureKnowledge();

export default app;