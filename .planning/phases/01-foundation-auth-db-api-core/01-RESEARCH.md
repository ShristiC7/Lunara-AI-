# Phase 1 Research: Foundation — Auth + DB + API Core

**Phase:** 1
**Researched:** 2026-04-25
**Status:** RESEARCH COMPLETE

## Key Technical Decisions

### 1. Prisma Schema — Singleton Pattern (CRITICAL)

The `PrismaClient` must be instantiated exactly once. Use the `globalThis` trick to survive hot-reload in `ts-node-dev`:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why:** Each `new PrismaClient()` opens a connection pool (default 5-10 connections). With `ts-node-dev --respawn`, the module cache is cleared on restart, creating new instances without closing old ones. Pool exhaustion follows within minutes.

### 2. JWT Architecture

**Access token:** HS256, 15-minute TTL, in response body.
**Refresh token:** 256-bit random UUID stored as bcrypt hash in DB (rounds: 10 — faster than password hash since token is already random).

```typescript
// Generating refresh token
import { randomBytes } from 'crypto';
const rawToken = randomBytes(32).toString('hex'); // 64-char hex string
const tokenHash = await bcrypt.hash(rawToken, 10);
// Store tokenHash in DB, return rawToken to client
```

**Rotation:** On every `/auth/refresh`:
1. Find RefreshToken by userId where `used: false` and `expiresAt > now`
2. Verify bcrypt hash matches
3. Mark token `used: true` in DB (atomic update)
4. Issue new JWT + new RefreshToken
5. If token is already `used: true` → revoke ALL user tokens (theft detection)

### 3. Express App Factory Pattern

`src/app.ts` exports a configured Express app (NO `listen` call). `src/index.ts` calls `app.listen()`. This enables supertest to import `app` in tests without starting a server:

```typescript
// src/app.ts
export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL }));
  app.use(express.json({ limit: '10kb' }));
  // ...routes
  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  return app;
};
export const app = createApp();

// src/index.ts 
import { app } from './app';
const server = app.listen(PORT, () => logger.info(`API running on :${PORT}`));
// graceful shutdown
process.on('SIGTERM', () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
```

### 4. Zod Validation Middleware

Create a reusable `validate` middleware that wraps Zod schemas:

```typescript
// src/middleware/validate.middleware.ts
export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    return;
  }
  req.body = result.data; // replace with parsed+typed data
  next();
};
```

### 5. Graceful Shutdown Implementation

```typescript
const gracefulShutdown = (signal: string) => async () => {
  logger.info(`${signal} received — starting graceful shutdown`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Graceful shutdown complete');
    process.exit(0);
  });
  // Force exit if graceful shutdown takes too long
  setTimeout(() => { process.exit(1); }, 10000);
};
process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));
```

### 6. TypeScript Express Type Augmentation

Add `userId` to `Express.Request` via module augmentation:

```typescript
// src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      userId: string;
      requestId: string;
    }
  }
}
```

### 7. Audit Log Middleware

```typescript
// src/middleware/audit.middleware.ts
export const auditLog = (action: string, resource: string) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await prisma.auditLog.create({
      data: {
        userId: req.userId ?? null,
        action,
        resource,
        metadata: { method: req.method, path: req.path },
      },
    });
    next();
  });
```

### 8. Full Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  displayName  String?
  bio          String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  cycles       Cycle[]
  symptoms     Symptom[]
  insights     AiInsight[]
  reports      Report[]
  auditLogs    AuditLog[]
  refreshTokens RefreshToken[]
  resetTokens  PasswordResetToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model Cycle {
  id          String     @id @default(uuid())
  userId      String
  startDate   DateTime
  endDate     DateTime?
  cycleLength Int?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  symptoms    Symptom[]
  insights    AiInsight[]
  @@index([userId, startDate])
}

model Symptom {
  id            String   @id @default(uuid())
  userId        String
  cycleId       String?
  date          DateTime
  mood          Int?
  energyLevel   Int?
  flowIntensity Int?
  painLevel     Int?
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cycle         Cycle?   @relation(fields: [cycleId], references: [id], onDelete: SetNull)
  @@index([userId, date])
}

model AiInsight {
  id          String   @id @default(uuid())
  userId      String
  cycleId     String?
  insightType String
  content     Json
  generatedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cycle       Cycle?   @relation(fields: [cycleId], references: [id], onDelete: SetNull)
}

model Report {
  id          String    @id @default(uuid())
  userId      String
  fileUrl     String
  generatedAt DateTime  @default(now())
  emailedAt   DateTime?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  metadata  Json?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  @@index([userId, createdAt])
}
```

### 9. Testing Setup for Auth

```typescript
// api/jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './src/__tests__/setup.ts',
  globalTeardown: './src/__tests__/teardown.ts',
  coverageThreshold: { global: { lines: 80, branches: 80, functions: 80 } },
};

// api/src/__tests__/setup.ts — connect to test DB, run migrations
// api/src/__tests__/teardown.ts — prisma.$disconnect()
// api/src/__tests__/helpers/auth.helpers.ts — createTestUser(), getAuthHeaders()
```

### 10. [BLOCKING] Prisma Schema Push

Phase modifies `prisma/schema.prisma`. AFTER writing schema and BEFORE verification, must run:
```bash
npx prisma migrate dev --name init
```
Or for CI-like environments:
```bash
npx prisma db push --accept-data-loss
```

## Validation Architecture

### Dimension 8: Test Verification Strategy

**Unit tests:**
- `authService.register()` — valid email, duplicate email, weak password
- `authService.login()` — valid creds, wrong password, nonexistent user
- `authService.refreshToken()` — valid token, expired token, used token (theft detection)

**Integration tests (supertest):**
- `POST /api/auth/register` → 201 + { accessToken, refreshToken }
- `POST /api/auth/login` → 200 + tokens
- `POST /api/auth/refresh` → 200 + new tokens; old token returns 401
- `POST /api/auth/logout` → 200; subsequent refresh returns 401
- `GET /api/users/me` without token → 401
- `GET /health` → 200 + { status, version, uptime }
- `PATCH /api/users/me` → 200; AuditLog created
- `DELETE /api/users/me` → 200; all user data deleted from DB

**Cross-user isolation tests:**
- User A cannot access User B's data — test for each protected endpoint

**Rate limit tests:**
- 11th login request → 429

---
*Research complete for: Phase 1 — Foundation: Auth + DB + API Core*
*Researched: 2026-04-25*
