# Lunara AI

## What This Is

Lunara AI is a women's health platform that uses hybrid AI (OpenAI GPT-4o + custom ML models) to deliver accurate menstrual cycle prediction, intelligent symptom analysis, and automated PDF health reports. It is built for individual women who want deeply personalized, private health insights — no healthcare provider integrations, no data sharing. The backend is a Node.js/TypeScript REST API paired with a Python FastAPI AI inference service, backed by PostgreSQL and Redis.

## Core Value

An individual woman can log her cycle and symptoms and receive accurate AI-powered predictions, contextual insights, and downloadable health reports — all from a single private account.

## Requirements

### Validated

- [x] AI service predicts next period date and ovulation window from logged data (Phase 3)
- [x] AI service analyzes symptoms and returns personalized health insights (Phase 3)
- [x] User can log menstrual cycle dates and symptoms daily (Phase 2)
- [x] All AI interactions are logged and auditable (Phase 1/2/3 coverage)
- [x] User can register, log in, and manage a secure personal account with JWT auth (Phase 1)
- [x] API is secured with rate limiting, helmet, CORS, and structured error handling (Phase 1)
- [x] System health is observable via structured Winston logs (Phase 1)

### Active

- [ ] System generates a downloadable PDF health report on demand
- [ ] Reports are delivered via email using Nodemailer
- [ ] Background jobs process AI inference and report generation asynchronously via Bull queues

### Out of Scope

- Healthcare provider portals / patient-doctor sharing — personal use only, v1
- HIPAA full compliance (BAAs, certified infra) — startup-grade security only, add later
- Mobile app — web-first, mobile deferred
- Social features (community, sharing) — private individual use
- Payment / subscription tiers — free for v1
- OAuth (Google, Apple) — email/password sufficient for v1
- Real-time push notifications — email-only for v1
- Custom AI model training pipeline — scikit-learn inference only in v1, training offline

## Context

- **Tech stack settled:** Node.js 20 LTS + TypeScript 5 + Express 4 API; Python 3.11 + FastAPI 0.110 AI service; PostgreSQL 15; Redis 7; Docker Compose orchestration
- **AI approach:** Hybrid — OpenAI GPT-4o for natural language symptom insights + custom scikit-learn/statsmodels models for cycle prediction (deterministic math + ML)
- **Monorepo scaffold exists:** Phase 0 created the directory structure, package.json, tsconfig, requirements.txt, and docker-compose.yml — the scaffold is the starting point
- **PDF reports:** Puppeteer + Handlebars for HTML-to-PDF; reports stored in S3-compatible bucket, emailed via Nodemailer
- **Queue system:** Bull (Redis-backed) for async AI inference jobs and report generation — prevents blocking HTTP responses
- **Compliance posture:** Startup-grade — bcrypt password hashing, JWT with refresh tokens, encryption at rest (Prisma/Postgres), audit log table, HTTPS enforced
- **Data sensitivity:** No PHI sharing with third parties; user data partitioned by userId in all tables

## Constraints

- **Tech stack:** Node.js + TypeScript + Express (API), Python + FastAPI (AI) — fixed from Phase 0 scaffold
- **AI APIs:** OpenAI GPT-4o for insights; no budget for fine-tuning in v1 — use prompt engineering
- **Infrastructure:** Docker Compose for local dev; deployment target TBD (Render/Railway) — no Kubernetes in v1
- **Testing:** Jest (API) + pytest (AI service); 80% coverage threshold — enforced before phase advance
- **Performance:** API p95 < 500ms for sync endpoints; async jobs via Bull for anything > 1s
- **Security:** bcrypt, JWT RS256 or HS256+refresh, rate limiting, helmet, no raw SQL (Prisma only)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid AI (OpenAI + scikit-learn) | GPT-4o excels at nuanced symptom language; deterministic ML for cycle math is more reliable and cheaper | — Pending |
| Bull queues for AI jobs | AI inference can take 2-10s; async queues prevent HTTP timeouts and enable retry logic | — Pending |
| Prisma ORM | Type-safe queries, auto-migrations, schema-first — prevents SQL injection and drift | — Pending |
| Python AI service separate from Node API | ML libraries (pandas, scikit-learn, statsmodels) don't run cleanly in Node; isolation enables independent scaling | — Pending |
| JWT + refresh token auth | Stateless, scalable; refresh tokens enable long sessions without DB lookups on every request | — Pending |
| PDF via Puppeteer + Handlebars | Battle-tested HTML-to-PDF; Handlebars templates allow non-engineer report customization | — Pending |
| Startup-grade compliance (not full HIPAA) | Full HIPAA requires significant infra cost and legal overhead; encryption + audit logs sufficient for v1 launch | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-26 after Phase 3 completion*
