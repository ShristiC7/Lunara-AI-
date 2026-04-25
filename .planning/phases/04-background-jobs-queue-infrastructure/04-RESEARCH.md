---
phase: "04"
topic: "Background Jobs + Queue Infrastructure"
updated: 2026-04-26
---

# Phase 4 Research: Background Jobs (Bull + Redis)

## 1. Queue Architecture
Bull is a Redis-based queue for Node.js. It's stable and widely used in the Express ecosystem.
- **Queue Instance**: Acts as the entry point to submit jobs.
- **Worker**: Listens for jobs on the queue and executes them (`process` method).
- **Events**: Global handlers for job success/failure.

## 2. Singleton Queue Pattern
Queues should be singletons to avoid multiple connections to Redis.
- File: `src/queues/index.ts` or individual `src/queues/*.queue.ts`.
- Environment Variables: `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`.

## 3. Worker Strategy & Concurrency
- **AI Worker**: Since calling FastAPI is I/O-bound (waiting for HTTP), concurrency can be higher (e.g., 5-10) as it doesn't consume much local CPU/Mem.
- **Report Worker**: Phase 5 will use Puppeteer, which is memory-bound. Concurrency should be low (e.g., 1-2) to avoid OOM in some environments (like smaller Render/Railway instances).

## 4. Test Strategy (Crucial)
Given the Windows environment restrictions (no local Redis/Postgres) and the need for test reliability:
- Use `ioredis-mock` for local Redis simulation in Jest.
- Mock the `Queue` and `Worker` objects as needed if they are too heavy for simple unit tests.
- For integration tests, we need a way to ensure the worker starts and processes synchronously or we wait for completion.

## 5. Job Status & Persistence
- `removeOnComplete`: Keep only the last N completed jobs.
- `removeOnFail`: Keep only the last N failed jobs for debugging.
- Status Endpoint: `GET /api/jobs/:id/status`. Bull provides `getJobState`, `getJob`, etc.

## 6. Security & Isolation
- All jobs injected with `userId`.
- Workers must verify resource ownership if necessary (though they are internal).
- Sensitive errors (like raw API errors) should be logged securely, but simplified in the `failedReason` if exposed to users.

## Next Steps for Planning
- Plan 4.1: Queue setup, configuration, and status endpoints.
- Plan 4.2: AI Worker implementation (migration of analysis from sync to async).
- Plan 4.3: Report Worker stub and infra verification.
- Plan 4.4: Full integration tests for the job lifecycle.
