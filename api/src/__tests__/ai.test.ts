import { testApp, request } from './helpers/app.helpers';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

describe('AI Integration Endpoints', () => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  const token = jwt.sign({ userId: 'user-123' }, secret, { expiresIn: '15m' });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123' });
  });

  describe('GET /api/cycles/prediction', () => {
    it('returns 503 if AI service is down', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Connection refused');
      });

      const res = await request(testApp)
        .get('/api/cycles/prediction')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(503);
      expect(res.body.error.message).toContain('Failed to connect to AI service');
    });
  });

  describe('POST /api/insights/trigger', () => {
    it('returns 400 if no symptoms logged', async () => {
      (prisma.symptom.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(testApp)
        .post('/api/insights/trigger')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('No symptoms logged');
    });

    it('enforces rate limit of 10 insights per day', async () => {
      (prisma.aiInsight.count as jest.Mock).mockResolvedValue(10);

      const res = await request(testApp)
        .post('/api/insights/trigger')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(429);
      expect(res.body.error.message).toContain('limit reached');
    });
  });
});
