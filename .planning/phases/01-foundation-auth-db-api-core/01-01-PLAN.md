---
plan: 1.1
title: Prisma Schema + Database Setup
wave: 1
depends_on: []
phase: 1
autonomous: true
files_modified:
  - prisma/schema.prisma
  - prisma/seed.ts
  - api/src/lib/prisma.ts
  - api/.env
  - api/.env.example
requirements_addressed:
  - INFR-01
  - SECU-01
  - AUTH-01
---

# Plan 1.1 — Prisma Schema + Database Setup

## Objective

Define the full Prisma schema with all 8 models, create the Prisma client singleton to prevent connection pool exhaustion, run the initial migration, and seed the database with deterministic test data.

## must_haves

- All 8 tables created in PostgreSQL (User, Cycle, Symptom, AiInsight, Report, AuditLog, RefreshToken, PasswordResetToken)
- Prisma singleton pattern implemented in `src/lib/prisma.ts` using `globalThis`
- `prisma migrate dev --name init` runs without error
- `prisma/seed.ts` creates a test user + 3 cycles without error
- All `onDelete` cascade/setNull behaviours correctly set

## threat_model

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Connection pool exhaustion from multiple PrismaClient instances | HIGH | globalThis singleton pattern enforced in src/lib/prisma.ts |
| SQL injection via raw queries | HIGH | Prisma ORM only — no raw SQL permitted |
| Cascade delete misconfiguration exposes orphaned health data | HIGH | All user-owned models have onDelete: Cascade; AuditLog uses SetNull |
| Seed data with real-looking PII in test fixtures | MEDIUM | Seed uses clearly fake data (test@lunara.dev, placeholder names) |

## Tasks

<task id="1.1.1">
<title>Write prisma/schema.prisma with all 8 models</title>
<read_first>
- .planning/phases/01-foundation-auth-db-api-core/01-RESEARCH.md (full schema definition in section 8)
- .planning/research/ARCHITECTURE.md (DB schema design section)
- .planning/REQUIREMENTS.md (AUTH, CYCL, SYMP, INSG, RPRT, SECU requirements)
</read_first>
<action>
Create `api/prisma/schema.prisma` with the exact content below. Every field, relation, and index is required:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String               @id @default(uuid())
  email         String               @unique
  passwordHash  String
  displayName   String?
  bio           String?              @db.VarChar(500)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
  cycles        Cycle[]
  symptoms      Symptom[]
  insights      AiInsight[]
  reports       Report[]
  auditLogs     AuditLog[]
  refreshTokens RefreshToken[]
  resetTokens   PasswordResetToken[]
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
  id          String      @id @default(uuid())
  userId      String
  startDate   DateTime
  endDate     DateTime?
  cycleLength Int?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
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
  notes         String?  @db.VarChar(500)
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
  status      String   @default("completed")
  generatedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cycle       Cycle?   @relation(fields: [cycleId], references: [id], onDelete: SetNull)

  @@index([userId, generatedAt])
}

model Report {
  id          String    @id @default(uuid())
  userId      String
  fileUrl     String
  status      String    @default("completed")
  generatedAt DateTime  @default(now())
  emailedAt   DateTime?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, generatedAt])
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
</action>
<acceptance_criteria>
- `api/prisma/schema.prisma` exists and contains all 8 model definitions: User, RefreshToken, PasswordResetToken, Cycle, Symptom, AiInsight, Report, AuditLog
- File contains `@@index([userId, startDate])` for Cycle
- File contains `@@index([userId, date])` for Symptom
- File contains `@@index([userId, createdAt])` for AuditLog
- File contains `onDelete: Cascade` on RefreshToken, PasswordResetToken, Cycle, Symptom, AiInsight, Report user relations
- File contains `onDelete: SetNull` on AuditLog user relation and Symptom/AiInsight cycle relations
- File contains `bio String? @db.VarChar(500)` on User model
- File contains `notes String? @db.VarChar(500)` on Symptom model
</acceptance_criteria>
</task>

<task id="1.1.2">
<title>Create Prisma singleton src/lib/prisma.ts</title>
<read_first>
- .planning/phases/01-foundation-auth-db-api-core/01-RESEARCH.md (section 1: Prisma singleton pattern)
- .planning/research/PITFALLS.md (Pitfall 2: PrismaClient not singleton)
</read_first>
<action>
Create `api/src/lib/prisma.ts` with this exact content:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Then create the directory structure:
```bash
mkdir -p api/src/lib
mkdir -p api/src/routes
mkdir -p api/src/controllers
mkdir -p api/src/services
mkdir -p api/src/middleware
mkdir -p api/src/workers
mkdir -p api/src/queues
mkdir -p api/src/utils
mkdir -p api/src/schemas
mkdir -p api/src/types
mkdir -p api/prisma/migrations
mkdir -p api/src/__tests__/helpers
```
</action>
<acceptance_criteria>
- `api/src/lib/prisma.ts` exists
- File contains `globalThis as unknown as { prisma: PrismaClient | undefined }`
- File contains `if (process.env.NODE_ENV !== 'production') { globalForPrisma.prisma = prisma; }`
- File exports `prisma` (grep for `export const prisma`)
- All directories listed above exist
</acceptance_criteria>
</task>

<task id="1.1.3">
<title>Configure .env and .env.example</title>
<read_first>
- .planning/PROJECT.md (Constraints section — environment variables)
- api/.env.example (if exists from Phase 0 scaffold)
</read_first>
<action>
Create `api/.env` for local development (this file must NOT be committed to git — add to .gitignore):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lunara_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-super-secret-jwt-key-change-in-production-must-be-64-chars-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev-super-secret-refresh-key-change-in-production-64-chars
JWT_REFRESH_EXPIRES_IN=30d
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
AWS_REGION=us-east-1
AWS_S3_BUCKET_REPORTS=lunara-reports-dev
AWS_ACCESS_KEY_ID=dev-access-key
AWS_SECRET_ACCESS_KEY=dev-secret-key
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=dev-smtp-user
SMTP_PASS=dev-smtp-pass
SENTRY_DSN=
```

Create `api/.env.example` (committed to git):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME
REDIS_URL=redis://HOST:6379
JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_SECRET_openssl_rand_hex_32
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_64_CHAR_RANDOM_SECRET
JWT_REFRESH_EXPIRES_IN=30d
AI_SERVICE_URL=http://ai-service:8000
FRONTEND_URL=http://localhost:3000
AWS_REGION=us-east-1
AWS_S3_BUCKET_REPORTS=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

Add to `api/.gitignore` (create if not exists):
```
.env
node_modules/
dist/
```
</action>
<acceptance_criteria>
- `api/.env` exists and contains `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lunara_dev`
- `api/.env.example` exists and contains all 14 environment variable keys
- `api/.env.example` contains `JWT_SECRET=REPLACE_WITH_64_CHAR_RANDOM_SECRET`
- `api/.gitignore` exists and contains `.env` on its own line
</acceptance_criteria>
</task>

<task id="1.1.4">
<title>Run Prisma migration and create seed script</title>
<read_first>
- api/prisma/schema.prisma (just written in task 1.1.1)
- .planning/phases/01-foundation-auth-db-api-core/01-RESEARCH.md (section 9: testing setup)
</read_first>
<action>
First, install Prisma dependencies if not already installed:
```bash
cd api
npm install prisma @prisma/client
npx prisma generate
```

Run the initial migration (requires PostgreSQL running via docker-compose):
```bash
cd api
npx prisma migrate dev --name init
```

If Docker isn't running or DB isn't available, use db push for schema sync:
```bash
cd api
npx prisma db push
```

Create `api/prisma/seed.ts` with deterministic test data:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('TestPassword123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'test@lunara.dev' },
    update: {},
    create: {
      email: 'test@lunara.dev',
      passwordHash,
      displayName: 'Test User',
    },
  });

  // Create 3 cycles with 28-day spacing
  const now = new Date();
  
  const cycle1Start = new Date(now);
  cycle1Start.setDate(now.getDate() - 84); // ~3 months ago
  const cycle1End = new Date(cycle1Start);
  cycle1End.setDate(cycle1Start.getDate() + 5);

  const cycle2Start = new Date(cycle1Start);
  cycle2Start.setDate(cycle1Start.getDate() + 28);
  const cycle2End = new Date(cycle2Start);
  cycle2End.setDate(cycle2Start.getDate() + 5);

  const cycle3Start = new Date(cycle2Start);
  cycle3Start.setDate(cycle2Start.getDate() + 28);
  const cycle3End = new Date(cycle3Start);
  cycle3End.setDate(cycle3Start.getDate() + 5);

  await prisma.cycle.createMany({
    data: [
      { userId: user.id, startDate: cycle1Start, endDate: cycle1End, cycleLength: 28 },
      { userId: user.id, startDate: cycle2Start, endDate: cycle2End, cycleLength: 28 },
      { userId: user.id, startDate: cycle3Start, endDate: cycle3End, cycleLength: 28 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete. Test user: test@lunara.dev / TestPassword123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `api/package.json` scripts and prisma config:
```json
{
  "scripts": {
    "db:seed": "ts-node prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```
</action>
<acceptance_criteria>
- `api/prisma/seed.ts` exists and contains `upsert({ where: { email: 'test@lunara.dev' } })`
- `api/prisma/seed.ts` contains `bcrypt.hash('TestPassword123!', 12)`
- `api/prisma/seed.ts` contains `createMany` call with 3 cycle entries
- `api/package.json` contains `"db:seed"` in scripts section
- `api/package.json` contains `"prisma": { "seed": "ts-node prisma/seed.ts" }`
- `npx prisma generate` exits 0 (Prisma client generated)
- `api/prisma/migrations/` directory exists with at least one migration folder (if DB available) OR `npx prisma generate` exits 0 (if DB not available during build)
</acceptance_criteria>
</task>

## Verification

```bash
# 1. Prisma client generates without error
cd api && npx prisma generate

# 2. Schema validates
cd api && npx prisma validate

# 3. Singleton file exists with correct pattern
grep -n "globalForPrisma.prisma" api/src/lib/prisma.ts

# 4. All 8 models in schema
grep "^model " api/prisma/schema.prisma | wc -l  # Should be 8

# 5. All required indexes present
grep "@@index" api/prisma/schema.prisma  # Should show 5+ index declarations

# 6. .env.example has all required keys
grep -c "=" api/.env.example  # Should be >= 14
```
