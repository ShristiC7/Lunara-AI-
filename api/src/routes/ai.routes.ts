import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.use(requireAuth);

router.get('/', aiController.getInsights);
router.get('/:id', aiController.getInsightById);
router.post('/trigger', auditLog('TRIGGER_AI_ANALYSIS', 'Insight'), aiController.triggerAnalysis);

export default router;
