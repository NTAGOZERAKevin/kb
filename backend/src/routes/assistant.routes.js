import { Router } from 'express';
import { chatWithAssistant } from '../controllers/assistant.controller.js';
import { assistantLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/chat', assistantLimiter, chatWithAssistant);

export default router;
