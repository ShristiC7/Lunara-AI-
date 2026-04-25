import { Router } from 'express';
import * as cycleController from '../controllers/cycle.controller';
import * as symptomController from '../controllers/symptom.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCycleSchema, updateCycleSchema } from '../schemas/cycle.schema';
import { auditLog } from '../middleware/audit.middleware';

// If Symptoms were nested, they might enter here:
// import symptomRouter from './symptom.routes';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate(createCycleSchema),
  auditLog('CREATE_CYCLE', 'Cycle'),
  cycleController.createCycle
);

router.get('/', cycleController.getCycles);

router.get('/:id', cycleController.getCycleById);

router.get('/:cycleId/symptoms', symptomController.getSymptomsByCycle);

router.patch(
  '/:id',
  validate(updateCycleSchema),
  auditLog('UPDATE_CYCLE', 'Cycle'),
  cycleController.updateCycle
);

router.delete(
  '/:id',
  auditLog('DELETE_CYCLE', 'Cycle'),
  cycleController.deleteCycle
);

export default router;
