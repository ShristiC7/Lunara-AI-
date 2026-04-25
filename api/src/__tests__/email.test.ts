import { testApp, request } from './helpers/app.helpers';
import { emailQueue } from '../queues/email.queue';
import { prisma } from '../lib/prisma';

jest.mock('../queues/email.queue', () => ({
  emailQueue: {
    add: jest.fn().mockResolvedValue({ id: 'email-123' }),
  },
}));

describe('Email Transactional Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/forgot-password', () => {
    it('always returns success even if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(testApp)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('reset link has been sent');
      expect(emailQueue.add).not.toHaveBeenCalled();
    });

    it('queues a password reset email for existing user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'user@example.com' });
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const res = await request(testApp)
        .post('/api/auth/forgot-password')
        .send({ email: 'user@example.com' });

      expect(res.status).toBe(200);
      expect(emailQueue.add).toHaveBeenCalledWith(expect.objectContaining({
        type: 'PASSWORD_RESET',
        to: 'user@example.com'
      }));
    });
  });
});
