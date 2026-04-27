import Bull from 'bull';
import { logger } from '../utils/logger';

import { getRedisConfig } from '../lib/redisConfig';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const defaultOptions: Bull.QueueOptions = {
  redis: getRedisConfig(REDIS_URL) as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};

export const aiQueue = new Bull('ai-inference', REDIS_URL, defaultOptions);

aiQueue.on('error', (error) => {
  logger.error('AI Queue Error', { error: error.message });
});

aiQueue.on('waiting', (jobId) => {
  logger.info(`Job ${jobId} is waiting in AI queue`);
});
