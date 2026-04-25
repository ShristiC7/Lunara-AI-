import { Router } from 'express';
import * as symptomController from '../controllers/symptom.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { logSymptomSchema, updateSymptomSchema } from '../schemas/symptom.schema';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validate(logSymptomSchema),
  auditLog('CREATE_SYMPTOM', 'Symptom'),
  symptomController.createSymptom
);

router.get('/:id', symptomController.getSymptomById);

router.patch(
  '/:id',
  validate(updateSymptomSchema),
  auditLog('UPDATE_SYMPTOM', 'Symptom'),
  symptomController.updateSymptom
);

router.delete(
  '/:id',
  auditLog('DELETE_SYMPTOM', 'Symptom'),
  symptomController.deleteSymptom
);

export default router;
