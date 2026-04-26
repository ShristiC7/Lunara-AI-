import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/current', aiController.getPrediction);

export default router;
