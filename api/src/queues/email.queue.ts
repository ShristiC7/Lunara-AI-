import Bull from 'bull';
import { logger } from '../utils/logger';

import { getRedisConfig } from '../lib/redisConfig';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const emailQueue = new Bull('email-delivery', REDIS_URL, {
  redis: getRedisConfig(REDIS_URL),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

emailQueue.on('error', (error) => {
  logger.error('Email Queue Error', { error: error.message });
});
