# Phase 1: Foundation — Auth + DB + API Core - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Source:** Requirements + Roadmap (no discuss-phase — user proceeded directly to planning)

<domain>
## Phase Boundary

Build the complete foundation that every subsequent phase depends on:
- Full Prisma schema (7 tables: User, Cycle, Symptom, AiInsight, Report, AuditLog, RefreshToken)
- Express app factory with full middleware stack (helmet, cors, rate-limit, json, logger)
- JWT auth with refresh token rotation (bcrypt hashing, stored as hash in DB)
- Password reset via email token (queued via Bull stub — email sent in Phase 5)
- User profile CRUD endpoints
- Audit logging middleware on all mutating routes
- Graceful shutdown with Prisma disconnect

No frontend. No AI. No queues (stubs only). No PDF. No email. Pure backend foundation.
</domain>

<decisions>
## Implementation Decisions

### Authentication Strategy
- **D-01:** JWT access token (15min TTL) delivered in JSON response body as `{ accessToken }` — client stores in memory
- **D-02:** Refresh token (30d TTL) stored as bcrypt hash in `RefreshToken` table — full rotation on every `/auth/refresh` call (old token marked `used: true`, new token issued)
- **D-03:** Token reuse detection: if a `used: true` refresh token is presented, invalidate ALL user sessions (revoke all RefreshTokens for that userId) — possible theft indicator
- **D-04:** bcrypt rounds: 12 for passwords, 10 for refresh token hashes
- **D-05:** JWT payload: `{ userId, email, iat, exp }` — signed with HS256 + `JWT_SECRET`

### Password Reset
- **D-06:** Reset token: UUID stored in `PasswordResetToken` table (not hashed), TTL 1 hour, single-use
- **D-07:** `/api/auth/forgot-password` returns `{ message: "If that email exists, a reset link was sent" }` regardless of whether user exists (prevents email enumeration)
- **D-08:** In Phase 1, email is NOT actually sent — the token is returned in the response body in `NODE_ENV=development` only; in production the Bull job is queued but email worker is a no-op until Phase 5

### Prisma Schema
- **D-09:** Numeric scales for symptoms: `mood Int?` (1–5), `energyLevel Int?` (1–5), `flowIntensity Int?` (0–4), `painLevel Int?` (0–5) — simple integers, not enums
- **D-10:** `cycleLength Int?` is STORED (computed from startDate/endDate and persisted) — enables fast stats queries without recomputing
- **D-11:** All user-owned tables use `userId String` FK with `@relation(fields: [userId], references: [id], onDelete: Cascade)`
- **D-12:** `AuditLog` does NOT cascade delete — logs stay for compliance even after user deletion; `userId` set to null on user delete via `@relation(onDelete: SetNull)`

### Middleware Order
- **D-13:** Middleware order in `src/app.ts`: `helmet()` → `cors({ origin: FRONTEND_URL })` → `express.json({ limit: '10kb' })` → `rateLimiter` → request logger → routes → 404 handler → global error handler
- **D-14:** Rate limit: 100 requests per 15 minutes per IP globally; auth routes get stricter: 10 req/15min per IP; login specifically: 5 req/15min per IP

### Error Handling
- **D-15:** All errors return `{ success: false, error: { code: string, message: string, details?: any } }`
- **D-16:** `AppError` class: `constructor(message, statusCode, code?)` where `code` defaults to HTTP status text
- **D-17:** `asyncHandler` wraps async route handlers to catch rejections and pass to `next(err)`

### Security Pattern
- **D-18:** Every Prisma query on user-owned data MUST include `userId` in where clause — enforced by convention, verified by integration tests
- **D-19:** Winston logs include: `level`, `message`, `timestamp`, `requestId` (UUID per request), `userId` (if auth), `method`, `path`, `statusCode`, `duration` — NO body content, NO symptom data

### the agent's Discretion
- Exact Prisma migration naming convention
- Winston transport configuration details (file vs console)
- Rate limiter keyGenerator function implementation
- Seed data content (as long as it covers test coverage needs)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Planning
- `.planning/PROJECT.md` — Project vision, constraints, tech stack decisions
- `.planning/REQUIREMENTS.md` — Full requirement list: AUTH-01–07, PROF-01–03, INFR-01–04, SECU-01–06
- `.planning/ROADMAP.md` — Phase 1 success criteria and plan breakdown

### Research
- `.planning/research/STACK.md` — Library versions and compatibility notes
- `.planning/research/PITFALLS.md` — Critical pitfalls: Prisma singleton (Pitfall 2), JWT refresh rotation (Pitfall 7), userId scope (Pitfall 8)
- `.planning/research/ARCHITECTURE.md` — Folder structure, DB schema design, data flow

### No external specs — requirements fully captured in decisions above
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield. Phase 0 created the scaffold (package.json, tsconfig, docker-compose) but no src/ code exists.

### Established Patterns
- None yet — this phase establishes all patterns that subsequent phases follow.

### Integration Points
- `prisma/schema.prisma` → generates `@prisma/client` types used by all subsequent phases
- `src/lib/prisma.ts` (singleton) → imported by all services in Phases 2–5
- `src/utils/errors.ts` (AppError + asyncHandler) → used by all route handlers in Phases 2–5
- `src/middleware/auth.middleware.ts` → protects all routes in Phases 2–5
- `src/utils/logger.ts` → imported by all modules in Phases 2–5
</code_context>

<specifics>
## Specific Ideas

- Prisma singleton must use the `globalThis` pattern specifically to prevent hot-reload issues:
  ```typescript
  const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: [...] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
  ```
- JWT middleware must add `req.userId` to Express Request type (module augmentation in `src/types/express.d.ts`)
- All route files must export a Router — no route logic in `src/index.ts`
- `GET /health` must return within 50ms and not require authentication
</specifics>

<deferred>
## Deferred Ideas

- Email actually sending (Phase 5 — Nodemailer + Bull email worker)
- Bull queue full wiring (Phase 4 — queue infrastructure)
- OAuth / social login — explicitly out of scope for v1
- 2FA — out of scope for v1
</deferred>

---

*Phase: 01-foundation-auth-db-api-core*
*Context gathered: 2026-04-25 via requirements (no discuss-phase)*
