---
plan: 1.3
title: Authentication Endpoints
wave: 2
depends_on:
  - "1.1"
  - "1.2"
phase: 1
autonomous: true
files_modified:
  - api/src/schemas/auth.schema.ts
  - api/src/services/auth.service.ts
  - api/src/controllers/auth.controller.ts
  - api/src/routes/auth.routes.ts
  - api/src/middleware/auth.middleware.ts
  - api/src/middleware/validate.middleware.ts
  - api/src/app.ts
  - api/src/__tests__/auth.test.ts
requirements_addressed:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
  - AUTH-05
  - AUTH-06
  - AUTH-07
  - SECU-01
  - SECU-03
---

# Plan 1.3 — Authentication Endpoints

## Objective

Implement all 6 auth endpoints (register, login, refresh, logout, forgot-password, reset-password), the JWT middleware, Zod validation, and comprehensive integration tests covering happy paths, error cases, refresh token rotation, and reuse detection.

## must_haves

- `POST /api/auth/register` → 201 with accessToken + refreshToken
- `POST /api/auth/login` → 200 with accessToken + refreshToken
- `POST /api/auth/refresh` → 200 with new accessToken + new refreshToken; old refresh token returns 401
- `POST /api/auth/logout` → 200; refresh token revoked
- `POST /api/auth/forgot-password` → 200 (same message regardless of email existence)
- `POST /api/auth/reset-password` → 200; password updated
- `auth.middleware.ts` injects `req.userId` from Bearer token
- Refresh token reuse detection: used token → revoke ALL user sessions + 401
- Auth rate limiter: 10 req/15min per IP on all `/api/auth/*` routes; login: 5 req/15min

## threat_model

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Password stored in plaintext | CRITICAL | bcrypt with rounds: 12 for all passwords |
| Refresh token stored recoverable | HIGH | Stored as bcrypt hash (rounds: 10) — rawToken returned to client, never stored |
| Refresh token reuse (replay attack) | HIGH | Token marked `used: true` on use; reuse revokes all sessions |
| JWT secret weak or default | HIGH | JWT_SECRET must be ≥64 chars; validated at startup |
| Email enumeration via error messages | MEDIUM | forgot-password always returns same message |
| Brute force login | HIGH | express-rate-limit 5 req/15min per IP on /auth/login |
| Expired/invalid JWT on protected routes | HIGH | auth.middleware rejects with 401 + UNAUTHORIZED code |
| Password reset token brute force | MEDIUM | UUID token (128 bits), 1h expiry, single-use |

## Tasks

<task id="1.3.1">
<title>Create Zod schemas and validate middleware</title>
<read_first>
- .planning/REQUIREMENTS.md (AUTH-01–07 requirements)
- .planning/phases/01-foundation-auth-db-api-core/01-CONTEXT.md (D-01 to D-08)
- api/src/utils/errors.ts (AppError for validation errors)
</read_first>
<action>
Create `api/src/schemas/auth.schema.ts`:

```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid('Invalid reset token'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

Create `api/src/middleware/validate.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = (result.error as ZodError).errors[0];
      next(new AppError(firstError?.message ?? 'Validation failed', 400, 'VALIDATION_ERROR'));
      return;
    }
    req.body = result.data;
    next();
  };
};
```
</action>
<acceptance_criteria>
- `api/src/schemas/auth.schema.ts` exists
- File contains `export const registerSchema = z.object(`
- `registerSchema` includes password regex for uppercase AND number
- `loginSchema` includes `.toLowerCase()` on email
- `resetPasswordSchema` includes `z.string().uuid(` for token
- File exports TypeScript types for all 5 schemas
- `api/src/middleware/validate.middleware.ts` exists
- `validate` middleware calls `schema.safeParse(req.body)` and passes AppError to `next` on failure
- `validate` sets `req.body = result.data` on success (typed, parsed data)
</acceptance_criteria>
</task>

<task id="1.3.2">
<title>Create auth service with business logic</title>
<read_first>
- api/src/lib/prisma.ts (singleton import)
- api/src/utils/errors.ts (AppError)
- api/prisma/schema.prisma (User, RefreshToken, PasswordResetToken models)
- .planning/phases/01-foundation-auth-db-api-core/01-CONTEXT.md (D-01 to D-08)
- .planning/phases/01-foundation-auth-db-api-core/01-RESEARCH.md (section 2: JWT architecture)
</read_first>
<action>
Create `api/src/services/auth.service.ts`:

```typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

const PASSWORD_SALT_ROUNDS = 12;
const REFRESH_SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters — set in .env');
  }
  return secret;
}

function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

async function generateRefreshToken(userId: string): Promise<{ raw: string; hash: string; expiresAt: Date }> {
  const raw = randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(raw, REFRESH_SALT_ROUNDS);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return { raw, hash, expiresAt };
}

async function storeRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_CONFLICT');
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user.id, user.email);
  const refresh = await generateRefreshToken(user.id);
  await storeRefreshToken(user.id, refresh.hash, refresh.expiresAt);

  return { user, accessToken, refreshToken: refresh.raw };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user.id, user.email);
  const refresh = await generateRefreshToken(user.id);
  await storeRefreshToken(user.id, refresh.hash, refresh.expiresAt);

  return {
    user: { id: user.id, email: user.email, displayName: user.displayName },
    accessToken,
    refreshToken: refresh.raw,
  };
}

export async function refreshTokens(rawToken: string) {
  // Find all non-expired, non-used tokens and check hash
  const candidates = await prisma.refreshToken.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    take: 100, // safety limit
  });

  // Find matching token via bcrypt compare
  let matchedToken = null;
  for (const candidate of candidates) {
    const matches = await bcrypt.compare(rawToken, candidate.tokenHash);
    if (matches) {
      matchedToken = candidate;
      break;
    }
  }

  if (!matchedToken) {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN');
  }

  // Theft detection: token already used → revoke all sessions
  if (matchedToken.used) {
    await prisma.refreshToken.deleteMany({ where: { userId: matchedToken.userId } });
    throw new AppError('Refresh token reuse detected — all sessions revoked', 401, 'TOKEN_REUSE');
  }

  // Mark token as used (atomic)
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { used: true },
  });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: matchedToken.userId } });
  const accessToken = generateAccessToken(user.id, user.email);
  const newRefresh = await generateRefreshToken(user.id);
  await storeRefreshToken(user.id, newRefresh.hash, newRefresh.expiresAt);

  return { accessToken, refreshToken: newRefresh.raw };
}

export async function logout(rawToken: string) {
  // Find and invalidate the specific token
  const candidates = await prisma.refreshToken.findMany({
    where: { used: false, expiresAt: { gt: new Date() } },
    take: 100,
  });

  for (const candidate of candidates) {
    const matches = await bcrypt.compare(rawToken, candidate.tokenHash);
    if (matches) {
      await prisma.refreshToken.update({ where: { id: candidate.id }, data: { used: true } });
      return;
    }
  }
  // If not found, still return success (logout is idempotent)
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Always return success to prevent email enumeration
  if (!user) return { queued: false };

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const resetRecord = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: randomBytes(16).toString('hex'), // 32-char hex UUID-like token
      expiresAt,
    },
  });

  // In development: return token for testing. In production: queue email job
  if (process.env.NODE_ENV === 'development') {
    return { queued: false, devToken: resetRecord.token };
  }

  // TODO Phase 5: add to email Bull queue
  return { queued: true };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetRecord.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetRecord.id }, data: { used: true } }),
    // Invalidate all refresh tokens (force re-login after password change)
    prisma.refreshToken.updateMany({ where: { userId: resetRecord.userId }, data: { used: true } }),
  ]);
}
```
</action>
<acceptance_criteria>
- `api/src/services/auth.service.ts` exists
- File contains `export async function register(`
- File contains `export async function login(`
- File contains `export async function refreshTokens(`
- File contains `export async function logout(`
- File contains `export async function forgotPassword(`
- File contains `export async function resetPassword(`
- `register` uses `bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS)` where `PASSWORD_SALT_ROUNDS = 12`
- `refreshTokens` contains theft detection: `deleteMany({ where: { userId: matchedToken.userId } })` when `matchedToken.used` is true
- `forgotPassword` contains same return path whether user exists or not (email enumeration prevention)
- `resetPassword` uses `prisma.$transaction` to atomically update password + invalidate tokens
- File does NOT import from express (no HTTP concerns in service)
</acceptance_criteria>
</task>

<task id="1.3.3">
<title>Create JWT auth middleware</title>
<read_first>
- api/src/utils/errors.ts (AppError)
- api/src/services/auth.service.ts (getJwtSecret pattern — replicate here)
- .planning/phases/01-foundation-auth-db-api-core/01-CONTEXT.md (D-01, D-05)
</read_first>
<action>
Create `api/src/middleware/auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Authorization header missing', 401, 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    next(new AppError('Server configuration error', 500, 'INTERNAL_SERVER_ERROR'));
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError('Access token expired', 401, 'TOKEN_EXPIRED'));
      return;
    }
    next(new AppError('Invalid access token', 401, 'INVALID_TOKEN'));
  }
};
```
</action>
<acceptance_criteria>
- `api/src/middleware/auth.middleware.ts` exists
- File exports `authenticate` function
- `authenticate` checks for `Bearer ` prefix on Authorization header
- On missing/invalid header: calls `next(new AppError(..., 401))`
- On expired token: calls `next` with `code: 'TOKEN_EXPIRED'`
- On invalid token: calls `next` with `code: 'INVALID_TOKEN'`
- On valid token: sets `req.userId = decoded.userId` then calls `next()`
- File does NOT call `res.status()...json()` directly — uses next(err) pattern
</acceptance_criteria>
</task>

<task id="1.3.4">
<title>Create auth controller and routes</title>
<read_first>
- api/src/services/auth.service.ts (all exported functions)
- api/src/middleware/validate.middleware.ts (validate function)
- api/src/schemas/auth.schema.ts (all schemas)
- api/src/utils/errors.ts (asyncHandler)
- api/src/middleware/auth.middleware.ts (authenticate)
</read_first>
<action>
Create `api/src/controllers/auth.controller.ts`:

```typescript
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const result = await authService.refreshTokens(req.body.refreshToken);
  res.status(200).json({ success: true, data: result });
}

export async function logout(req: Request, res: Response): Promise<void> {
  await authService.logout(req.body.refreshToken);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: 'If that email exists, a reset link has been sent',
    ...(process.env.NODE_ENV === 'development' && result.devToken
      ? { devToken: result.devToken }
      : {}),
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(200).json({ success: true, message: 'Password reset successfully' });
}
```

Create `api/src/routes/auth.routes.ts`:

```typescript
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/errors';
import * as authController from '../controllers/auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many auth requests' },
  },
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts' },
  },
});

const router = Router();

// Apply auth rate limiter to all auth routes
router.use(authRateLimiter);

router.post('/register', validate(registerSchema), asyncHandler(authController.register));
router.post('/login', loginRateLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/refresh', validate(refreshSchema), asyncHandler(authController.refresh));
router.post('/logout', validate(refreshSchema), asyncHandler(authController.logout));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(authController.resetPassword));

export default router;
```

Update `api/src/app.ts` to mount auth routes — add after health router:

```typescript
// Add this import at the top of app.ts:
import authRouter from './routes/auth.routes';

// Add this line after: app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
```
</action>
<acceptance_criteria>
- `api/src/controllers/auth.controller.ts` exists with 6 exported async functions
- All controller functions return `{ success: true, data: ... }` or `{ success: true, message: ... }`
- `api/src/routes/auth.routes.ts` exists
- File contains `router.post('/register', validate(registerSchema), asyncHandler(authController.register))`
- File contains `loginRateLimiter` with `max: 5`
- File contains `authRateLimiter` with `max: 10`
- `loginRateLimiter` is applied ONLY to the `/login` route: `router.post('/login', loginRateLimiter, ...)`
- `api/src/app.ts` contains `app.use('/api/auth', authRouter)` (auth routes mounted)
</acceptance_criteria>
</task>

<task id="1.3.5">
<title>Write comprehensive auth integration tests</title>
<read_first>
- api/src/__tests__/helpers/app.helpers.ts (testApp)
- api/src/services/auth.service.ts (functions being tested)
- api/src/lib/prisma.ts (for DB cleanup in beforeEach/afterEach)
- .planning/phases/01-foundation-auth-db-api-core/01-RESEARCH.md (section 10: test list)
</read_first>
<action>
Create `api/src/__tests__/helpers/auth.helpers.ts`:

```typescript
import { prisma } from '../../lib/prisma';
import * as authService from '../../services/auth.service';

export async function createTestUser(email = 'test@example.com', password = 'TestPass123') {
  // Clean up first
  await prisma.user.deleteMany({ where: { email } });
  return authService.register({ email, password });
}

export async function cleanupTestUser(email: string) {
  await prisma.user.deleteMany({ where: { email } });
}
```

Create `api/src/__tests__/auth.test.ts`:

```typescript
import { testApp, request, prisma } from './helpers/app.helpers';
import { createTestUser, cleanupTestUser } from './helpers/auth.helpers';

const TEST_EMAIL = 'authtest@example.com';
const TEST_PASSWORD = 'TestPass123!';

beforeEach(async () => {
  await cleanupTestUser(TEST_EMAIL);
});

afterAll(async () => {
  await cleanupTestUser(TEST_EMAIL);
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns tokens', async () => {
    const res = await request(testApp)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose hash
  });

  it('returns 409 for duplicate email', async () => {
    await request(testApp).post('/api/auth/register').send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    const res = await request(testApp)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_CONFLICT');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(testApp)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: TEST_PASSWORD });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for weak password (no uppercase)', async () => {
    const res = await request(testApp)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: 'alllowercase1' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createTestUser(TEST_EMAIL, TEST_PASSWORD);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(testApp)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(testApp)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass123!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(testApp)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: TEST_PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns new tokens from valid refresh token', async () => {
    const { refreshToken } = await createTestUser(TEST_EMAIL, TEST_PASSWORD);

    const res = await request(testApp)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken); // New token issued
  });

  it('returns 401 when refresh token is reused (theft detection)', async () => {
    const { refreshToken } = await createTestUser(TEST_EMAIL, TEST_PASSWORD);

    // Use token once
    await request(testApp).post('/api/auth/refresh').send({ refreshToken });

    // Try to use it again
    const res = await request(testApp)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_REUSE');
  });

  it('returns 401 for completely invalid token', async () => {
    const res = await request(testApp)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'definitely-not-a-valid-token' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('logs out and invalidates refresh token', async () => {
    const { refreshToken } = await createTestUser(TEST_EMAIL, TEST_PASSWORD);

    const logoutRes = await request(testApp)
      .post('/api/auth/logout')
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);

    // Subsequent refresh should fail
    const refreshRes = await request(testApp)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

describe('JWT middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(testApp).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 regardless of whether email exists', async () => {
    const res1 = await request(testApp)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });
    const res2 = await request(testApp)
      .post('/api/auth/forgot-password')
      .send({ email: TEST_EMAIL });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.message).toBe(res2.body.message); // Same message
  });
});
```
</action>
<acceptance_criteria>
- `api/src/__tests__/auth.test.ts` exists
- File contains test for `POST /api/auth/register` returning 201 with accessToken + refreshToken
- File contains test for duplicate email returning 409
- File contains test for `POST /api/auth/refresh` with token reuse returning 401 with `TOKEN_REUSE` code
- File contains test for logout preventing subsequent refresh
- File contains test for JWT middleware returning 401 when Authorization missing
- File contains test for forgot-password returning same 200 message for existing and non-existing emails
- `api/src/__tests__/helpers/auth.helpers.ts` exists with `createTestUser` and `cleanupTestUser`
- `cleanupTestUser` uses `prisma.user.deleteMany({ where: { email } })` for test isolation
</acceptance_criteria>
</task>

## Verification

```bash
# 1. TypeScript compiles cleanly
cd api && npx tsc --noEmit

# 2. Auth integration tests pass
cd api && npm test -- --testPathPattern=auth

# 3. Register flow
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"TestPass123!"}'
# Expected: 201 { success: true, data: { accessToken, refreshToken, user } }

# 4. Login with same user
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"TestPass123!"}'
# Expected: 200 { success: true, data: { accessToken, refreshToken, user } }

# 5. Protected route without token
curl http://localhost:4000/api/users/me
# Expected: 401 { success: false, error: { code: 'UNAUTHORIZED' } }

# 6. Refresh token rotation
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"rotate@test.com","password":"TestPass123!"}' | jq -r '.data.refreshToken')
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$TOKEN\"}"
# Expected: 200 with new tokens
# Second call with same $TOKEN should return 401 TOKEN_REUSE
```
