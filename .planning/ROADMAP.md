# Roadmap: Lunara AI

**Milestone 1:** v1.0 — Complete Backend + AI Service
**Status:** ✅ Complete (Verified 2026-04-26)

**Milestone 2:** v1.1 — Frontend implementation (Calm Intelligence UI)
**Status:** 🏗️ In Progress
**Phases:** 4

---

## Phase Overview

### Milestone 1: Backend (Complete)
| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Foundation | Secure accounts, DB schema, API skeleton | AUTH, PROF, INFR, SECU | ✅ Done |
| 2 | Data Layer | Cycle & Symptom logging | CYCL, SYMP | ✅ Done |
| 3 | AI Service | Prediction + GPT-4o Insights | PRED, INSG | ✅ Done |
| 4 | Jobs/Queues | Async processing via Bull | JOBS | ✅ Done |
| 5 | Reports | PDF + Email delivery | RPRT, MAIL | ✅ Done |
| 6 | Hardening | 80% test coverage + audit | All v1 | ✅ Done |

### Milestone 2: Frontend (Active)
| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 7 | Frontend Foundation | Vite + React setup, Design System, Auth Interceptors | UI-BASE | 🏗️ Active |
| 8 | Core Experience | Dashboard, Cycle Ring, Quick Logger | UI-CORE | ⬜ Pending |
| 9 | Health Insights | Insights view, Analytics, PDF Download | UI-DATA | ⬜ Pending |
| 10 | Polishing + PWA | Smooth transitions, Responsive audit, PWA manifest | UI-POLISH | ⬜ Pending |

---

## Phase 1: Foundation — Auth + DB + API Core

**Goal:** Users can register, log in, and authenticate. The full database schema is defined with Prisma. The Express API skeleton has all middleware, error handling, graceful shutdown, and audit logging in place. Every subsequent phase builds on this foundation.

**UI hint**: no

**Requirements:**
- AUTH-01–07 (registration, login, JWT, refresh token rotation, logout, password reset)
- PROF-01–03 (view/update/delete account)
- INFR-01–04 (health endpoint, error middleware, asyncHandler, graceful shutdown)
- SECU-01–06 (userId scoping pattern, helmet, rate limiting, audit logs, Winston, env secrets)

**Depends on:** None (Phase 1 is the root)

**Plans:**

### Plan 1.1 — Prisma Schema + Database Setup
- Define full Prisma schema: `User`, `Cycle`, `Symptom`, `AiInsight`, `Report`, `AuditLog`, `RefreshToken`
- All models include `userId` foreign key with `onDelete: Cascade`
- Create singleton `src/lib/prisma.ts` (global pattern to prevent pool exhaustion)
- Run initial `prisma migrate dev --name init`
- Add database indexes: `(userId, startDate)` on Cycle, `(userId, date)` on Symptom, `(userId, createdAt)` on AuditLog
- Write seed script `prisma/seed.ts` with test user + 3 cycles

**Verification:** `npx prisma db push` succeeds; `npx prisma studio` shows all tables; seed creates data without error.

### Plan 1.2 — Express App Setup + Middleware Stack
- Create `src/app.ts` (factory, no `listen`) and `src/index.ts` (starts server, graceful shutdown)
- Middleware in order: helmet, cors (FRONTEND_URL), express-rate-limit (100 req/15min), json parser, request logger (Winston)
- `src/utils/logger.ts`: Winston JSON logger, `error`/`warn`/`info`/`debug` levels based on `NODE_ENV`
- `src/utils/errors.ts`: `AppError` class, `asyncHandler` wrapper, global error middleware (`next(err)`)
- `GET /health` route returns `{ status, version, uptime, env }`
- Graceful shutdown: `SIGTERM`/`SIGINT` → stop accepting, close server, `prisma.$disconnect()`

**Verification:** `npm run dev` starts without error; `GET /health` returns 200; unhandled error returns `{ success: false, error: { code, message } }`; Ctrl+C triggers graceful shutdown log.

### Plan 1.3 — Authentication Endpoints
- POST `/api/auth/register` — bcrypt hash password (rounds: 12), create User, issue JWT (15min) + RefreshToken (30d, stored as hash)
- POST `/api/auth/login` — verify password, issue JWT + RefreshToken (rotation on each use)
- POST `/api/auth/refresh` — validate refresh token hash in DB, mark as `used`, issue new JWT + new RefreshToken
- POST `/api/auth/logout` — invalidate current refresh token in DB
- POST `/api/auth/forgot-password` — create PasswordResetToken (TTL 1h), queue email via Bull
- POST `/api/auth/reset-password` — verify token not expired/used, update password hash, invalidate token
- `src/middleware/auth.middleware.ts` — extract Bearer token, `jwt.verify`, inject `req.userId`
- Zod schemas for all auth request bodies in `src/schemas/auth.schema.ts`

**Verification:** Register → Login → Refresh → Logout all succeed. Expired JWT returns 401. Reused refresh token returns 401. Reset password flow works end to end. Rate limit on login (5 attempts/15min).

### Plan 1.4 — User Profile Endpoints + Audit Middleware
- GET `/api/users/me` — return authenticated user's profile (exclude passwordHash)
- PATCH `/api/users/me` — update displayName, bio (Zod validated, ≤500 chars)
- DELETE `/api/users/me` — soft-delete with Prisma cascade (all user data deleted)
- `src/middleware/audit.middleware.ts` — write AuditLog after every mutating route (userId, action, resource, metadata)
- SECU-01: add `auditMiddleware` to all routes that mutate data

**Verification:** Profile CRUD works for authenticated user. Unauthenticated requests return 401. Deleting account cascades all data. AuditLog table has entries after each mutation.

**Success Criteria:**
1. A new user can register with email/password and receive a JWT — verified by integration test
2. JWT refresh token rotation works: reusing old refresh token returns 401 — verified by test
3. Password reset email is queued (job appears in Bull queue even if email not sent in test) — verified by test
4. All 7 tables exist in Postgres with correct indexes — verified by `prisma db pull`
5. `GET /health` returns 200 with version — verified by test
6. Global error middleware: throwing AppError in handler returns correct HTTP status — verified by test

---

## Phase 2: Cycle & Symptom Data Layer

**Goal:** Authenticated users can log their menstrual cycles and daily symptoms, retrieve their history, and delete entries. All queries are scoped by `userId`. This data layer feeds the AI service in Phase 3.

**UI hint**: no

**Requirements:**
- CYCL-01–05 (cycle CRUD: log, update with end date, history, detail, delete)
- SYMP-01–05 (symptom CRUD: log daily, update, list per cycle, delete, sanitize notes)

**Depends on:** Phase 1 (auth middleware, Prisma schema, error utilities)

**Plans:**

### Plan 2.1 — Cycle Endpoints
- POST `/api/cycles` — create cycle with startDate; auto-calculate cycleLength if endDate provided
- PATCH `/api/cycles/:id` — add endDate or update dates; recalculate cycleLength; enforce userId scope
- GET `/api/cycles` — paginated list (default 20) ordered by startDate desc; include symptom count per cycle
- GET `/api/cycles/:id` — cycle detail with all linked symptoms; enforce userId scope
- DELETE `/api/cycles/:id` — delete cycle + cascade symptoms; enforce userId scope
- Zod schema: `startDate` required (ISO date), `endDate` optional but must be ≥ startDate
- Service: `cycleService.ts` — all business logic; no HTTP concerns

**Verification:** All 5 CRUD operations work. User A cannot access User B's cycle (returns 404). Cycle length is correctly calculated. Pagination works (page 2 returns different results).

### Plan 2.2 — Symptom Endpoints
- POST `/api/symptoms` — log symptoms for a specific date; link to cycleId if provided; sanitize `notes` (strip HTML, limit 500 chars)
- PATCH `/api/symptoms/:id` — update any symptom fields; enforce userId scope
- GET `/api/cycles/:cycleId/symptoms` — all symptoms for a cycle, ordered by date
- GET `/api/symptoms/:id` — single entry; enforce userId scope
- DELETE `/api/symptoms/:id` — delete entry; enforce userId scope
- Zod schema: `mood` 1–5, `energyLevel` 1–5, `flowIntensity` 0–4, `painLevel` 0–5, `notes` string max 500, `date` ISO date
- Service: `symptomService.ts`

**Verification:** Log symptoms with all fields. Update partial fields (PATCH). List symptoms for a cycle returns correct entries. Cross-user access returns 404. Notes longer than 500 chars are rejected (400).

### Plan 2.3 — Cycle Stats + Integration Tests
- GET `/api/cycles/stats` — aggregate stats: average cycle length, average period length, most common symptoms, cycle regularity score
- All cycle + symptom endpoints have Jest + supertest integration tests
- Test coverage: happy path, auth required, cross-user isolation, validation errors, pagination
- Test setup: test database isolation with `beforeEach` Prisma seed + `afterEach` cleanup

**Verification:** Stats endpoint returns correct calculations for 3 test cycles. All integration tests pass. Jest `--coverage` shows ≥80% for cycles + symptoms modules.

**Success Criteria:**
1. User can log a cycle start, update it with end date, and see correct cycle length — verified by test
2. User can log daily symptoms linked to a cycle — verified by test
3. User A cannot read/modify User B's cycles or symptoms — verified by cross-user test
4. Symptom notes with HTML are sanitized before storage — verified by test
5. Stats endpoint returns correct average cycle length for 3+ cycles — verified by test
6. All Phase 2 endpoints have ≥80% test coverage — verified by Jest coverage report

---

## Phase 3: AI Service — Prediction + Insights

**Goal:** The Python FastAPI AI service is fully operational. Cycle prediction uses scikit-learn (with rolling-average fallback) and returns confidence levels. Symptom analysis uses GPT-4o with retry logic, structured prompts, and Pydantic-validated responses. Both are callable by the Node API.

**UI hint**: no

**Requirements:**
- PRED-01–05 (ML prediction, ovulation window, fallback, confidence level, user message)
- INSG-01–08 (async trigger, Bull-queued, structured GPT-4o insight, retry, store, retrieve, rate limit)

**Depends on:** Phase 1 (user auth feeds userId to AI service); Phase 2 (symptom data is AI input)

**Plans:**

### Plan 3.1 — FastAPI App Setup + Cycle Prediction Service
- `app/main.py`: FastAPI app with lifespan context manager (startup: load ML model from disk; shutdown: cleanup); CORS with `FRONTEND_URL`
- `GET /health` — returns `{ status, model_loaded, version }`
- `POST /predict/cycle` — accepts `CyclePredictionRequest` (list of cycle dicts with start/end dates); returns next period date, ovulation window start/end, confidence level
- `app/services/cycle_predictor.py`: fit `LinearRegression` / `Ridge` on historical cycle lengths; if <3 cycles use rolling average; return confidence: LOW (<3 cycles), MEDIUM (3–5), HIGH (>5)
- `app/schemas/cycle_schemas.py`: Pydantic v2 models for request + response
- `app/utils/errors.py`: custom `HTTPException` handlers; unhandled exceptions return structured JSON

**Verification:** `GET /health` returns 200. `POST /predict/cycle` with 5 historical cycles returns a date within expected range. With 1 cycle returns LOW confidence. With 0 cycles returns 28-day default. All validated via pytest.

### Plan 3.2 — OpenAI GPT-4o Symptom Analysis Service
- `app/utils/openai_client.py`: `AsyncOpenAI` singleton; tenacity retry decorator (`@retry(wait=wait_exponential(min=1, max=60), stop=stop_after_attempt(5), retry=retry_if_exception_type(RateLimitError))`)
- `app/services/symptom_analyzer.py`: build structured system prompt (never user-influenced); inject symptom data as structured JSON object (NOT string interpolation); parse response with Pydantic schema
- `POST /analyze/symptoms` — accepts `SymptomAnalysisRequest`; returns `{ pattern_summary, notable_symptoms, recommendation, generated_at }`
- Sanitize all free-text input before injecting into prompt (strip special chars, enforce 500-char limit)
- Validate OpenAI response against Pydantic schema; return error if response doesn't match
- `app/schemas/symptom_schemas.py`: Pydantic v2 models

**Verification:** `POST /analyze/symptoms` returns structured insight. Retries on simulated 429 (mock OpenAI in pytest). Response fails Pydantic validation with malformed OpenAI output — returns 422. Prompt injection in notes doesn't change response structure — verified by test.

### Plan 3.3 — Node API Integration: Trigger AI, Fetch Insights
- Node `insightService.ts`: call `POST http://ai-service:8000/analyze/symptoms` with user's symptom data; store result in `ai_insights` table
- Node `predictionService.ts`: call `POST http://ai-service:8000/predict/cycle` with user's cycle history; return prediction to client
- `POST /api/insights/trigger` (Node) — authenticated; validate user has ≥1 symptom logged; enqueue Bull job (JOBS covered in Phase 4, stub here); return 202 + jobId
- `GET /api/insights` (Node) — paginated list of stored insights (most recent first)
- `GET /api/insights/:id` (Node) — single insight; enforce userId scope
- `GET /api/cycles/prediction` (Node) — call FastAPI, return prediction + confidence
- Rate limit: 10 AI triggers per user per day (Redis counter: `rate:ai:{userId}:{date}`)

**Verification:** `GET /api/cycles/prediction` returns structured prediction when 3+ cycles logged. `POST /api/insights/trigger` returns 202 with jobId. Rate limit returns 429 after 10 requests. Insights are stored and retrievable. FastAPI is not reachable → Node API returns 503 with clear error.

### Plan 3.4 — AI Service Tests (pytest)
- Unit tests for `cycle_predictor.py`: test with 0, 1, 3, 8 cycles; verify confidence levels; verify fallback values
- Unit tests for `symptom_analyzer.py`: mock `AsyncOpenAI`; verify prompt structure; verify Pydantic parsing; verify retry fires on 429
- Integration tests for all FastAPI endpoints using `httpx.AsyncClient`
- Test: inject prompt-like text in notes field — verify response structure unchanged

**Verification:** `pytest --cov=app --cov-report=term` shows ≥80% coverage on all AI service modules. All tests pass.

**Success Criteria:**
1. `POST /predict/cycle` with 5 cycles returns HIGH confidence prediction — verified by pytest
2. `POST /predict/cycle` with 1 cycle returns LOW confidence + falls back to 28-day average — verified by pytest
3. `POST /analyze/symptoms` returns `{ pattern_summary, notable_symptoms, recommendation }` — verified by pytest with mocked OpenAI
4. OpenAI 429 error triggers retry with backoff; eventually succeeds — verified by pytest
5. `GET /api/cycles/prediction` on Node returns prediction from FastAPI — verified by supertest
6. Rate limit: 11th AI trigger request returns 429 — verified by supertest

---

## Phase 4: Background Jobs + Queue Infrastructure

**Goal:** All async operations (AI analysis, PDF generation, emails) are processed through Bull queues with proper error handling. Users can poll job status. Redis is used for Bull exclusively. No job silently fails.

**UI hint**: no

**Requirements:**
- JOBS-01–05 (ai-inference queue, pdf-generation queue, failed handlers, job cleanup, status endpoint)

**Depends on:** Phase 1 (Redis config, logger), Phase 2 (cycle data), Phase 3 (AI service callable)

**Plans:**

### Plan 4.1 — Queue Definitions + Configuration
- `src/queues/ai.queue.ts` — `new Bull('ai-inference', { redis: REDIS_URL, defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 } })`
- `src/queues/report.queue.ts` — `new Bull('pdf-generation', { ... attempts: 3, backoff: { type: 'fixed', delay: 5000 } })`
- Both queues exported as singletons (never re-instantiated)
- `GET /api/jobs/:jobId/status` — look up job across both queues; return `{ jobId, queue, state, progress, result?, failedReason? }`
- Queue utility: `getJobStatus(jobId)` checks ai queue first, then report queue

**Verification:** Queues connect to Redis on startup. `GET /api/jobs/nonexistent` returns 404. Adding a test job and polling status returns `waiting` → `active` → `completed`.

### Plan 4.2 — AI Inference Worker
- `src/workers/ai.worker.ts` — `aiQueue.process('symptom-analysis', CONCURRENCY, async (job) => { ... })`
- Worker flow: fetch latest symptoms for userId → call FastAPI `/analyze/symptoms` → store AiInsight in DB → return insight id
- `aiQueue.on('failed', async (job, err) => { logger.error(...); write AuditLog with error; update insight status to 'failed' if record exists })`
- `aiQueue.on('completed', (job) => { job.remove(); })` — clean completed jobs
- Max concurrency: configurable via `AI_WORKER_CONCURRENCY` env (default: 2)
- Worker started in `src/index.ts` after server starts (not in test environment: `if (process.env.NODE_ENV !== 'test')`)

**Verification:** Add job to `ai-inference` queue → worker picks it up → AiInsight row created in DB → job in `completed` state. Force FastAPI unavailable → job retries 5 times → `failed` event fires → AuditLog entry created.

### Plan 4.3 — Report Generation Worker (stub for Phase 5)
- `src/workers/report.worker.ts` — `reportQueue.process('generate-pdf', 1, async (job) => { ... })` (concurrency 1 — Puppeteer is memory-intensive)
- Stub worker: log job data, call placeholder `reportService.generateReport(userId)`, return jobId
- `reportQueue.on('failed', ...)` — same pattern as ai worker
- Full Puppeteer implementation in Phase 5; this phase wires the queue and tests the worker infrastructure

**Verification:** Add report job → stub worker runs → logs show job processed → job moves to completed. Failed stub worker triggers failed handler.

**Success Criteria:**
1. AI analysis job queued via `POST /api/insights/trigger` → picked up by worker → `AiInsight` stored in DB — verified by integration test
2. Worker retries failed job 5 times with exponential backoff — verified by mocking FastAPI to fail
3. Failed job after max attempts triggers `failed` handler → AuditLog entry created — verified by test
4. `GET /api/jobs/:jobId/status` returns correct state after job completion — verified by test
5. Completed jobs are removed from Redis after processing — verified by checking queue size

---

## Phase 5: PDF Reports + Email Delivery

**Goal:** Users can request a PDF health report covering the last 3 or 6 months. Reports are generated by Puppeteer from a Handlebars template, stored in S3, and emailed to the user. All delivery is queue-backed with retry.

**UI hint**: no

**Requirements:**
- RPRT-01–07 (request, async queue, report content, Puppeteer + Handlebars, S3 upload, history, download)
- MAIL-01–04 (report email, password reset email, queue-backed SMTP, branded template)

**Depends on:** Phase 1–4 (full stack operational: auth, data, AI, queues)

**Plans:**

### Plan 5.1 — Handlebars Templates + PDF Generation
- Create `src/templates/report.hbs` — full HTML report template with: header (user name, date range), cycle summary table (all cycles with dates + lengths), symptom trend section (most common moods/pain levels in text), AI insights section (latest 3 insights), prediction section (next period date + confidence)
- CSS embedded in template (print-optimized: A4, margins, page breaks)
- `src/utils/pdf.ts` — `generatePdf(data: ReportData): Promise<Buffer>` — compile Handlebars template, launch Puppeteer with `{ args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] }`, `page.setContent(html)`, `page.pdf({ format: 'A4', printBackground: true })`, timeout 30s
- `src/utils/s3.ts` — `uploadReport(userId, reportId, buffer): Promise<string>` — upload to `reports/{userId}/{reportId}.pdf`; `getPresignedUrl(key): Promise<string>` — generate 1h pre-signed URL

**Verification:** `generatePdf(testData)` returns non-empty Buffer. PDF renders correctly (check byte length > 5000). S3 upload succeeds (mock with localstack or check mock in test). Pre-signed URL generated with 3600s expiry.

### Plan 5.2 — Report Worker + Report Endpoints
- Full implementation of `src/workers/report.worker.ts`:
  - Fetch user cycles + symptoms + insights for requested date range (Prisma)
  - Call `generatePdf(reportData)` — full report data assembled
  - `uploadReport()` → get S3 key
  - `prisma.report.create({ data: { userId, fileUrl: s3Key, generatedAt: now() } })`
  - Queue email job: `emailQueue.add('report-delivery', { userId, email, reportId })`
- `POST /api/reports/generate` — `{ dateRange: '3mo' | '6mo' }` → queue job → return 202 + jobId
- `GET /api/reports` — list user's reports with `{ id, generatedAt, emailedAt, downloadUrl }`; `downloadUrl` is fresh pre-signed URL
- `GET /api/reports/:id/download` — generate fresh pre-signed URL for specific report; enforce userId scope

**Verification:** `POST /api/reports/generate` → worker runs → Report row created in DB → PDF file in S3 (mock) → email job queued. `GET /api/reports` returns report list with download URLs. Download URL for other user's report returns 404.

### Plan 5.3 — Email Service + Templates
- `src/utils/email.ts` — `createTransport()` using `SMTP_HOST/PORT/USER/PASS`; `sendMail(to, subject, html, attachments?)`
- `src/templates/email-report.hbs` — branded HTML email: Lunara AI header, body text, report attached as PDF
- `src/templates/email-reset.hbs` — password reset email: tokenized link with 1h expiry notice
- `src/queues/email.queue.ts` + email worker: `process('report-delivery', async (job) => { download PDF from S3, attach to email, sendMail })` — retry 3 times on SMTP failure
- `emailQueue.on('failed', ...)` — log failure, update `report.emailedAt` remains null (user can still download)
- Password reset flow (from Phase 1 stub): `POST /api/auth/forgot-password` now fully sends email via queue

**Verification:** Email worker sends report email with PDF attachment (mock SMTP with `nodemailer-mock`). Email to invalid SMTP retries 3 times. Password reset email sends with valid tokenized link. `report.emailedAt` is updated after successful email send.

### Plan 5.4 — End-to-End Report + Email Integration Tests
- Integration test: Register → log 3 cycles + symptoms → trigger report → poll job status → verify Report in DB → verify email queued
- Test: report generation with no cycles → returns 400 ("Insufficient data")
- Test: download URL for another user's report → 404
- Test: PDF bytes > 5000 (non-empty report)

**Verification:** All integration tests pass. Jest coverage ≥80% for report + email modules.

**Success Criteria:**
1. `POST /api/reports/generate` → report worker runs → PDF created with correct cycle data — verified by integration test
2. PDF is a valid non-empty file (>5000 bytes) — verified by buffer size check
3. Report emailed to user's registered email — verified by mock SMTP test
4. Email send retries 3 times on SMTP failure — verified by test
5. `GET /api/reports` returns list with fresh pre-signed download URLs — verified by test
6. User cannot download another user's report — verified by cross-user test

---

## Phase 6: Hardening, Testing + Integration Verification

**Goal:** Full test coverage across all modules (≥80%). Security audit confirms userId scoping on every query. All integration flows verified end-to-end. Application is ready to run in Docker Compose.

**UI hint**: no

**Requirements:** All (cross-cutting verification + testing across phases 1–5)

**Depends on:** Phases 1–5 complete

**Plans:**

### Plan 6.1 — Full Test Suite + Coverage Enforcement
- Run `jest --coverage` and identify all modules below 80% threshold
- Write missing unit tests: services, middleware, utils
- Write missing integration tests: cross-user access, rate limits, edge cases (empty data, invalid dates)
- Python: `pytest --cov=app` — identify gaps; add tests for prediction edge cases and OpenAI error paths
- Fix any failing tests found; ensure `npm test` and `pytest` both exit 0

**Verification:** `npm run test:coverage` passes with all modules ≥80%. `pytest --cov` passes with ≥80%. No test failures.

### Plan 6.2 — Security Audit + Cross-Cutting Fixes
- Audit every Prisma query in all services: confirm `userId` in `where` clause (cross-user test for each)
- Verify rate limiting on: `/api/auth/login` (5/15min per IP), `/api/insights/trigger` (10/day per user), global (100/15min per IP)
- Verify helmet headers present on all responses
- Verify no PII in Winston logs: grep log output for email/password/symptom content
- Verify JWT secret is ≥32 chars in `.env.example`; document rotation procedure in README
- Verify Puppeteer `--no-sandbox` flag set in PDF utility
- Verify S3 bucket policy is private; pre-signed URLs used for all access

**Verification:** Security audit checklist all green. Cross-user tests for all resource endpoints. Logs inspected — no PII found. Lighthouse-equivalent security check passes.

### Plan 6.3 — Docker Compose Integration + README
- Verify `docker-compose up` starts all 4 services (api, ai-service, postgres, redis) with healthchecks passing
- Verify api connects to postgres + redis after they are healthy (`depends_on: condition: service_healthy`)
- Verify ai-service logs `Model loaded` on startup
- Verify full flow in Docker: register → login → log cycle → log symptoms → trigger AI → poll job → get insights → request report → poll report job → get report list
- Update `README.md` with: prerequisites, env setup, Docker commands, running tests, project structure, API reference summary
- Add `GEMINI.md` with GSD workflow guidance

**Verification:** `docker-compose up` → all 4 containers healthy → full E2E flow completes → `docker-compose down` cleans up. README reviewed for accuracy.

**Success Criteria:**
1. `npm run test:coverage` exits 0 with all modules ≥80% — verified by CI-equivalent run
2. `pytest --cov=app` exits 0 with ≥80% — verified locally
3. Every cycle/symptom/insight/report endpoint has a cross-user isolation test — verified by test inventory
4. `docker-compose up` → all containers healthy — verified by `docker ps` healthcheck status
5. Full E2E flow (register → insight → report) works in Docker — verified manually
6. README documents all setup steps accurately — verified by following instructions fresh

---

## Requirement Traceability

| Requirement ID | Phase | Status |
|----------------|-------|--------|
| AUTH-01–07 | Phase 1 | Pending |
| PROF-01–03 | Phase 1 | Pending |
| INFR-01–04 | Phase 1 | Pending |
| SECU-01–06 | Phase 1 | Pending |
| CYCL-01–05 | Phase 2 | Pending |
| SYMP-01–05 | Phase 2 | Pending |
| PRED-01–05 | Phase 3 | Pending |
| INSG-01–08 | Phase 3 | Pending |
| JOBS-01–05 | Phase 4 | Pending |
| RPRT-01–07 | Phase 5 | Pending |
| MAIL-01–04 | Phase 5 | Pending |
| All (55) | Phase 6 | Pending |

**Coverage:** 55 / 55 v1 requirements mapped ✓

---
*Roadmap created: 2026-04-25*
*Last updated: 2026-04-25 after initial creation*

---

## Phase 7: Frontend Foundation

**Goal:** Initialize the Vite + React application in the \web/\ directory. Configure Tailwind CSS with the "Calm Intelligence" design system tokens. Implement the API service layer with Axios interceptors for JWT refresh rotation. Set up basic routing and the auth context/zustand store.

**UI hint**: yes

**Requirements:**
- UI-BASE-01: Vite + React (TS) scaffold in \web/\
- UI-BASE-02: Tailwind CSS config with Lavender/Soft Pink/Peach palette
- UI-BASE-03: Typography setup (Outfit + Inter)
- UI-BASE-04: Axios interceptors for 401/refresh handling
- UI-BASE-05: Zustand store for Auth and User profile
- UI-BASE-06: Basic layout (Navigation + Main container)

**Depends on:** Milestone 1 (Backend API)

**Plans:**

### Plan 7.1 � Vite Scaffold + Design System
- Run \
pm create vite@latest web -- --template react-ts\
- Install dependencies: \	ailwindcss\, \postcss\, \utoprefixer\, \lucide-react\, \ramer-motion\
- Configure \	ailwind.config.js\ with custom colors and typography
- Set up \src/index.css\ with Google Fonts imports and reset
- Create atomic components for \Button\, \Card\, and \Input\ following the "Calm Intelligence" spec

**Verification:** \
pm run dev\ starts; home page displays with "Outfit" font and Lavender background; Tailwind utilities work.

### Plan 7.2 � API Client + Auth Store
- Install \xios\, \zustand\, \@tanstack/react-query\
- Create \src/api/client.ts\ with base URL and response interceptor for 401s
- Implement \uthStore.ts\ using Zustand to persist access token and user info
- Add \useAuth\ hook to manage login/logout actions and token storage
- Create \uthService.ts\ for login, register, and refresh endpoints

**Verification:** Mock 401 response triggers refresh call; successful login updates Zustand state; token is included in subsequent request headers.

### Plan 7.3 � Routing + Main Layout
- Install \eact-router-dom\
- Create \src/routes/AppRoutes.tsx\ with Auth guards (Protected vs Public routes)
- Implement \MainLayout\ with side navigation (Dashboard, Logger, Insights, Analytics, Settings)
- Create placeholder pages for all routes to verify navigation
- Set up \src/App.tsx\ with QueryClientProvider and Router

**Verification:** Navigating to protected route without token redirects to Login; successful login allows access to Dashboard; Layout is responsive.

**Success Criteria:**
1. \web/\ directory exists with a functional Vite app � verified by \ls\ and \
pm run build\
2. Tailwind colors and fonts match the "Calm Intelligence" spec � verified by visual check
3. API interceptor successfully handles token refresh � verified by integration test
4. Zustand store persists user auth state � verified by devtools/test
5. Protected routes redirect correctly � verified by manual test
