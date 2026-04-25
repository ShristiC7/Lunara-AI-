# Architecture Research

**Domain:** Women's Health AI Platform — Hybrid Microservice (Node.js + Python)
**Researched:** 2026-04-25
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│              (Web App / Mobile / API Clients)                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS :4000
┌──────────────────────────▼──────────────────────────────────────────┐
│                     EXPRESS API (Node.js 20 / TS)                    │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │  Auth Routes│ │ Cycle Routes │ │Symptom Routes│ │Report Routes│  │
│  └──────┬──────┘ └──────┬───────┘ └──────┬───────┘ └──────┬──────┘  │
│         │               │                │                │          │
│  ┌──────▼───────────────▼────────────────▼────────────────▼──────┐  │
│  │              Service Layer (business logic)                     │  │
│  │   authService  cycleService  symptomService  reportService      │  │
│  └──────┬───────────────────────────────────────────┬────────────┘  │
│         │  Prisma ORM                               │ Bull Queue     │
└─────────┼───────────────────────────────────────────┼───────────────┘
          │                                           │
┌─────────▼──────────┐                    ┌──────────▼────────────────┐
│   PostgreSQL 15     │                    │      Redis 7               │
│  (Primary Store)    │                    │  (Bull Queues + Cache)     │
│  users, cycles,     │                    │  ai-inference queue        │
│  symptoms, insights │                    │  pdf-generation queue      │
│  reports, audit_log │                    │                            │
└────────────────────┘                    └──────────┬────────────────┘
                                                     │ Bull Workers (Node)
                                          ┌──────────▼────────────────┐
                                          │    BULL WORKERS (Node.js)  │
                                          │  aiWorker.ts               │
                                          │  reportWorker.ts           │
                                          └──────┬───────────┬─────────┘
                                                 │ HTTP      │ Puppeteer
                                    ┌────────────▼──┐  ┌────▼──────────┐
                                    │  FastAPI AI   │  │  PDF Builder  │
                                    │  Service :8000│  │  (Handlebars) │
                                    │               │  │               │
                                    │  /predict     │  └──────┬────────┘
                                    │  /analyze     │         │ S3 Upload
                                    │  /insights    │  ┌──────▼────────┐
                                    └──────┬────────┘  │   S3 / MinIO  │
                                           │ OpenAI    │  (PDF Store)  │
                                    ┌──────▼────────┐  └───────────────┘
                                    │  OpenAI GPT4o │
                                    │  API          │         📧
                                    └───────────────┘    Nodemailer
                                                         (SMTP/SES)
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Express API | HTTP routing, auth middleware, request validation, response formatting | Routes → Controllers → Services → Prisma |
| Bull Workers (Node) | Consume async job queues; orchestrate AI calls + PDF generation | Event-driven; separated aiWorker + reportWorker |
| FastAPI AI Service | Cycle prediction (ML), symptom analysis (OpenAI), insights generation | Async endpoints; stateless; called by Bull workers |
| PostgreSQL | All persistent data: users, cycles, symptoms, insights, reports, audit logs | Prisma schema; indexed on userId + date |
| Redis | Bull queue backend; session token cache; rate-limit counters | TTL-based; no persistent health data stored |
| PDF Builder | Render Handlebars template → puppeteer → PDF binary → S3 | Wrapped in reportWorker; async with timeout |
| S3/MinIO | Store generated PDF reports with pre-signed URLs | Key pattern: `reports/{userId}/{reportId}.pdf` |
| Nodemailer | Email report delivery + password reset | Queue-backed; retry on SMTP failure via Bull |

## Recommended Project Structure

### API (`./api/src/`)

```
api/src/
├── index.ts                    # App entry: middleware stack + server start + graceful shutdown
├── app.ts                      # Express app factory (for testing without starting server)
├── routes/                     # Route definitions (thin — delegate to controllers)
│   ├── auth.routes.ts
│   ├── cycles.routes.ts
│   ├── symptoms.routes.ts
│   ├── insights.routes.ts
│   └── reports.routes.ts
├── controllers/                # Request handling: validate → call service → respond
│   ├── auth.controller.ts
│   ├── cycles.controller.ts
│   ├── symptoms.controller.ts
│   ├── insights.controller.ts
│   └── reports.controller.ts
├── services/                   # Business logic (no HTTP concerns)
│   ├── auth.service.ts
│   ├── cycles.service.ts
│   ├── symptoms.service.ts
│   ├── insights.service.ts
│   └── reports.service.ts
├── middleware/
│   ├── auth.middleware.ts      # JWT verification + userId injection into req
│   ├── validate.middleware.ts  # Zod schema validation wrapper
│   └── audit.middleware.ts     # Audit log writer
├── workers/                    # Bull queue consumers
│   ├── ai.worker.ts            # Processes ai-inference queue jobs
│   └── report.worker.ts        # Processes pdf-generation queue jobs
├── queues/                     # Bull queue definitions + job producers
│   ├── ai.queue.ts
│   └── report.queue.ts
├── utils/
│   ├── logger.ts               # Winston structured logger
│   ├── errors.ts               # AppError, asyncHandler, global error middleware
│   ├── email.ts                # Nodemailer transport + send helpers
│   └── s3.ts                   # AWS S3 client + upload/presign helpers
├── schemas/                    # Zod validation schemas
│   ├── auth.schema.ts
│   ├── cycle.schema.ts
│   └── symptom.schema.ts
└── lib/
    └── prisma.ts               # Prisma client singleton (critical — see pitfalls)

api/prisma/
├── schema.prisma               # Full schema definition
├── migrations/                 # Auto-generated migration files
└── seed.ts                     # Dev seed data
```

### AI Service (`./ai-service/app/`)

```
ai-service/app/
├── main.py                     # FastAPI app factory + lifespan + CORS + routers
├── routers/
│   ├── health.py               # GET /health
│   ├── predict.py              # POST /predict/cycle
│   └── analyze.py              # POST /analyze/symptoms
├── services/
│   ├── cycle_predictor.py      # scikit-learn + statsmodels prediction logic
│   ├── symptom_analyzer.py     # OpenAI GPT-4o prompt + response parsing
│   └── insight_generator.py   # Multi-cycle trend analysis
├── schemas/
│   ├── cycle_schemas.py        # Pydantic request/response models for prediction
│   └── symptom_schemas.py      # Pydantic models for symptom analysis
├── models/                     # Saved scikit-learn models (.joblib)
│   └── .gitkeep
└── utils/
    ├── errors.py               # Custom exception handlers + HTTP exception mapping
    ├── logger.py               # structlog structured logging
    └── openai_client.py        # OpenAI client singleton with retry (tenacity)
```

### Structure Rationale

- **routes/ vs controllers/:** Routes are pure Express registration; controllers handle HTTP — no business logic leaks into routing
- **services/:** Pure business logic — testable without HTTP, importable by workers
- **workers/ vs queues/:** Separation of concerns — queues define jobs, workers consume them
- **lib/prisma.ts singleton:** Single PrismaClient instance prevents connection pool exhaustion (see pitfalls)
- **schemas/:** Zod schemas colocated for easy import into controllers and route middleware

## Architectural Patterns

### Pattern 1: Repository/Service Pattern (Express)

**What:** Controllers call Services; Services call Prisma directly. No raw SQL anywhere.

**When to use:** All database operations — enforces separation of HTTP and business logic.

**Trade-offs:** Slightly more files, but each layer is independently testable.

**Example:**
```typescript
// controller: handles HTTP
export const logCycle = asyncHandler(async (req: Request, res: Response) => {
  const data = cycleSchema.parse(req.body);
  const cycle = await cycleService.createCycle(req.userId, data);
  res.status(201).json({ success: true, data: cycle });
});

// service: handles business logic
export const createCycle = async (userId: string, data: CreateCycleDto) => {
  const cycle = await prisma.cycle.create({
    data: { userId, ...data, cycleLength: computeLength(data.startDate, data.endDate) }
  });
  await aiQueue.add('analyze-cycle', { userId, cycleId: cycle.id });
  return cycle;
};
```

### Pattern 2: Bull Queue + Worker for Async AI

**What:** HTTP endpoint returns immediately with jobId; Bull worker processes AI async; result written to DB.

**When to use:** Any operation > 500ms (OpenAI calls, PDF generation).

**Trade-offs:** More complex flow; requires polling or WebSocket for status. Worth it to prevent HTTP timeouts.

**Example:**
```typescript
// Producer (service layer)
const job = await aiQueue.add('symptom-analysis', { userId, symptoms, cycleId });
return { jobId: job.id, status: 'queued' };

// Consumer (worker)
aiQueue.process('symptom-analysis', async (job) => {
  const insight = await aiService.analyzeSymptoms(job.data);
  await prisma.aiInsight.create({ data: { userId: job.data.userId, content: insight } });
});
```

### Pattern 3: FastAPI Async Endpoint Pattern

**What:** All FastAPI endpoints are async; OpenAI calls use AsyncOpenAI client with tenacity retry.

**When to use:** Every endpoint in the AI service.

**Trade-offs:** Requires async throughout — no sync Prisma-style calls allowed.

**Example:**
```python
@router.post("/analyze/symptoms", response_model=SymptomInsightResponse)
async def analyze_symptoms(request: SymptomAnalysisRequest):
    insight = await symptom_analyzer.analyze(request.symptoms, request.cycle_context)
    return SymptomInsightResponse(insight=insight, generated_at=datetime.utcnow())
```

### Pattern 4: JWT Middleware Chain

**What:** Auth middleware extracts + verifies JWT; injects `userId` into `req`; all protected routes use it.

**When to use:** Every route except `/auth/register`, `/auth/login`, `/auth/refresh`, `/health`.

**Example:**
```typescript
// middleware
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('No token provided', 401);
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  req.userId = payload.userId;
  next();
});
```

## Data Flow

### Sync Request Flow (Cycle Logging)

```
POST /api/cycles
    ↓ auth middleware (JWT verify → userId)
    ↓ validate middleware (Zod schema)
    ↓ cycleController.logCycle()
    ↓ cycleService.createCycle(userId, data)
    ↓ prisma.cycle.create() → PostgreSQL
    ↓ aiQueue.add('trigger-insights', { userId, cycleId })  [async, non-blocking]
← 201 { success: true, data: cycle }
```

### Async AI Job Flow (Symptom Analysis)

```
POST /api/insights/trigger
    ↓ insightController → insightService.triggerAnalysis(userId)
    ↓ aiQueue.add('symptom-analysis', payload) → Redis
← 202 { jobId, status: 'queued' }

[Bull Worker picks up job from Redis]
    ↓ aiWorker.process('symptom-analysis', job)
    ↓ HTTP POST http://ai-service:8000/analyze/symptoms
    ↓ FastAPI → symptomAnalyzer.analyze(symptoms)
    ↓ AsyncOpenAI.chat.completions.create(...)  → OpenAI API
    ↓ Parse + validate response with Pydantic
    ↓ Return insight to Node worker
    ↓ prisma.aiInsight.create({ data: insight })
    ↓ [optional] emailService.sendInsightNotification()
```

### PDF Report Generation Flow

```
POST /api/reports/generate
    ↓ authenticate → validate
    ↓ reportService.requestReport(userId)
    ↓ reportQueue.add('generate-pdf', { userId })
← 202 { jobId, status: 'queued' }

[Report Worker]
    ↓ Fetch cycles + symptoms + insights for userId (last 6 months)
    ↓ Render Handlebars template → HTML string
    ↓ puppeteer.launch() → page.setContent(html) → page.pdf()
    ↓ s3Upload(pdfBuffer) → S3 key: reports/{userId}/{reportId}.pdf
    ↓ prisma.report.create({ fileUrl, userId })
    ↓ nodemailer.sendMail({ attachment: s3PresignedUrl })
```

## Database Schema Design

```sql
-- Key tables (Prisma schema, not raw SQL)

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cycles        Cycle[]
  symptoms      Symptom[]
  insights      AiInsight[]
  reports       Report[]
  auditLogs     AuditLog[]
}

model Cycle {
  id          String    @id @default(uuid())
  userId      String
  startDate   DateTime
  endDate     DateTime?
  cycleLength Int?
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  symptoms    Symptom[]
  insights    AiInsight[]
  @@index([userId, startDate])
}

model Symptom {
  id            String   @id @default(uuid())
  userId        String
  cycleId       String?
  date          DateTime
  mood          Int?     -- 1-5 scale
  energyLevel   Int?     -- 1-5 scale
  flowIntensity Int?     -- 0-4 scale (0=none, 4=heavy)
  painLevel     Int?     -- 0-5 scale
  notes         String?
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, date])
}

model AiInsight {
  id          String   @id @default(uuid())
  userId      String
  cycleId     String?
  insightType String   -- 'symptom_analysis' | 'cycle_prediction' | 'trend'
  content     Json
  generatedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
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
  id         String   @id @default(uuid())
  userId     String?
  action     String
  resource   String
  metadata   Json?
  createdAt  DateTime @default(now())
  @@index([userId, createdAt])
}
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–1k users | Current architecture is fine; single Postgres instance, single Redis |
| 1k–100k users | Add Postgres read replica for report queries; increase Bull concurrency; add Redis cluster |
| 100k+ users | Split AI service horizontally (K8s pods); introduce CDN for PDF delivery; partition audit_logs table by date |

### Scaling Priorities

1. **First bottleneck:** OpenAI API rate limits — add response caching (Redis, TTL 24h per user/day)
2. **Second bottleneck:** Puppeteer PDF generation — batch queue with concurrency limit; consider lambda/cloud function

## Anti-Patterns

### Anti-Pattern 1: Calling FastAPI Synchronously from HTTP Handler

**What people do:** `await axios.post('http://ai-service:8000/analyze', data)` inside an Express route handler
**Why it's wrong:** Ties HTTP response time to AI call (2-10s); times out; blocks event loop
**Do this instead:** Queue job via Bull, return 202 + jobId immediately

### Anti-Pattern 2: Multiple PrismaClient Instances

**What people do:** `import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient();` in every service file
**Why it's wrong:** Each instance opens a new connection pool — exhausts Postgres max_connections rapidly
**Do this instead:** Singleton in `src/lib/prisma.ts`, import everywhere

### Anti-Pattern 3: Logging Sensitive Health Data

**What people do:** `logger.info('User symptoms', { symptoms: req.body })` — full symptom data in logs
**Why it's wrong:** Health data in log files = privacy violation; logs often have weaker access controls than DB
**Do this instead:** Log event names + IDs only: `logger.info('symptoms.logged', { userId, count: symptoms.length })`

### Anti-Pattern 4: Storing AI Insights as Raw Strings

**What people do:** `content: String` in ai_insights table
**Why it's wrong:** Impossible to query individual fields; forces JSON.parse everywhere; schema drift
**Do this instead:** `content: Json` (Prisma/Postgres JSONB) — queryable, indexed, structured

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI API | AsyncOpenAI client with tenacity retry (Python) | Rate limit: 10k TPM on tier 1; use exponential backoff |
| S3 / AWS | boto3 (Python) + @aws-sdk/client-s3 (Node) | Pre-signed URLs for client downloads; 1-hour expiry |
| SMTP / SES | Nodemailer with transport config | Queue email sends via Bull; retry on SMTP failure |
| Redis (Bull) | Bull 4 + ioredis (bundled) | `REDIS_URL=redis://redis:6379`; no separate ioredis install |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Node API ↔ FastAPI | HTTP REST (internal Docker network) | No auth between services (same network); add service token in prod |
| Node API ↔ Bull/Redis | Bull Node client | Queues defined as singletons; workers share queue reference |
| Node Workers ↔ PostgreSQL | Prisma ORM (same singleton) | Workers import from same prisma.ts |

## Sources

- Bull 4 documentation (github.com/OptimalBits/bull)
- FastAPI best practices (fastapi.tiangolo.com)
- Prisma connection management guide (prisma.io/docs/guides)
- OpenAI Python SDK async usage (platform.openai.com/docs)

---
*Architecture research for: Lunara AI — Hybrid Health AI Platform*
*Researched: 2026-04-25*
