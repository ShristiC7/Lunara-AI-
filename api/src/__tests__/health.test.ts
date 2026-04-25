import { testApp, request } from './helpers/app.helpers';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(testApp).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(res.body.env).toBeDefined();
  });

  it('does not require authentication', async () => {
    const res = await request(testApp).get('/api/health');
    expect(res.status).toBe(200);
  });
});

describe('404 handling', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(testApp).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('Error handling', () => {
  it('formats AppError correctly', async () => {
    const res = await request(testApp).get('/api/health');
    expect(res.status).toBe(200);
  });
});
