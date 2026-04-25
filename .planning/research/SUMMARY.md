# Research Summary

**Project:** Lunara AI — Women's Health AI Platform
**Synthesized:** 2026-04-25

## Key Findings

### Stack
- **Fixed and established:** Node.js 20 + TypeScript 5 + Express 4 + Prisma 5 (API); Python 3.11 + FastAPI 0.110 (AI service); PostgreSQL 15 + Redis 7 (data + queues)
- **AI:** OpenAI GPT-4o (Python SDK v1.x `AsyncOpenAI`) for symptom insights; scikit-learn 1.4 + statsmodels 0.14 for cycle prediction regression
- **Queues:** Bull 4 (not BullMQ — stability); workers in Node calling FastAPI via HTTP
- **PDF:** Puppeteer 22 + Handlebars 4.7; requires `--no-sandbox` in Docker
- **Critical version notes:** `openai@4.x` (Node) breaks v3 API; Prisma 5 requires `@prisma/client@5` exact match; FastAPI 0.110+ requires Pydantic v2

### Table Stakes (must ship in v1)
1. Registration + login + JWT auth + password reset
2. Cycle logging (start/end date → auto-calculated length)
3. Daily symptom logging (mood, flow, pain, energy, notes)
4. Period prediction + ovulation window (ML + average fallback)
5. AI symptom analysis via GPT-4o (async, Bull-queued)
6. PDF health report generation (Puppeteer + Handlebars)
7. Email report delivery (Nodemailer)
8. Cycle history + basic statistics

### Architecture Decisions Confirmed
- **Async boundary is critical:** All AI calls and PDF generation go through Bull queues — never synchronously in HTTP handlers
- **Prisma singleton pattern is not optional** — connection pool exhaustion kills production
- **FastAPI is stateless** — Node workers call it via HTTP; no shared state between services
- **All DB queries must include `userId` scope** — prevents horizontal privilege escalation on health data
- **S3 pre-signed URLs for reports** — bucket stays private always

### Watch Out For (Critical Pitfalls)
1. **Prisma multi-instance** → connection pool exhaustion (Phase 1)
2. **OpenAI rate limits without retry** → jobs fail silently (Phase 3)
3. **userId missing from queries** → privilege escalation on health data (All phases)
4. **Puppeteer in Docker without --no-sandbox** → PDF worker hangs (Phase 5)
5. **JWT refresh token reuse** → permanent account compromise (Phase 1)
6. **Bull jobs without failed handler** → silent failures, Redis bloat (Phase 4)
7. **Prompt injection via symptom notes** → GPT-4o behavior change (Phase 3)

## Build Order (Derived from Dependencies)

```
Phase 1: Auth + DB Schema + Prisma  ← Everything depends on this
    ↓
Phase 2: Cycle & Symptom Logging    ← AI needs logged data to analyze
    ↓
Phase 3: AI Service (FastAPI + OpenAI + ML)  ← Core differentiator
    ↓
Phase 4: Background Jobs (Bull Workers)     ← Async bridge between API and AI
    ↓
Phase 5: PDF Reports + Email Delivery      ← Requires data from phases 1-4
    ↓
Phase 6: Security Hardening + Testing      ← Cross-cutting; verify before ship
```

## Files

- [STACK.md](.planning/research/STACK.md) — Technology choices with versions and rationale
- [FEATURES.md](.planning/research/FEATURES.md) — Feature landscape, MVP definition, competitor analysis
- [ARCHITECTURE.md](.planning/research/ARCHITECTURE.md) — System design, data flow, DB schema, folder structure
- [PITFALLS.md](.planning/research/PITFALLS.md) — 8 critical pitfalls with prevention strategies + phase mapping

---
*Research synthesized: 2026-04-25*
