import { testApp, request } from './helpers/app.helpers';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('returns validation error on bad email', async () => {
      const res = await request(testApp).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'Valid1Password!',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns validation error on weak password', async () => {
      const res = await request(testApp).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'weak',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    // Real DB-dependent tests would mock Prisma or rely on DB
  });

  describe('POST /api/auth/login', () => {
    it('returns validation error missing payload', async () => {
      const res = await request(testApp).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });
});
