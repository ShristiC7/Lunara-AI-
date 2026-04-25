import { testApp, request } from './helpers/app.helpers';
import jwt from 'jsonwebtoken';
import { aiQueue } from '../queues/ai.queue';
import { reportQueue } from '../queues/report.queue';

jest.mock('../queues/ai.queue', () => ({
  aiQueue: {
    getJob: jest.fn(),
  },
}));

jest.mock('../queues/report.queue', () => ({
  reportQueue: {
    getJob: jest.fn(),
  },
}));

describe('Job Status Endpoints', () => {
  const secret = process.env.JWT_SECRET || 'dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long';
  const token = jwt.sign({ userId: 'user-123' }, secret, { expiresIn: '15m' });

  it('returns job status from AI queue', async () => {
    (aiQueue.getJob as jest.Mock).mockResolvedValue({
      id: 'job-1',
      getState: jest.fn().mockResolvedValue('completed'),
      progress: jest.fn().mockReturnValue(100),
      returnvalue: { result: 'ok' },
      failedReason: null,
    });

    const res = await request(testApp)
      .get('/api/jobs/job-1')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.state).toBe('completed');
    expect(res.body.data.queue).toBe('ai-inference');
  });

  it('returns job status from Report queue if not in AI queue', async () => {
    (aiQueue.getJob as jest.Mock).mockResolvedValue(null);
    (reportQueue.getJob as jest.Mock).mockResolvedValue({
      id: 'job-2',
      getState: jest.fn().mockResolvedValue('active'),
      progress: jest.fn().mockReturnValue(50),
    });

    const res = await request(testApp)
      .get('/api/jobs/job-2')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.queue).toBe('pdf-generation');
    expect(res.body.data.state).toBe('active');
  });

  it('returns 404 if job not found in either queue', async () => {
    (aiQueue.getJob as jest.Mock).mockResolvedValue(null);
    (reportQueue.getJob as jest.Mock).mockResolvedValue(null);

    const res = await request(testApp)
      .get('/api/jobs/nonexistent')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(404);
  });
});
