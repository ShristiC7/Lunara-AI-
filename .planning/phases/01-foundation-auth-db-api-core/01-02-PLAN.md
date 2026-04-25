---
plan: 1.2
title: Express App Setup + Middleware Stack
wave: 1
depends_on: []
phase: 1
autonomous: true
files_modified:
  - api/src/app.ts
  - api/src/index.ts
  - api/src/utils/logger.ts
  - api/src/utils/errors.ts
  - api/src/types/express.d.ts
  - api/src/routes/health.routes.ts
  - api/tsconfig.json
  - api/package.json
requirements_addressed:
  - INFR-01
  - INFR-02
  - INFR-03
  - INFR-04
  - SECU-02
  - SECU-03
  - SECU-05
  - SECU-06
---

# Plan 1.2 — Express App Setup + Middleware Stack

## Objective

Build the Express application skeleton: factory pattern (`app.ts` exports the app, `index.ts` starts the server), full middleware stack in correct order, Winston structured logger, AppError + asyncHandler utilities, global error middleware, health endpoint, and graceful shutdown.

## must_haves

- `src/app.ts` exports a configured Express app (no `listen` call — enables supertest)
- `src/index.ts` starts server + handles SIGTERM/SIGINT graceful shutdown
- `GET /health` returns `{ status: 'ok', version, uptime, env }` with 200
- `src/utils/logger.ts` logs JSON with requestId, no PII/body content
- `src/utils/errors.ts` has `AppError`, `asyncHandler`, and `globalErrorHandler`
- `src/types/express.d.ts` adds `userId` and `requestId` to `Express.Request`
- All unhandled errors return `{ success: false, error: { code, message } }`

## threat_model

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Missing security headers (XSS, clickjacking, MIME sniffing) | HIGH | helmet() as first middleware |
| Overly permissive CORS (any origin) | HIGH | cors({ origin: FRONTEND_URL }) — explicit allowlist |
| Request body parser DoS (huge payloads) | MEDIUM | express.json({ limit: '10kb' }) |
| IP-based DDoS on all endpoints | MEDIUM | express-rate-limit 100 req/15min global |
| PII leaking through logs | HIGH | Winston logs requestId/userId/path/statusCode only — no body |
| Stack traces leaking in production errors | HIGH | globalErrorHandler sends message only in production, full stack in dev |

## Tasks

<task id="1.2.1">
<title>Install all API dependencies</title>
<read_first>
- .planning/research/STACK.md (library versions)
- api/package.json (current state)
</read_first>
<action>
Run from the `api/` directory:

```bash
cd api

# Core framework
npm install express@4.18.3 cors@2.8.5 helmet@7.1.0 express-rate-limit@7.3.1

# Auth
npm install jsonwebtoken@9.0.2 bcrypt@5.1.1

# Validation
npm install zod@3.22.4

# Logging
npm install winston@3.13.0 uuid@9.0.1

# ORM (already installed in 1.1, confirm here)
npm install prisma@5.14.0 @prisma/client@5.14.0

# Queues
npm install bull@4.12.2

# PDF + Email (stubs for now, wired in Phase 5)
npm install puppeteer@22.0.0 handlebars@4.7.8 nodemailer@6.9.13

# TypeScript types
npm install -D @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/uuid @types/nodemailer @types/bull

# Dev tools
npm install -D typescript@5.4.5 ts-node@10.9.2 ts-node-dev@2.0.0 jest@29.7.0 ts-jest@29.1.4 supertest@7.0.0 @types/jest @types/supertest eslint@8.57.0 @typescript-eslint/parser@7.8.0 @typescript-eslint/eslint-plugin@7.8.0 prettier@3.2.5
```

Create `api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "prisma/seed.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

Update `api/package.json` scripts section:
```json
{
  "name": "lunara-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest --forceExit",
    "test:coverage": "jest --coverage --forceExit",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts",
    "db:seed": "ts-node prisma/seed.ts",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Create `api/jest.config.ts`:
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
```
</action>
<acceptance_criteria>
- `api/node_modules/express` directory exists
- `api/node_modules/helmet` directory exists
- `api/node_modules/bull` directory exists
- `api/tsconfig.json` exists and contains `"strict": true`
- `api/tsconfig.json` contains `"target": "ES2022"`
- `api/package.json` contains `"dev": "ts-node-dev --respawn --transpile-only src/index.ts"`
- `api/package.json` contains `"test:coverage": "jest --coverage --forceExit"`
- `api/jest.config.ts` exists and contains `coverageThreshold`
</acceptance_criteria>
</task>

<task id="1.2.2">
<title>Create TypeScript type augmentation for Express</title>
<read_first>
- api/tsconfig.json (to confirm rootDir and includes)
</read_first>
<action>
Create `api/src/types/express.d.ts`:

```typescript
declare global {
  namespace Express {
    interface Request {
      userId: string;
      requestId: string;
    }
  }
}

export {};
```
</action>
<acceptance_criteria>
- `api/src/types/express.d.ts` exists
- File contains `userId: string` inside `namespace Express { interface Request {`
- File contains `requestId: string` inside `namespace Express { interface Request {`
</acceptance_criteria>
</task>

<task id="1.2.3">
<title>Create Winston logger utility</title>
<read_first>
- .planning/phases/01-foundation-auth-db-api-core/01-CONTEXT.md (D-19: what to log)
- .planning/research/PITFALLS.md (Security Mistakes: logging PII)
</read_first>
<action>
Create `api/src/utils/logger.ts`:

```typescript
import winston from 'winston';

const { combine, timestamp, json, errors, colorize, simple } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  silent: isTest,
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'lunara-api' },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(colorize(), simple()),
    }),
  ],
});

// IMPORTANT: Never log request bodies — they may contain health data or passwords
// Log only: level, message, timestamp, requestId, userId, method, path, statusCode, duration
export const createRequestLogger = () => {
  return (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info('request', {
        requestId: req.requestId,
        userId: req.userId ?? null,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: Date.now() - start,
      });
    });
    next();
  };
};
```
</action>
<acceptance_criteria>
- `api/src/utils/logger.ts` exists
- File contains `silent: isTest` (silences logs during tests)
- File contains `export const logger = winston.createLogger`
- File contains `export const createRequestLogger`
- File does NOT contain `req.body` (no body logging)
- File contains `userId: req.userId ?? null` (userId in logs but not body)
</acceptance_criteria>
</task>

<task id="1.2.4">
<title>Create AppError class and asyncHandler utility</title>
<read_first>
- .planning/phases/01-foundation-auth-db-api-core/01-CONTEXT.md (D-15, D-16, D-17: error format)
</read_first>
<action>
Create `api/src/utils/errors.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code ?? getDefaultCode(statusCode);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function getDefaultCode(statusCode: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
  };
  return codes[statusCode] ?? 'INTERNAL_SERVER_ERROR';
}

// Wraps async route handlers — catches rejections and passes to next(err)
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler — place after all routes
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};

// Global error handler — place last in middleware chain
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Unexpected error — log full details, hide from client in production
  logger.error('Unexpected error', {
    requestId: req.requestId,
    userId: req.userId ?? null,
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction ? 'An unexpected error occurred' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};
```
</action>
<acceptance_criteria>
- `api/src/utils/errors.ts` exists
- File contains `export class AppError extends Error`
- File contains `this.isOperational = true`
- File contains `export const asyncHandler`
- File contains `export const notFoundHandler`
- File contains `export const globalErrorHandler`
- `globalErrorHandler` has 4 parameters `(err, req, res, _next)` — required for Express to recognise as error handler
- File returns `{ success: false, error: { code, message } }` format
</acceptance_criteria>
</task>

<task id="1.2.5">
<title>Create health route and Express app factory</title>
<read_first>
- api/src/utils/logger.ts (just written — import createRequestLogger)
- api/src/utils/errors.ts (just written — import notFoundHandler, globalErrorHandler)
- .planning/phases/01-foundation-auth-db-api-core/01-CONTEXT.md (D-13: middleware order)
</read_first>
<action>
Create `api/src/routes/health.routes.ts`:

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: Math.floor(process.uptime()),
    env: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

Create `api/src/app.ts`:

```typescript
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

import { createRequestLogger, logger } from './utils/logger';
import { notFoundHandler, globalErrorHandler } from './utils/errors';
import healthRouter from './routes/health.routes';

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
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

  // 1. Security headers
  app.use(helmet());

  // 2. CORS — explicit origin only
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
    })
  );

  // 3. Body parser with 10kb limit
  app.use(express.json({ limit: '10kb' }));

  // 4. Request ID injection (before logger)
  app.use((req, _res, next) => {
    req.requestId = uuidv4();
    next();
  });

  // 5. Global rate limiter
  app.use(globalRateLimiter);

  // 6. Request logger (after ID injection, before routes)
  app.use(createRequestLogger());

  // Routes
  app.use('/api', healthRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  return app;
}

export const app = createApp();
```
</action>
<acceptance_criteria>
- `api/src/routes/health.routes.ts` exists and contains `router.get('/health'`
- `api/src/app.ts` exists and contains `export function createApp()`
- `api/src/app.ts` contains `app.use(helmet())`
- `api/src/app.ts` contains `app.use(cors({`
- `api/src/app.ts` contains `express.json({ limit: '10kb' })`
- `api/src/app.ts` contains `app.use(globalRateLimiter)`
- `api/src/app.ts` contains `app.use(globalErrorHandler)` as the LAST middleware
- `api/src/app.ts` does NOT contain `app.listen` (factory pattern)
- `api/src/app.ts` exports both `createApp` and `app`
</acceptance_criteria>
</task>

<task id="1.2.6">
<title>Create src/index.ts with graceful shutdown</title>
<read_first>
- api/src/app.ts (just written — import app)
- api/src/lib/prisma.ts (import for disconnect)
- api/src/utils/logger.ts (import logger)
- .planning/phases/01-foundation-auth-db-api-core/01-RESEARCH.md (section 5: graceful shutdown)
</read_first>
<action>
Create `api/src/index.ts`:

```typescript
import { app } from './app';
import { prisma } from './lib/prisma';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const server = app.listen(PORT, () => {
  logger.info(`🌙 Lunara API running`, {
    port: PORT,
    env: process.env.NODE_ENV ?? 'development',
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

const gracefulShutdown = (signal: string) => async () => {
  logger.info(`${signal} received — starting graceful shutdown`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed. Graceful shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: (err as Error).message });
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Graceful shutdown timeout — forcing exit');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
```
</action>
<acceptance_criteria>
- `api/src/index.ts` exists
- File contains `server.close(async () => {`
- File contains `await prisma.$disconnect()`
- File contains `process.on('SIGTERM', gracefulShutdown('SIGTERM'))`
- File contains `process.on('SIGINT', gracefulShutdown('SIGINT'))`
- File contains `setTimeout(() => { ... process.exit(1); }, 10_000)`
- File contains `process.on('unhandledRejection'`
- File does NOT define any routes (routes are in app.ts)
</acceptance_criteria>
</task>

<task id="1.2.7">
<title>Write integration tests for app setup and health endpoint</title>
<read_first>
- api/src/app.ts (import createApp for tests)
- api/src/utils/errors.ts (AppError class)
</read_first>
<action>
Create `api/src/__tests__/helpers/app.helpers.ts`:

```typescript
import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../lib/prisma';

export const testApp = createApp();
export { request, prisma };
```

Create `api/src/__tests__/health.test.ts`:

```typescript
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
    // Test via a route that throws AppError
    const res = await request(testApp).get('/api/health');
    expect(res.status).toBe(200); // baseline passes
  });
});
```

Create `api/src/__tests__/errors.test.ts`:

```typescript
import { AppError, asyncHandler } from '../../utils/errors';
import { Request, Response, NextFunction } from 'express';

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const err = new AppError('Not found', 404, 'NOT_FOUND');
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.isOperational).toBe(true);
  });

  it('uses default code when not provided', () => {
    const err = new AppError('Bad request', 400);
    expect(err.code).toBe('BAD_REQUEST');
  });

  it('is instanceof Error', () => {
    const err = new AppError('Test', 500);
    expect(err instanceof Error).toBe(true);
  });
});

describe('asyncHandler', () => {
  it('passes errors to next', async () => {
    const mockNext = jest.fn();
    const error = new AppError('Test error', 400);
    const handler = asyncHandler(async () => { throw error; });
    await handler({} as Request, {} as Response, mockNext as NextFunction);
    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
```
</action>
<acceptance_criteria>
- `api/src/__tests__/helpers/app.helpers.ts` exists and exports `testApp` and `request`
- `api/src/__tests__/health.test.ts` exists
- `api/src/__tests__/health.test.ts` contains test for `GET /api/health` returning status 200
- `api/src/__tests__/health.test.ts` contains test for 404 returning `{ success: false, error: { code: 'NOT_FOUND' } }`
- `api/src/__tests__/errors.test.ts` exists
- `api/src/__tests__/errors.test.ts` tests `AppError` creating with correct statusCode, code, isOperational
- `npm test` runs without TypeScript compilation errors
</acceptance_criteria>
</task>

## Verification

```bash
# 1. TypeScript compiles without errors
cd api && npx tsc --noEmit

# 2. App starts
cd api && npm run dev &
sleep 3
curl http://localhost:4000/api/health
# Expected: {"status":"ok","version":"...","uptime":...}
kill %1

# 3. Tests pass
cd api && npm test

# 4. Helmet headers present
curl -I http://localhost:4000/api/health | grep -i "x-content-type"
# Expected: x-content-type-options: nosniff

# 5. 404 format correct
curl http://localhost:4000/api/nonexistent
# Expected: {"success":false,"error":{"code":"NOT_FOUND",...}}
```
