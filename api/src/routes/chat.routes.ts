import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limiting for AI endpoints to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 messages per hour
  message: {
    success: false,
    error: { code: 'TOO_MANY_CHAT_MESSAGES', message: 'You have reached the hourly limit for AI chat. Please try again later.' },
  },
});

router.use(requireAuth);

router.post('/message', chatLimiter, chatController.sendMessage);

export default router;
