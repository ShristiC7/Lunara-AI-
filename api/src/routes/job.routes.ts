import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/:id', jobController.getJobStatus);

export default router;
