import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';

import { createRequestLogger } from './utils/logger';
import { notFoundHandler, globalErrorHandler } from './utils/errors';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import cycleRouter from './routes/cycle.routes';
import symptomRouter from './routes/symptom.routes';
import aiRouter from './routes/ai.routes';
import jobRouter from './routes/job.routes';

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
  },
});

export function createApp(): Application {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use((req, _res, next) => {
    req.requestId = uuidv4();
    next();
  });

  app.use(globalRateLimiter);

  app.use(createRequestLogger());

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/cycles', cycleRouter);
  app.use('/api/symptoms', symptomRouter);
  app.use('/api/insights', aiRouter);
  app.use('/api/jobs', jobRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

export const app = createApp();
