import { testApp, request } from './helpers/app.helpers';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { reportQueue } from '../queues/report.queue';
import { StorageService } from '../utils/s3';

jest.mock('../queues/report.queue', () => ({
  reportQueue: {
    add: jest.fn().mockResolvedValue({ id: 'job-123' }),
  },
}));

jest.mock('../utils/s3', () => ({
  StorageService: {
    getDownloadUrl: jest.fn().mockResolvedValue('http://s3.mock/download'),
  },
}));

describe('Report Endpoints', () => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  const token = jwt.sign({ userId: 'user-123' }, secret, { expiresIn: '15m' });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
  });

  describe('POST /api/reports/generate', () => {
    it('successfully queues a report generation job', async () => {
      const res = await request(testApp)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ dateRange: '3mo' });

      expect(res.status).toBe(202);
      expect(res.body.data.jobId).toBe('job-123');
      expect(reportQueue.add).toHaveBeenCalled();
    });
  });

  describe('GET /api/reports', () => {
    it('returns list of reports for the authenticated user', async () => {
      (prisma.report.findMany as jest.Mock).mockResolvedValue([
        { id: 'rep-1', userId: 'user-123', fileUrl: 'key/1', generatedAt: new Date() }
      ]);

      const res = await request(testApp)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].downloadUrl).toBe('http://s3.mock/download');
    });
  });

  describe('GET /api/reports/:id/download', () => {
    it('returns 404 for other users reports', async () => {
      (prisma.report.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(testApp)
        .get('/api/reports/rep-999/download')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('returns pre-signed URL for owner', async () => {
      (prisma.report.findFirst as jest.Mock).mockResolvedValue({
        id: 'rep-1', userId: 'user-123', fileUrl: 'key/1'
      });

      const res = await request(testApp)
        .get('/api/reports/rep-1/download')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.downloadUrl).toBe('http://s3.mock/download');
    });
  });
});
