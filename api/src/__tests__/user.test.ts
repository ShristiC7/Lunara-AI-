import { testApp, request } from './helpers/app.helpers';
import jwt from 'jsonwebtoken';

describe('User Endpoints', () => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  const token = jwt.sign({ userId: 'uuid-123' }, secret, { expiresIn: '15m' });

  describe('GET /api/users/me', () => {
    it('returns 401 without token', async () => {
      const res = await request(testApp).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    // DB-dependent tests to be mocked or run against real DB later
  });
});
