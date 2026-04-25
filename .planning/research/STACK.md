# Stack Research

**Domain:** Women's Health AI Platform (Node.js + Python hybrid backend)
**Researched:** 2026-04-25
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 20 LTS | API runtime | Active LTS, native fetch, improved ESM; stable for production |
| TypeScript | 5.4.x | Type safety | Template literal types, const type params; eliminates runtime type bugs |
| Express | 4.18.x | HTTP framework | Battle-tested, minimal overhead, rich middleware ecosystem |
| Prisma | 5.14.x | ORM + migrations | Type-safe queries, schema-first migrations, auto-generated client |
| PostgreSQL | 15-alpine | Primary database | JSON support, full-text search, row-level security, mature |
| Redis | 7-alpine | Queue + cache | Fast pub/sub, Bull requires Redis 6+; LRU eviction for sessions |
| Python | 3.11 | AI service runtime | Required for scikit-learn, statsmodels; 3.11 has 25% speed improvement |
| FastAPI | 0.110.x | AI service framework | Async-first, Pydantic v2, automatic OpenAPI, superior to Flask for ML APIs |
| OpenAI SDK | 1.x (Python) / 4.x (Node) | GPT-4o integration | Official SDK, streaming support, typed responses |
| scikit-learn | 1.4.x | ML cycle prediction | Standard for regression/classification; good joblib serialization |
| statsmodels | 0.14.x | Time-series cycle math | ARIMA patterns for cycle regularity analysis |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| bull | 4.12.x | Job queues (Node) | All async AI inference + PDF generation jobs |
| socket.io | 4.7.x | Real-time (optional v1) | Future: live job status updates |
| winston | 3.13.x | Structured logging | All server-side logging with JSON format |
| jsonwebtoken | 9.0.x | JWT sign/verify | Auth tokens — use with RS256 or strong HS256 secret |
| bcrypt | 5.1.x | Password hashing | Registration + login — bcrypt over argon2 for simplicity |
| zod | 3.22.x | Runtime validation | Validate all request bodies + OpenAI response parsing |
| cors | 2.8.x | CORS headers | API gateway layer |
| helmet | 7.1.x | Security headers | All HTTP security headers in one middleware |
| express-rate-limit | 7.x | Rate limiting | Per-IP limits on auth + AI endpoints |
| puppeteer | 22.x | PDF generation | Headless Chrome for HTML-to-PDF reports |
| handlebars | 4.7.x | Template engine | Report HTML templating |
| nodemailer | 6.9.x | Email sending | Report delivery + password reset |
| uuid | 9.0.x | ID generation | Correlation IDs for audit logs |
| pydantic | 2.6.x | Data validation (Python) | FastAPI request/response models |
| tenacity | 8.x | Retry logic (Python) | OpenAI API retry with exponential backoff |
| structlog | 24.x | Structured logging (Python) | JSON logs matching Node.js format |
| joblib | 1.3.x | Model serialization | Save/load scikit-learn models efficiently |
| pandas | 2.2.x | Data processing | Cycle data manipulation for ML training |
| numpy | 1.26.x | Numerical computing | Cycle math, statistics |
| scipy | 1.12.x | Scientific computing | Probability distributions for prediction confidence |
| httpx | 0.27.x | HTTP client (Python) | FastAPI test client + async HTTP requests |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ts-node-dev | Hot reload TypeScript | `--respawn --transpile-only` for fast dev cycle |
| jest | Node.js testing | ts-jest transformer; 80% coverage threshold enforced |
| supertest | HTTP integration tests | Works with Express app directly without server start |
| eslint | Linting | @typescript-eslint/parser + recommended rules |
| prettier | Code formatting | Consistent style; run pre-commit |
| uvicorn | ASGI server | `--reload` for dev; `--workers 4` for prod |
| pytest | Python testing | pytest-asyncio for async FastAPI tests |
| httpx | FastAPI test client | Use `httpx.AsyncClient` with `app` for integration tests |
| Docker Compose | Local orchestration | All services + healthchecks in one command |
| prisma studio | DB GUI | `npx prisma studio` — visual data browser |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Prisma 5 | TypeORM / Sequelize | If team prefers Active Record pattern or needs complex raw SQL |
| Bull 4 | BullMQ | BullMQ is superior for new projects; Bull chosen for stability + ecosystem maturity |
| Express 4 | Fastify | Fastify is faster but Express has broader middleware compatibility |
| OpenAI Python SDK | LangChain | LangChain adds abstraction overhead; overkill for targeted prompts |
| scikit-learn | PyTorch | PyTorch is overkill for regression-based cycle prediction |
| jsonwebtoken | jose | jose supports more algorithms; jsonwebtoken sufficient for HS256/RS256 |
| nodemailer | SendGrid SDK | SendGrid SDK requires paid plan; nodemailer works with any SMTP |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| mongoose / MongoDB | Health cycle data is relational; joins are critical | PostgreSQL + Prisma |
| passport.js | Heavyweight; manual JWT is simpler and more transparent | jsonwebtoken directly |
| axios (in Node API) | Not needed when using supertest for tests; adds dep | node-fetch / native fetch |
| pdf-lib / pdfkit | Cannot render complex HTML layouts | Puppeteer (HTML → PDF) |
| celery (Python) | Overkill; Bull (Node) owns the queue | Bull workers in Node calling FastAPI |
| Flask | Synchronous by default; poor for concurrent AI requests | FastAPI (async-first) |
| openai@3.x | Deprecated; v4 has breaking changes and new interface | openai@4.x (new SDK) |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| prisma@5.x | @prisma/client@5.x | Must match exactly — install together |
| bull@4.x | ioredis@5.x | Bull 4 uses ioredis internally; don't install ioredis separately |
| openai@4.x (Node) | Node.js 18+ | v4 SDK uses ES modules; ensure tsconfig moduleResolution: "node" |
| puppeteer@22.x | Chrome 123+ | Auto-downloads Chromium; add `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` for Docker |
| fastapi@0.110 | pydantic@2.x | FastAPI 0.100+ requires Pydantic v2; Pydantic v1 style deprecated |
| bcrypt@5.x | Node.js 20 | Native bindings; requires `node-gyp` on build — use alpine with build-essentials |

## Sources

- OpenAI SDK v4 migration guide (openai.com/docs)
- Prisma 5 changelog — JSON protocol, improved performance
- FastAPI 0.110 release notes — Pydantic v2 integration
- Bull vs BullMQ comparison (optimalbits/bull GitHub)
- Puppeteer Docker best practices (pptr.dev/guides/docker)

---
*Stack research for: Lunara AI - Women's Health Platform*
*Researched: 2026-04-25*
