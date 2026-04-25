import { testApp, request } from './helpers/app.helpers';
import jwt from 'jsonwebtoken';

describe('Cycle Endpoints', () => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  const token = jwt.sign({ userId: 'user-123' }, secret, { expiresIn: '15m' });

  describe('POST /api/cycles', () => {
    it('returns 401 without auth', async () => {
      const res = await request(testApp).post('/api/cycles').send({ startDate: '2023-01-01T00:00:00Z' });
      expect(res.status).toBe(401);
    });

    it('returns 400 for missing startDate', async () => {
      const res = await request(testApp)
        .post('/api/cycles')
        .set('Authorization', `Bearer ${token}`)
        .send({ endDate: '2023-01-05T00:00:00Z' });
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 if endDate before startDate', async () => {
      const res = await request(testApp)
        .post('/api/cycles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          startDate: '2023-01-05T00:00:00Z',
          endDate: '2023-01-01T00:00:00Z',
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('endDate must be strictly greater than');
    });
  });

  describe('GET /api/cycles', () => {
    it('denies unauthenticated access', async () => {
      const res = await request(testApp).get('/api/cycles');
      expect(res.status).toBe(401);
    });
  });
});
