import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { rateLimit, requireApiKey } from "../middleware/security.js";

const router = Router();
router.post("/chat", requireApiKey, rateLimit, chatController);
export default router;
