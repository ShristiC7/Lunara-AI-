import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { auditLog } from '../middleware/audit.middleware';

const router = Router();

router.use(requireAuth);

router.post('/generate', auditLog('GENERATE_REPORT', 'Report'), reportController.generateReport);
router.get('/', reportController.getReports);
router.get('/:id/download', auditLog('DOWNLOAD_REPORT', 'Report'), reportController.getReportDownload);

export default router;
