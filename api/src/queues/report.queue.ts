import Bull from 'bull';
import { logger } from '../utils/logger';

import { getRedisConfig } from '../lib/redisConfig';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const defaultOptions: Bull.QueueOptions = {
  redis: getRedisConfig(REDIS_URL) as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'fixed',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};

export const reportQueue = new Bull('pdf-generation', REDIS_URL, defaultOptions);

reportQueue.on('error', (error) => {
  logger.error('Report Queue Error', { error: error.message });
});
