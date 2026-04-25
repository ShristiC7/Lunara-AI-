import { testApp, request } from './helpers/app.helpers';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

describe('Symptom Endpoints', () => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  const token = jwt.sign({ userId: 'user-123' }, secret, { expiresIn: '15m' });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123' });
    // Also mock symptom creation/update to return something for non-error tests if any
  });

  describe('POST /api/symptoms', () => {
    it('returns 400 for illegal mood numeric range', async () => {
      const res = await request(testApp)
        .post('/api/symptoms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2023-01-05T00:00:00Z',
          mood: 10,
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 for invalid dates', async () => {
      const res = await request(testApp)
        .post('/api/symptoms')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: 'invalid-date',
          mood: 3,
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/symptoms/:id', () => {
    it('blocks arbitrary field patches overriding safety', async () => {
      const res = await request(testApp)
        .patch('/api/symptoms/uuid-123')
        .set('Authorization', `Bearer ${token}`)
        .send({
          painLevel: 10, // Max is 5
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
