import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../schemas/user.schema';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', userController.getProfile);

router.patch(
  '/me',
  validate(updateProfileSchema),
  auditLog('UPDATE_PROFILE', 'User'),
  userController.updateProfile
);

router.delete(
  '/me',
  auditLog('DELETE_ACCOUNT', 'User'),
  userController.deleteAccount
);

export default router;
